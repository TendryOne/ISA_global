# 🧪 Plan de Tests - Refactoring Système d'Inscription

## ✅ Tests à Exécuter

### 1. Test Nominal - Inscription Complète Réussie

**Objectif** : Vérifier que tout fonctionne correctement dans le cas nominal

**Étapes** :

1. Démarrer le serveur
2. Envoyer une requête POST avec tous les fichiers requis
3. Vérifier la réponse (200 avec inscriptionNumber)
4. Vérifier dans MongoDB :
   - Nouveau document `pendingStudents` créé
   - Compteur `Counter` incrémenté
5. Vérifier le système de fichiers :
   - Dossier `temp/uploads/` vide
   - Dossier `private/inscription/{filiere}/{inscriptionNumber}/` contient 3-4 fichiers .webp

**Commande Test** :

```bash
curl -X POST http://localhost:4000/api/v1/pendingUsers \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "email=test@example.com" \
  -F "field=informatique" \
  -F "identityPhoto=@path/to/photo.jpg" \
  -F "idDocument=@path/to/id.jpg" \
  -F "residenceCertificate=@path/to/cert.jpg" \
  -F "... (autres champs)"
```

**Résultat Attendu** :

```json
{
  "success": true,
  "inscriptionNumber": "ETU-INFO-2025-0001"
}
```

---

### 2. Test Erreur - Email Existant

**Objectif** : Vérifier que le rollback fonctionne si l'email existe déjà

**Étapes** :

1. Créer un étudiant avec email `test@example.com`
2. Essayer de créer un autre étudiant avec le même email
3. Vérifier :
   - Erreur 409 retournée
   - Dossier `temp/` nettoyé
   - Aucun dossier créé dans `private/`
   - Compteur MongoDB **NON incrémenté** (rollback)

**Commande Test** :

```bash
# Première inscription (devrait réussir)
curl -X POST http://localhost:4000/api/v1/pendingUsers ...

# Deuxième inscription avec même email (devrait échouer)
curl -X POST http://localhost:4000/api/v1/pendingUsers ...
```

**Résultat Attendu** :

```json
{
  "error": "Certaines informations sont déjà utilisées..."
}
```

**Vérifications MongoDB** :

```javascript
// Le compteur ne devrait pas avoir augmenté
db.counters.find({ filiere: "INFO", year: 2025 });
// { sequence: 1 } et pas 2
```

---

### 3. Test Erreur - Fichier Manquant

**Objectif** : Vérifier la gestion d'erreur avant la transaction

**Étapes** :

1. Envoyer une requête sans `idDocument`
2. Vérifier :
   - Erreur 400 retournée immédiatement
   - Dossier `temp/` nettoyé
   - **Aucune transaction MongoDB démarrée**
   - Compteur **NON incrémenté**

**Commande Test** :

```bash
curl -X POST http://localhost:4000/api/v1/pendingUsers \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "identityPhoto=@photo.jpg" \
  # ❌ Manque idDocument et residenceCertificate
```

**Résultat Attendu** :

```json
{
  "error": "Fichiers requis manquants"
}
```

---

### 4. Test Erreur - Fichier Trop Gros

**Objectif** : Vérifier la limite de taille (3MB)

**Étapes** :

1. Créer un fichier > 3MB
2. Envoyer la requête
3. Vérifier :
   - Erreur 400 "Le fichier dépasse 3Mo"
   - Dossier `temp/` nettoyé
   - Compteur NON incrémenté

**Commande Test** :

```bash
# Créer un fichier de 4MB
dd if=/dev/zero of=big_file.jpg bs=1M count=4

curl -X POST http://localhost:4000/api/v1/pendingUsers \
  -F "identityPhoto=@big_file.jpg" \
  ...
```

**Résultat Attendu** :

```json
{
  "error": "Le fichier dépasse 3Mo."
}
```

---

### 5. Test Erreur - Format Fichier Invalide

**Objectif** : Vérifier que seuls PNG/JPEG sont acceptés

**Étapes** :

1. Envoyer un fichier .pdf ou .txt
2. Vérifier :
   - Erreur retournée
   - Fichiers nettoyés

**Commande Test** :

```bash
curl -X POST http://localhost:4000/api/v1/pendingUsers \
  -F "identityPhoto=@document.pdf" \
  ...
```

**Résultat Attendu** :

```json
{
  "error": "Seuls les fichiers PNG et JPEG sont autorisés."
}
```

---

### 6. Test Performance - Concurrence

**Objectif** : Vérifier que les numéros d'inscription sont uniques même en cas de requêtes concurrentes

**Étapes** :

1. Lancer 10 inscriptions simultanées
2. Vérifier :
   - Tous les numéros sont uniques
   - Aucun trou dans la séquence
   - Tous les dossiers créés correctement

**Script Test** :

```bash
#!/bin/bash
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/v1/pendingUsers \
    -F "email=test$i@example.com" \
    ... &
done
wait

# Vérifier dans MongoDB
mongo
> db.pendingstudents.find({}).sort({inscriptionId: 1})
# Devrait afficher : ETU-INFO-2025-0001, 0002, 0003... sans trous
```

---

### 7. Test Stress - Simulation de Crash

**Objectif** : Vérifier la robustesse en cas d'erreur système

#### 7.1 Crash pendant la transaction

```bash
# Démarrer MongoDB en mode debug
# Pendant une inscription, tuer le process MongoDB
kill -9 $(pgrep mongod)

# Vérifier après redémarrage :
# - Dossiers temp/ nettoyés
# - Compteur cohérent (transaction rollback automatique)
```

#### 7.2 Crash serveur Node.js

```bash
# Pendant une inscription, redémarrer le serveur
pm2 restart backend-isa

# Vérifier :
# - Dossiers orphelins dans temp/ (à nettoyer manuellement au redémarrage)
# - Pas de données incohérentes en DB
```

---

### 8. Test Anti-Spam

**Objectif** : Vérifier le champ honeypot

**Étapes** :

1. Envoyer une requête avec `website` rempli
2. Vérifier :
   - Erreur 400 "Requête invalide"
   - Aucune transaction démarrée

**Commande Test** :

```bash
curl -X POST http://localhost:4000/api/v1/pendingUsers \
  -F "website=http://spam.com" \
  -F "..." \
```

**Résultat Attendu** :

```json
{
  "error": "Requête invalide."
}
```

---

### 9. Test Rate Limiting

**Objectif** : Vérifier la limite de 5 inscriptions/15min

**Étapes** :

1. Envoyer 5 inscriptions valides depuis la même IP
2. Envoyer une 6ème inscription
3. Vérifier :
   - Erreur 429 "Trop de tentatives"

**Script Test** :

```bash
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/v1/pendingUsers \
    -F "email=test$i@example.com" \
    ...
done
```

**Résultat Attendu (6ème requête)** :

```json
{
  "error": "Trop de tentatives d'inscription. Réessayez plus tard."
}
```

---

### 10. Test Compression Images

**Objectif** : Vérifier la conversion en WebP

**Étapes** :

1. Uploader une image JPEG de 2MB
2. Vérifier :
   - Fichier dans `private/` est .webp
   - Taille réduite (~80-85% de qualité)
   - Fichier original supprimé du temp/

**Commande Test** :

```bash
# Uploader une grande image
curl -X POST http://localhost:4000/api/v1/pendingUsers \
  -F "identityPhoto=@large_photo.jpg" \
  ...

# Vérifier le fichier final
ls -lh private/inscription/informatique/ETU-INFO-2025-0001/
# Devrait montrer des fichiers .webp avec taille réduite
```

---

## 📊 Checklist de Validation

Après tous les tests, vérifier :

### MongoDB

- [ ] Compteur de séquence cohérent (pas de trous)
- [ ] Collection `pendingStudents` contient les bons enregistrements
- [ ] Pas de documents orphelins

### Système de Fichiers

- [ ] Dossier `temp/uploads/` est vide
- [ ] Tous les dossiers dans `private/inscription/` correspondent à des enregistrements DB
- [ ] Tous les fichiers sont en .webp
- [ ] Pas de fichiers orphelins

### Logs

- [ ] Pas d'erreurs non gérées dans les logs
- [ ] Messages d'erreur clairs et informatifs
- [ ] Transactions rollback correctement loggées

---

## 🐛 Bugs Potentiels à Surveiller

1. **Dossiers temporaires orphelins**

   - Si le serveur crash pendant l'upload
   - Solution : Script de nettoyage au démarrage

2. **Race condition sur le compteur**

   - Si 2 requêtes arrivent exactement au même moment
   - Solution : Transaction MongoDB + lock automatique

3. **Fuite mémoire**
   - Si beaucoup d'uploads simultanés
   - Solution : Limiter les uploads concurrents avec multer

---

## 🔍 Monitoring Production

Métriques à surveiller :

1. **Taille du dossier temp/**

   ```bash
   du -sh temp/uploads/
   # Devrait être ~0 en temps normal
   ```

2. **Cohérence compteurs**

   ```javascript
   // Vérifier tous les matins
   db.counters.find();
   db.pendingstudents.count();
   ```

3. **Temps de traitement**
   ```bash
   # Ajouter un timer dans le code
   console.time('inscription-processing')
   // ... code ...
   console.timeEnd('inscription-processing')
   // Devrait être < 5 secondes
   ```

---

## ✅ Critères de Succès

Le refactoring est validé si :

- ✅ **100%** des tests nominaux passent
- ✅ **0** trou dans la séquence des numéros d'inscription
- ✅ **0** dossier orphelin dans temp/ après 1000 inscriptions
- ✅ **0** incohérence entre DB et filesystem
- ✅ Rollback fonctionne dans **100%** des cas d'erreur
- ✅ Temps de traitement moyen < 5 secondes
- ✅ Aucun crash sous charge (50 requêtes simultanées)

---

## 🚀 Déploiement Production

Checklist avant mise en production :

1. [ ] Tous les tests passés
2. [ ] Sauvegarde DB effectuée
3. [ ] Script de nettoyage temp/ au démarrage
4. [ ] Monitoring en place
5. [ ] Rollback plan préparé
6. [ ] Documentation à jour
7. [ ] Équipe technique informée

**Commande de rollback si problème** :

```bash
# Restaurer l'ancien fichier
cp routes/pendingUsers.routes.BACKUP.js routes/pendingUsers.routes.js
pm2 restart backend-isa
```

---

Bonne chance pour les tests ! 🎉
