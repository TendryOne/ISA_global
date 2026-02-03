# CAHIER DES CHARGES

## Plateforme de Gestion Académique et Administrative

**Institut Supérieur ISA – Ambato**

---

## 1. CONTEXTE ET PROBLÉMATIQUE

### 1.1 Situation actuelle

L'Institut Supérieur ISA Ambato assure actuellement la gestion de ses activités académiques et administratives de manière traditionnelle, impliquant de nombreux traitements manuels et des échanges d'informations fragmentés. Cette organisation présente plusieurs limites :

- **Dispersion des informations** : Les données relatives aux étudiants, aux cours et aux paiements sont réparties sur différents supports (papier, fichiers Excel)
- **Processus chronophages** : Les inscriptions, la génération de documents administratifs et le suivi des paiements nécessitent de nombreuses interventions manuelles
- **Risques d'erreurs** : Les saisies multiples et le manque de traçabilité augmentent les risques d'incohérences
- **Communication difficile** : L'absence d'un canal centralisé rend la diffusion d'informations (emplois du temps, annonces) inefficace
- **Suivi limité** : Le suivi du parcours étudiant, des notes et des paiements manque de visibilité en temps réel

### 1.2 Enjeux et motivations

Dans une perspective d'amélioration continue et d'adaptation aux évolutions pédagogiques (notamment vers un modèle hybride présentiel/distanciel), l'établissement souhaite se doter d'une solution numérique permettant de :

- Centraliser et sécuriser les données
- Automatiser les tâches répétitives
- Améliorer la communication entre tous les acteurs
- Offrir un meilleur service aux étudiants
- Faciliter le pilotage et le suivi des activités

---

## 2. OBJECTIFS DU PROJET

### 2.1 Objectif général

Développer une **plateforme web intégrée** permettant de gérer l'ensemble des processus académiques et administratifs de l'établissement, accessible aux différents profils d'utilisateurs (administration, enseignants, étudiants).

### 2.2 Objectifs spécifiques

1. **Faciliter les démarches administratives** des étudiants (inscription en ligne, demandes de documents)
2. **Centraliser la gestion académique** (promotions, modules, emplois du temps, notes)
3. **Automatiser le suivi financier** (frais de scolarité, paiements, rappels)
4. **Améliorer la communication** via un système de notifications centralisé
5. **Offrir un espace pédagogique** pour le dépôt de devoirs, de ressources et la consultation des notes
6. **Assurer la sécurité** et la traçabilité des opérations
7. **Générer automatiquement** les documents administratifs (attestations, relevés de notes)

---

## 3. PÉRIMÈTRE DU PROJET

### 3.1 Périmètre fonctionnel

Le système devra couvrir les domaines suivants :

- **Gestion des utilisateurs** : inscription, authentification, profils (étudiants, professeurs, administrateurs)
- **Gestion académique** : promotions, filières, modules, unités d'enseignement
- **Gestion de l'emploi du temps** : planification des cours, consultation par les utilisateurs
- **Gestion pédagogique** : devoirs, soumissions, notation, ressources pédagogiques
- **Gestion administrative** : demandes de documents (attestations, relevés, diplômes)
- **Gestion financière** : frais de scolarité, paiements, suivi des soldes
- **Système de notifications** : annonces, rappels, alertes
- **Génération de documents** : documents officiels avec système de vérification

### 3.2 Hors périmètre

Les éléments suivants ne sont **pas** pris en compte dans cette première version :

- Gestion des ressources humaines (salaires, congés)
- Gestion de la bibliothèque
- Plateforme de visioconférence intégrée (utilisation de solutions tierces)
- Application mobile native (version web responsive uniquement)

---

## 4. DESCRIPTION DES UTILISATEURS

| Profil                   | Besoins principaux                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Super-Administrateur** | Configuration du système, gestion des administrateurs, accès complet                                    |
| **Administrateur**       | Gestion des utilisateurs, validation des inscriptions, planification des cours, génération de documents |
| **Professeur**           | Consultation de l'emploi du temps, création de devoirs, notation, dépôt de ressources                   |
| **Étudiant**             | Inscription en ligne, consultation des cours et notes, soumission des devoirs, demandes administratives |

---

## 5. BESOINS FONCTIONNELS

### 5.1 Inscription et Authentification

**Besoins :**

- Les nouveaux étudiants doivent pouvoir s'inscrire en ligne via un formulaire
- L'administration doit valider les inscriptions et générer les identifiants (matricule)
- Tous les utilisateurs doivent pouvoir se connecter de manière sécurisée
- Possibilité de réinitialiser le mot de passe en cas d'oubli

### 5.2 Gestion des Profils

**Besoins :**

- Chaque utilisateur doit pouvoir consulter et modifier ses informations personnelles
- Les étudiants doivent renseigner des informations complémentaires (photo, CIN, contact d'urgence)
- Les professeurs doivent pouvoir consulter leur emploi du temps et leurs groupes

### 5.3 Gestion Académique

**Besoins :**

- L'administration doit pouvoir créer et gérer les promotions (L1, L2, L3, M1, M2) par filière (Informatique, Gestion, BTP)
- L'administration doit pouvoir créer et gérer les modules (titre, coefficient, crédits, enseignant responsable)
- Les modules doivent être regroupés en unités d'enseignement (UE)
- Les étudiants doivent être affectés à une promotion

### 5.4 Emploi du Temps

**Besoins :**

- L'administration doit pouvoir planifier les séances de cours (date, heure, salle, type)
- Les cours peuvent être en présentiel, distanciel ou hybride
- Les professeurs et étudiants doivent consulter leur emploi du temps personnel
- Le système doit envoyer des rappels avant les cours
- Les étudiants doivent pouvoir signaler une séance non effectuée

### 5.5 Pédagogie

**Besoins :**

- Les professeurs doivent pouvoir créer des devoirs (titre, description, date limite, fichier associé)
- Les étudiants doivent pouvoir soumettre leurs devoirs en ligne
- Les professeurs doivent pouvoir noter les devoirs et donner un feedback
- Les étudiants doivent consulter leurs notes
- Les professeurs doivent pouvoir déposer des ressources pédagogiques (documents, vidéos)
- Les notes doivent pouvoir être validées officiellement (authentification)

### 5.6 Gestion Administrative

**Besoins :**

- Les étudiants doivent pouvoir faire des demandes de documents (attestation d'inscription, relevé de notes, diplôme)
- L'administration doit pouvoir suivre et traiter les demandes
- Les documents doivent être générés automatiquement au format PDF
- Les documents doivent comporter un système de vérification (QR code)

### 5.7 Gestion Financière

**Besoins :**

- L'administration doit pouvoir définir les frais de scolarité par promotion
- Les frais doivent pouvoir être échelonnés en plusieurs tranches
- L'administration doit pouvoir enregistrer les paiements (montant, date, méthode)
- Les étudiants doivent consulter leur solde et l'historique des paiements
- Le système doit envoyer des rappels automatiques pour les échéances de paiement

### 5.8 Notifications

**Besoins :**

- Le système doit pouvoir envoyer des notifications à tous les utilisateurs ou de manière ciblée
- Les notifications doivent couvrir différents sujets (emploi du temps, académique, financier, annonces)
- Les notifications doivent être consultables dans l'application
- Les utilisateurs doivent recevoir des notifications en temps réel

### 5.9 Reporting

**Besoins :**

- L'administration doit pouvoir consulter des statistiques globales (nombre d'étudiants, de professeurs)
- L'administration doit pouvoir générer des rapports sur les paiements et les activités
- Les utilisateurs doivent pouvoir signaler des bugs ou problèmes

---

## 6. CONTRAINTES

### 6.1 Contraintes Techniques

- L'application doit être accessible via un navigateur web
- L'interface doit être responsive (adaptée aux ordinateurs, tablettes et smartphones)
- Le système doit être disponible 24h/24, 7j/7
- Les données doivent être sauvegardées de manière sécurisée

### 6.2 Contraintes de Sécurité

- Les mots de passe ne doivent jamais être stockés en clair
- L'accès aux données doit être contrôlé selon les rôles (administrateur, professeur, étudiant)
- Les sessions doivent expirer automatiquement après un certain temps d'inactivité
- Les documents générés doivent être infalsifiables et vérifiables

### 6.3 Contraintes de Performance

- Le temps de chargement des pages doit être inférieur à 3 secondes
- Le système doit supporter au moins 100 utilisateurs simultanés
- Les recherches et consultations doivent être rapides

### 6.4 Contraintes d'Ergonomie

- L'interface doit être simple et intuitive
- La navigation doit être cohérente
- Les messages d'erreur doivent être clairs et explicites
- L'application doit être accessible en français

### 6.5 Contraintes Réglementaires

- Le système doit respecter la protection des données personnelles
- Les données des étudiants doivent être confidentielles
- Les documents officiels doivent être conformes aux standards académiques

---

## 7. LIVRABLES ATTENDUS

| Livrable                          | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| **Application web fonctionnelle** | Plateforme complète accessible via navigateur            |
| **Documentation technique**       | Guide d'installation, architecture, maintenance          |
| **Documentation utilisateur**     | Guides par profil (étudiant, professeur, administrateur) |
| **Code source**                   | Code commenté et organisé                                |
| **Données de démonstration**      | Jeu de données pour présentation                         |

---

## 8. CRITÈRES DE RÉUSSITE

Le projet sera considéré comme réussi si :

1. ✅ Toutes les fonctionnalités principales sont opérationnelles
2. ✅ L'application est accessible et utilisable par les différents profils
3. ✅ Les données sont sécurisées et les accès contrôlés
4. ✅ L'interface est intuitive et responsive
5. ✅ Les processus automatisés fonctionnent correctement (notifications, rappels)
6. ✅ Les documents générés sont conformes et vérifiables
7. ✅ Les performances sont acceptables (temps de réponse, nombre d'utilisateurs simultanés)

---

## 9. PLANNING INDICATIF

| Phase                                 | Durée          |
| ------------------------------------- | -------------- |
| Analyse des besoins et spécifications | 2 semaines     |
| Conception (architecture, maquettes)  | 2 semaines     |
| Développement                         | 10-12 semaines |
| Tests et corrections                  | 2 semaines     |
| Déploiement et formation              | 1 semaine      |

**Durée totale estimée :** 4-5 mois

---

## 10. MODALITÉS DE SUIVI

- Points d'avancement hebdomadaires
- Présentation des maquettes pour validation
- Démonstrations régulières des fonctionnalités développées
- Tests utilisateurs à prévoir avant le déploiement final

---

_Cahier des charges rédigé dans le cadre du projet de fin d'études_  
_ISA Ambato — Janvier 2026_
