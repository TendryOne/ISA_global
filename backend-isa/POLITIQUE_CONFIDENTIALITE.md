# POLITIQUE DE CONFIDENTIALITÉ

## Plateforme Éducative - Institut Supérieur d'Ambatomirahavavy

**Date de dernière mise à jour :** 17 janvier 2026  
**Version :** 1.0

---

## 1. INTRODUCTION

L'Institut Supérieur d'Ambatomirahavavy (ci-après "ISA", "nous", "notre") accorde une importance primordiale à la protection de vos données personnelles. La présente Politique de Confidentialité décrit comment nous collectons, utilisons, stockons et protégeons les informations personnelles que vous nous confiez lors de l'utilisation de notre plateforme éducative accessible via **edu.isa-ambato.mg**.

En utilisant notre plateforme, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser nos services.

---

## 2. RESPONSABLE DU TRAITEMENT

**Institut Supérieur d'Ambatomirahavavy**

- Adresse : Ambatomirahavavy, Madagascar
- Email : support@isa-ambato.mg
- Téléphone : +261 34 08 123 45
- Délégué à la protection des données : dpo@isa-ambato.mg

**Hébergement des données :**

- Hébergeur : OVH SAS
- Adresse : 2 rue Kellermann, 59100 Roubaix, France
- Site web : www.ovh.com
- Type d'hébergement : Serveur Privé Virtuel (VPS)
- Localisation des serveurs : France

---

## 3. DONNÉES PERSONNELLES COLLECTÉES

### 3.1 Informations collectées lors de la préinscription

Lorsque vous soumettez votre dossier de préinscription, nous collectons :

**Informations d'identité :**

- Nom de famille (stocké en majuscules)
- Prénom(s) (première lettre en majuscule)
- Date de naissance
- Lieu de naissance
- Genre (masculin/féminin)
- Numéro de Carte d'Identité Nationale (CIN) - optionnel au début

**Coordonnées :**

- Adresse postale complète
- Numéro de téléphone (unique par utilisateur)
- Adresse email (unique, stockée en minuscules)

**Contact d'urgence :**

- Nom complet du contact
- Relation avec vous (parent, tuteur, etc.)
- Numéro de téléphone du contact

**Informations académiques :**

- Série du Baccalauréat (A1, A2, C, D, Techniques, autre)
- Année d'obtention du Baccalauréat
- Établissement précédent
- Filière choisie (BTP, Informatique, Gestion)
- Niveau d'études visé (L1, L2, L3, M1, M2)

**Documents administratifs :**

- Photo d'identité (format image)
- Relevé de notes du Baccalauréat (PDF/image)
- Document d'identité (CIN ou acte de naissance)
- Certificat de résidence

### 3.2 Informations collectées lors de l'inscription

Après admission, nous attribuons et collectons :

- **Matricule unique** (identifiant permanent de type ISA-XXXX-XXXXX)
- **Numéro d'inscription** (généré automatiquement)
- **Mot de passe** (chiffré avec bcrypt, jamais stocké en clair)
- **Année de promotion**
- **Token de finalisation d'inscription** (temporaire, valable 7 jours)

### 3.3 Données collectées automatiquement

**Données de connexion :**

- Adresse IP
- Date et heure de connexion
- Tentatives de connexion échouées (maximum 5 avant blocage temporaire)
- Identifiant de session (cookie sécurisé `ISA_auth`)
- Durée de session (7 jours maximum)

**Données techniques :**

- Type de navigateur
- Système d'exploitation
- Fuseau horaire (Indian/Antananarivo)
- Activités sur la plateforme (pages consultées, actions effectuées)

### 3.4 Données académiques et pédagogiques

**Pour les étudiants :**

- Parcours académique (promotions suivies, statut : en cours/complété/abandonné/redoublé)
- Notes obtenues pour chaque module
- Devoirs et projets soumis (fichiers, dates de soumission)
- Résultats d'examens (session normale/rattrapage)
- Présences aux cours (réclamations sur cours manqués)
- Relevés de notes générés
- Attestations et certificats demandés

**Pour les professeurs :**

- Département(s) d'affectation (informatique, gestion, BTP)
- Email professionnel (optionnel)
- Date d'embauche
- Statut (permanent/vacataire)
- Type de salaire (mensuel/horaire)
- Montant du salaire
- Modules enseignés
- Emploi du temps
- Ressources pédagogiques publiées

**Pour les administrateurs :**

- Niveau d'autorisation (admin/super admin)
- Actions administratives effectuées
- Historique de modifications

### 3.5 Données financières

- Montant total des frais de scolarité
- Échéancier de paiement (tranches, dates limites, montants)
- Preuves de paiement téléchargées (captures, reçus)
- Références de transaction
- Méthode de paiement (mobile money, banque)
- Date de paiement effectif
- Statut de vérification (vérifié/non vérifié)
- Nombre de rappels envoyés
- Date du dernier rappel
- Historique des restrictions de compte liées aux paiements

### 3.6 Données de communication

- Notifications reçues et leur statut (lu/non lu)
- Signalements de bugs soumis (titre, description, priorité, type)
- Demandes administratives (attestations, certificats de scolarité)
- Messages échangés avec l'administration
- Réclamations déposées

---

## 4. FINALITÉS DU TRAITEMENT

Nous utilisons vos données personnelles pour les finalités suivantes :

### 4.1 Gestion des inscriptions (base légale : exécution du contrat)

- Traiter votre dossier de préinscription
- Évaluer votre admissibilité
- Générer votre numéro d'inscription
- Créer votre compte utilisateur
- Attribuer votre matricule unique

### 4.2 Gestion pédagogique (base légale : exécution du contrat)

- Vous inscrire dans des promotions et modules
- Gérer les emplois du temps
- Mettre à disposition les ressources pédagogiques
- Collecter et évaluer vos devoirs et examens
- Calculer et publier vos notes
- Générer vos relevés de notes et attestations
- Suivre votre parcours académique

### 4.3 Gestion financière (base légale : exécution du contrat)

- Établir votre échéancier de paiement
- Vérifier vos justificatifs de paiement
- Envoyer des rappels de paiement automatiques (J-5, J, J+5)
- Gérer les restrictions de compte en cas d'impayé
- Tenir une comptabilité des paiements

### 4.4 Communication (base légale : intérêt légitime)

- Vous envoyer des notifications en temps réel (via Socket.IO)
- Vous informer par email des événements importants :
  - Réception de votre dossier de préinscription
  - Décision d'admission
  - Lien de finalisation d'inscription
  - Identifiants de connexion
  - Rappels de paiement
  - Modifications d'emploi du temps
  - Publication de notes
- Répondre à vos demandes de support

### 4.5 Sécurité et prévention des fraudes (base légale : intérêt légitime)

- Authentifier votre identité lors de la connexion
- Détecter et prévenir les accès non autorisés
- Limiter les tentatives de connexion (5 maximum)
- Surveiller les activités suspectes
- Protéger l'intégrité de la plateforme

### 4.6 Amélioration des services (base légale : intérêt légitime)

- Analyser l'utilisation de la plateforme
- Identifier et corriger les bugs signalés
- Développer de nouvelles fonctionnalités
- Optimiser les performances

### 4.7 Obligations légales et réglementaires (base légale : obligation légale)

- Conserver les dossiers académiques
- Répondre aux demandes des autorités compétentes
- Établir des statistiques officielles
- Archiver les documents administratifs

### 4.8 Gestion administrative (base légale : exécution du contrat)

- Générer des tableaux de bord pour les administrateurs
- Produire des statistiques (nombre d'étudiants, taux de réussite, etc.)
- Gérer les promotions et leur cycle de vie
- Planifier les cours et examens

---

## 5. BASE LÉGALE DU TRAITEMENT

Nous traitons vos données personnelles sur la base de :

1. **Exécution du contrat d'inscription** : Le traitement est nécessaire pour fournir les services éducatifs que vous avez souscrits.

2. **Consentement** : Vous acceptez explicitement le traitement lors de votre inscription (cases à cocher pour CGU, politique de confidentialité, engagement, charte).

3. **Obligation légale** : Nous devons conserver certaines données pour respecter nos obligations légales (archives académiques, déclarations administratives).

4. **Intérêt légitime** : Nous avons un intérêt légitime à assurer la sécurité de la plateforme, prévenir les fraudes et améliorer nos services.

---

## 6. DURÉE DE CONSERVATION

### 6.1 Pendant la scolarité

Vos données sont conservées activement pendant toute la durée de votre scolarité à l'ISA.

### 6.2 Après la fin de scolarité

**Données académiques (relevés, notes, diplômes) :**

- Conservation : **Durée illimitée** (valeur probante, traçabilité)
- Format : Archivage sécurisé

**Données personnelles et financières :**

- Conservation active : **5 ans** après la fin de scolarité
- Puis archivage : **10 ans supplémentaires**
- Puis suppression définitive

**Données de connexion et logs :**

- Conservation : **1 an** après la dernière connexion
- Puis suppression automatique

**Documents d'identité et justificatifs :**

- Conservation : **10 ans** (conformément aux obligations légales)
- Puis suppression sécurisée

### 6.3 Cas particuliers

**Dossiers rejetés (non admis) :**

- Conservation : **2 ans**
- Puis suppression définitive

**Tokens et liens temporaires :**

- Token de finalisation d'inscription : **7 jours**
- Token de réinitialisation de mot de passe : **24 heures**
- Suppression automatique après expiration

**Sessions actives :**

- Durée maximale : **7 jours**
- Expiration automatique en cas d'inactivité

---

## 7. DESTINATAIRES DES DONNÉES

### 7.1 Accès interne

**Étudiants :**

- Accès à leurs propres données personnelles et académiques
- Consultation des notes, emploi du temps, documents
- Pas d'accès aux données des autres étudiants

**Professeurs :**

- Accès aux données des étudiants de leurs modules (nom, prénom, matricule, notes)
- Consultation des devoirs soumis par leurs étudiants
- Pas d'accès aux données financières ou d'identité complètes

**Administrateurs :**

- Accès complet aux données pour la gestion administrative
- Obligation de confidentialité
- Accès tracé et audité

**Super administrateurs :**

- Accès étendu pour la gestion technique
- Création et suppression de comptes administrateurs
- Supervision générale de la plateforme

### 7.2 Accès externe

**Prestataires techniques :**

- **Hébergement** : Serveurs sécurisés (localisation à préciser)
- **Service d'envoi d'emails** : Nodemailer via SMTP
- **Stockage de fichiers** : Serveur local (dossiers /private, /public, /upload)

Tous les prestataires sont soumis à des obligations contractuelles de confidentialité et de sécurité.

**Autorités compétentes :**

- Sur réquisition légale ou décision judiciaire
- Ministère de l'Enseignement Supérieur (statistiques anonymisées)

### 7.3 Pas de vente ou de partage commercial

Nous ne vendons, ne louons ni ne partageons vos données personnelles à des fins commerciales ou publicitaires.

---

## 8. TRANSFERTS DE DONNÉES

### 8.1 Localisation des données

Les données sont hébergées et traitées principalement à **Madagascar**.

### 8.2 Transferts internationaux

Si des transferts de données hors de Madagascar sont nécessaires (ex : services cloud), nous nous assurons que :

- Des garanties appropriées sont en place (clauses contractuelles types)
- Le niveau de protection est équivalent à celui de Madagascar
- Vous en êtes informé

### 8.3 Stockage local

Les fichiers téléchargés (documents, devoirs, ressources) sont stockés localement sur le serveur dans des dossiers sécurisés :

- `/private/inscription/` : Dossiers de préinscription
- `/private/module-materials/` : Ressources pédagogiques
- `/private/user/` : Documents utilisateurs
- `/upload/` : Fichiers temporaires
- `/temp/` : Fichiers de traitement

---

## 9. SÉCURITÉ DES DONNÉES

### 9.1 Mesures techniques

**Authentification et accès :**

- Mots de passe chiffrés avec bcrypt (hash + salt)
- Sessions sécurisées avec cookies HttpOnly et SameSite=Strict
- Durée de session limitée (7 jours maximum)
- Limitation des tentatives de connexion (5 échecs = blocage temporaire)
- Système de réinitialisation de mot de passe sécurisé (token unique, expiration 24h)

**Protection des communications :**

- HTTPS/SSL pour le chiffrement des échanges (à déployer en production)
- WebSocket sécurisé (Socket.IO) pour les notifications en temps réel
- Cookies sécurisés (`secure: true` en production)

**Protection des fichiers :**

- Validation des chemins de fichiers (prévention de directory traversal)
- Sanitization des noms de fichiers
- Vérification de l'extension et du type MIME
- Stockage hors de la racine web pour les fichiers sensibles

**Base de données :**

- MongoDB avec authentification
- Indexes pour optimiser les performances
- Validation des schémas (Mongoose)
- Requêtes paramétrées (prévention SQL/NoSQL injection)

**Monitoring et logs :**

- Journalisation des connexions et actions critiques
- Détection des comportements suspects
- Alertes en cas d'anomalies

### 9.2 Mesures organisationnelles

**Contrôle d'accès :**

- Attribution de rôles (étudiant, professeur, admin, super admin)
- Principe du moindre privilège
- Séparation des responsabilités

**Formation du personnel :**

- Sensibilisation à la protection des données
- Procédures de sécurité documentées
- Obligation de confidentialité

**Gestion des incidents :**

- Procédure de réponse aux incidents de sécurité
- Notification en cas de violation de données (sous 72h)
- Plan de continuité d'activité

### 9.3 Sauvegardes

- Sauvegardes régulières de la base de données
- Stockage sécurisé des backups
- Tests de restauration périodiques

### 9.4 Limitations

Malgré nos efforts, aucun système n'est totalement sécurisé. Nous ne pouvons garantir une sécurité absolue. Vous êtes responsable de :

- Garder vos identifiants confidentiels
- Utiliser un mot de passe fort
- Ne pas partager votre compte
- Vous déconnecter après utilisation sur un ordinateur partagé

---

## 10. VOS DROITS

Conformément à la réglementation sur la protection des données personnelles, vous disposez des droits suivants :

### 10.1 Droit d'accès

Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.

**Comment exercer ce droit :**

- Envoyez un email à : dpo@isa-ambato.mg
- Précisez votre identité (nom, prénom, matricule)
- Nous répondrons sous **30 jours**

**Ce que vous recevrez :**

- Un export de vos données personnelles
- Les finalités du traitement
- Les destinataires
- La durée de conservation

### 10.2 Droit de rectification

Vous pouvez corriger vos données inexactes ou incomplètes.

**Comment exercer ce droit :**

- Directement via votre profil sur la plateforme (certaines informations)
- En contactant l'administration pour les données verrouillées

**Données modifiables par vous :**

- Adresse postale
- Numéro de téléphone
- Email
- Contact d'urgence
- Mot de passe

**Données modifiables uniquement par l'administration :**

- Nom, prénom (sauf erreur)
- Matricule
- Niveau, filière
- Notes

### 10.3 Droit à l'effacement ("droit à l'oubli")

Vous pouvez demander la suppression de vos données dans certains cas.

**Conditions :**

- Vous n'êtes plus étudiant actif
- Les données ne sont plus nécessaires
- Vous retirez votre consentement (si traitement basé sur le consentement)
- Le traitement est illicite

**Limites :**

- Nous devons conserver certaines données pour obligations légales
- Les données académiques (notes, relevés) sont conservées indéfiniment
- Les archives comptables sont conservées 10 ans

### 10.4 Droit d'opposition

Vous pouvez vous opposer au traitement de vos données pour motif légitime.

**Exemples :**

- Opposition aux notifications non essentielles
- Opposition au traitement à des fins statistiques

**Limites :**

- Vous ne pouvez pas vous opposer aux traitements nécessaires à l'exécution du contrat d'inscription
- Certaines notifications obligatoires (rappels de paiement, emploi du temps) ne peuvent être désactivées

### 10.5 Droit à la limitation

Vous pouvez demander la limitation du traitement dans certaines situations :

- En cas de contestation de l'exactitude des données (pendant la vérification)
- Si le traitement est illicite mais vous ne souhaitez pas l'effacement
- Si vous avez exercé votre droit d'opposition (en attente de réponse)

### 10.6 Droit à la portabilité

Vous pouvez récupérer vos données dans un format structuré, couramment utilisé et lisible par machine.

**Données portables :**

- Informations de profil
- Notes et résultats
- Historique académique
- Documents téléchargés

**Format fourni :** JSON, CSV ou PDF selon le type de données

### 10.7 Droit de définir des directives post-mortem

Vous pouvez définir des instructions concernant le sort de vos données après votre décès.

**Contact :** dpo@isa-ambato.mg

### 10.8 Droit de retirer votre consentement

Si le traitement repose sur votre consentement, vous pouvez le retirer à tout moment.

**Conséquence :** Le retrait n'affecte pas la licéité du traitement effectué avant le retrait.

### 10.9 Exercice des droits

**Pour exercer vos droits :**

1. Envoyez un email à : **dpo@isa-ambato.mg** ou **support@isa-ambato.mg**
2. Précisez :

   - Votre identité (nom, prénom, matricule)
   - Le droit que vous souhaitez exercer
   - Toute information utile

3. Joignez une copie de votre pièce d'identité (pour vérification)

**Délai de réponse :** 30 jours (prolongeable à 3 mois si la demande est complexe)

**Gratuité :** L'exercice de vos droits est gratuit (sauf demandes manifestement infondées ou excessives)

---

## 11. COOKIES ET TECHNOLOGIES SIMILAIRES

### 11.1 Qu'est-ce qu'un cookie ?

Un cookie est un petit fichier texte stocké sur votre appareil lors de la visite d'un site web.

### 11.2 Cookies utilisés

**Cookie de session (strictement nécessaire) :**

- **Nom** : `ISA_auth`
- **Finalité** : Maintenir votre session de connexion active
- **Durée** : 7 jours maximum
- **Type** : HttpOnly, SameSite=Strict, Secure (en production)
- **Données stockées** : ID de session (référence à vos données en base)

Ce cookie est essentiel au fonctionnement de la plateforme. Sans lui, vous ne pourriez pas rester connecté.

### 11.3 Pas de cookies tiers

Nous n'utilisons pas de cookies tiers à des fins publicitaires ou de tracking.

### 11.4 Gestion des cookies

Vous pouvez supprimer les cookies via les paramètres de votre navigateur. Toutefois, cela vous déconnectera de la plateforme.

### 11.5 Technologies similaires

**Local Storage / Session Storage :**
Nous pouvons utiliser le stockage local du navigateur pour :

- Mémoriser des préférences d'interface (thème, langue)
- Mettre en cache temporairement des données pour améliorer les performances

**WebSocket (Socket.IO) :**
Utilisé pour les notifications en temps réel. Aucune donnée n'est stockée localement de façon persistante.

---

## 12. PROTECTION DES MINEURS

La plateforme est destinée aux étudiants de l'enseignement supérieur, généralement majeurs. Si vous avez moins de 18 ans :

- Le consentement de votre tuteur légal est requis
- Nous pouvons demander des documents prouvant l'autorisation parentale
- Les mineurs sont protégés par les mêmes garanties de confidentialité

---

## 13. NOTIFICATIONS ET COMMUNICATIONS

### 13.1 Types de notifications

**Notifications essentielles (non désactivables) :**

- Acceptation/refus de préinscription
- Lien de finalisation d'inscription
- Identifiants de connexion
- Rappels de paiement (J-5, J, J+5)
- Modifications d'emploi du temps
- Restrictions de compte

**Notifications optionnelles (désactivables) :**

- Annonces générales de l'établissement
- Newsletters pédagogiques
- Événements

### 13.2 Canaux de communication

**Email :**

- Expéditeur : support@isa-ambato.mg, admission@isa-ambato.mg
- Fréquence : En fonction des événements
- Désabonnement : Impossible pour les notifications essentielles

**Notifications en temps réel (Socket.IO) :**

- Affichées sur la plateforme lorsque vous êtes connecté
- Consultables dans votre historique
- Marquage "lu/non lu"

### 13.3 Préférences de communication

Vous pouvez gérer vos préférences (partiellement) via votre profil.

---

## 14. LIENS VERS DES SITES TIERS

La plateforme peut contenir des liens vers des sites externes (ressources pédagogiques, références). Nous ne sommes pas responsables des pratiques de confidentialité de ces sites. Nous vous invitons à consulter leurs politiques respectives.

---

## 15. MODIFICATIONS DE LA POLITIQUE

### 15.1 Révisions

Nous pouvons modifier cette Politique de Confidentialité à tout moment pour refléter :

- Des changements légaux ou réglementaires
- De nouvelles fonctionnalités
- Des améliorations de sécurité

### 15.2 Notification

En cas de modification substantielle, vous serez informé :

- Par notification sur la plateforme
- Par email
- Au moins **30 jours** avant l'entrée en vigueur

### 15.3 Historique des versions

La date de dernière mise à jour est indiquée en haut de ce document. Les versions antérieures sont archivées et disponibles sur demande.

---

## 16. RÉCLAMATIONS ET RECOURS

### 16.1 Contact du Délégué à la Protection des Données

Pour toute question sur cette politique ou vos données personnelles :

**Email :** dpo@isa-ambato.mg  
**Téléphone :** +261 34 08 123 45  
**Adresse postale :** Institut Supérieur d'Ambatomirahavavy, Madagascar

### 16.2 Autorité de contrôle

Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l'autorité compétente de Madagascar en matière de protection des données.

### 16.3 Médiation

Avant toute action en justice, nous vous encourageons à nous contacter pour une résolution amiable.

---

## 17. TRANSPARENCE ET AUDITABILITÉ

### 17.1 Registre des traitements

Nous tenons un registre des activités de traitement conformément aux exigences légales.

### 17.2 Analyse d'impact (AIPD)

Pour les traitements à risque élevé, nous réalisons des analyses d'impact sur la protection des données.

### 17.3 Violations de données

En cas de violation de données personnelles susceptible de présenter un risque pour vos droits, nous vous en informerons dans les meilleurs délais (sous 72h).

---

## 18. GLOSSAIRE

**Données personnelles** : Toute information se rapportant à une personne physique identifiée ou identifiable.

**Traitement** : Toute opération sur des données (collecte, stockage, modification, consultation, transmission, effacement).

**Responsable du traitement** : L'ISA, qui détermine les finalités et moyens du traitement.

**Destinataire** : Personne ou entité qui reçoit communication de données.

**Consentement** : Manifestation de volonté libre, spécifique, éclairée et univoque.

**Chiffrement** : Technique de sécurité rendant les données illisibles sans clé de déchiffrement.

**Cookie** : Petit fichier texte stocké sur votre appareil.

**Socket.IO** : Technologie de communication en temps réel entre le serveur et votre navigateur.

**Bcrypt** : Algorithme de hachage de mot de passe avec salage intégré.

---

## 19. ENGAGEMENT DE L'ISA

L'Institut Supérieur d'Ambatomirahavavy s'engage à :

✅ **Transparence totale** sur l'utilisation de vos données  
✅ **Minimisation des données** : Nous ne collectons que ce qui est nécessaire  
✅ **Exactitude** : Nous maintenons vos données à jour  
✅ **Limitation de conservation** : Nous ne conservons pas plus longtemps que nécessaire  
✅ **Sécurité maximale** : Nous protégeons vos données avec les meilleures pratiques  
✅ **Respect de vos droits** : Nous répondons rapidement à vos demandes  
✅ **Pas de vente** : Nous ne vendons jamais vos données  
✅ **Formation continue** : Notre personnel est formé à la protection des données

---

## 20. ACCEPTATION DE LA POLITIQUE

En utilisant la plateforme éducative de l'ISA, vous reconnaissez avoir lu, compris et accepté la présente Politique de Confidentialité.

Lors de votre inscription, vous devez cocher une case confirmant votre acceptation. Cette acceptation est enregistrée avec la date et l'heure.

---

## 21. CONTACT ET QUESTIONS

Pour toute question concernant cette Politique de Confidentialité ou le traitement de vos données personnelles :

**Institut Supérieur d'Ambatomirahavavy**

📧 **Email :**

- Support général : support@isa-ambato.mg
- Protection des données : dpo@isa-ambato.mg
- Admission : admission@isa-ambato.mg

📞 **Téléphone :** +261 34 08 123 45

🌐 **Site web :**

- Site institutionnel : www.isa-ambato.mg
- Plateforme éducative : edu.isa-ambato.mg

📍 **Adresse :** Ambatomirahavavy, Madagascar

⏰ **Horaires :** Lundi-Vendredi, 8h-16h

---

**Date d'entrée en vigueur :** 17 janvier 2026  
**Version :** 1.0

---

_Cette Politique de Confidentialité complète les Conditions Générales d'Utilisation (CGU) de la plateforme._
