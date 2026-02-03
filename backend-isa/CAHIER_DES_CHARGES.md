# CAHIER DES CHARGES

## Plateforme de Gestion Académique et Administrative – ISA

---

## 1. PRÉSENTATION GÉNÉRALE DU PROJET

### 1.1 Contexte

L'Institut Supérieur ISA Ambato souhaite moderniser la gestion de ses processus académiques et administratifs en adoptant une solution numérique intégrée. Cette transition vise à accompagner l'établissement vers un modèle de formation hybride (présentiel et numérique), permettant une meilleure organisation, une communication fluide et un suivi efficace des activités pédagogiques.

### 1.2 Objectifs du projet

- **Centraliser** les informations relatives aux étudiants, enseignants, cours et activités administratives
- **Automatiser** les processus répétitifs (inscriptions, notifications, rappels de paiement, gestion des promotions)
- **Faciliter** la communication entre les différents acteurs (administration, enseignants, étudiants)
- **Sécuriser** l'accès aux données et garantir la traçabilité des opérations
- **Offrir** une interface moderne et accessible depuis n'importe quel appareil

### 1.3 Périmètre

Le projet couvre :

- La gestion des utilisateurs (étudiants, professeurs, administrateurs, super-administrateurs)
- La gestion académique (promotions, modules, unités d'enseignement, emplois du temps)
- La gestion pédagogique (devoirs, soumissions, notes, ressources)
- La gestion administrative (demandes de documents, inscriptions)
- La gestion financière (frais de scolarité, paiements, rappels)
- Les notifications et communications
- La génération de documents (attestations, relevés de notes, etc.)

---

## 2. DESCRIPTION DES ACTEURS

| Acteur                   | Description                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Super-Administrateur** | Accès complet au système, gestion des paramètres globaux, création des administrateurs                            |
| **Administrateur**       | Gestion des utilisateurs, des promotions, des modules, des emplois du temps, validation des inscriptions          |
| **Professeur**           | Consultation de l'emploi du temps, création de devoirs, notation, dépôt de ressources pédagogiques                |
| **Étudiant**             | Consultation des cours, emploi du temps, soumission des devoirs, consultation des notes, demandes administratives |

---

## 3. SPÉCIFICATIONS FONCTIONNELLES

### 3.1 Module Authentification et Gestion des Utilisateurs

| Fonctionnalité                   | Description                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Inscription en ligne             | Formulaire d'inscription pour les nouveaux étudiants (étape "pending")              |
| Validation des inscriptions      | Validation par l'administration, génération du matricule et du numéro d'inscription |
| Connexion sécurisée              | Authentification par matricule/mot de passe avec gestion des sessions               |
| Réinitialisation du mot de passe | Envoi d'un lien sécurisé par email                                                  |
| Gestion des profils              | Modification des informations personnelles, photo d'identité                        |
| Limitation des tentatives        | Blocage temporaire après plusieurs échecs de connexion                              |

### 3.2 Module Gestion Académique

| Fonctionnalité                         | Description                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Gestion des promotions                 | Création, modification, activation/désactivation des promotions (L1, L2, L3, M1, M2) |
| Gestion des filières                   | Informatique, Gestion, BTP                                                           |
| Gestion des unités d'enseignement (UE) | Regroupement des modules par UE                                                      |
| Gestion des modules                    | Code, titre, coefficient, crédits, heures, professeur responsable, type (CM/TD/TP)   |
| Affectation des étudiants              | Association des étudiants aux promotions avec suivi du parcours                      |

### 3.3 Module Emploi du Temps (Planning)

| Fonctionnalité             | Description                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Création des séances       | Date, heure début/fin, salle, module, professeur, type (présentiel/distanciel/hybride) |
| Types de cours             | CM, TD, TP, Examen, Autre                                                              |
| Lien visioconférence       | Possibilité d'ajouter un lien Google Meet pour les cours à distance                    |
| Statut des séances         | En attente, effectué, manqué                                                           |
| Réclamations étudiants     | Signalement de séances non tenues                                                      |
| Notifications automatiques | Rappels avant les cours                                                                |

### 3.4 Module Pédagogique

| Fonctionnalité             | Description                                                                       |
| -------------------------- | --------------------------------------------------------------------------------- |
| Création de devoirs        | Titre, description, date limite, type (devoir, projet, examen), module, promotion |
| Soumission en ligne        | Dépôt de fichiers par les étudiants                                               |
| Notation                   | Saisie des notes (0-20), feedback, verrouillage des notes                         |
| Session normale/rattrapage | Gestion des deux sessions d'examen                                                |
| Ressources pédagogiques    | Dépôt de documents et vidéos par les professeurs                                  |
| Authentification des notes | Validation officielle des résultats                                               |

### 3.5 Module Gestion Administrative

| Fonctionnalité              | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| Demandes de documents       | Relevé de notes, attestation d'inscription, diplôme          |
| Suivi des demandes          | Statuts : en attente, en cours, récupérable, délivré, annulé |
| Génération de documents PDF | Création automatique avec QR code de vérification            |
| Historique des demandes     | Traçabilité complète                                         |

### 3.6 Module Gestion Financière

| Fonctionnalité                    | Description                                           |
| --------------------------------- | ----------------------------------------------------- |
| Définition des frais de scolarité | Par promotion, par année académique                   |
| Gestion des tranches              | Échelonnement des paiements                           |
| Enregistrement des paiements      | Montant, date, méthode (espèces, mobile money, carte) |
| Suivi des soldes                  | Visualisation des montants dus et payés               |
| Rappels automatiques              | Notifications pour les échéances de paiement          |
| Preuves de paiement               | Upload des justificatifs                              |

### 3.7 Module Notifications

| Fonctionnalité              | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| Notifications individuelles | Messages ciblés pour un utilisateur                                            |
| Notifications par promotion | Diffusion à tous les étudiants d'une promotion                                 |
| Notifications globales      | Annonces pour tous les utilisateurs                                            |
| Types d'information         | Emploi du temps, académique, administratif, financier, examen, annonce, alerte |
| Niveaux d'alerte            | Info, warning, critical                                                        |
| Expiration automatique      | Suppression après 30 jours                                                     |
| Temps réel                  | Notifications push via WebSocket (Socket.io)                                   |

### 3.8 Module Reporting et Tableau de Bord

| Fonctionnalité        | Description                                         |
| --------------------- | --------------------------------------------------- |
| Statistiques globales | Nombre d'étudiants, professeurs, promotions actives |
| Suivi des paiements   | Taux de recouvrement, impayés                       |
| Rapports d'activité   | Connexions, actions effectuées                      |
| Signalement de bugs   | Formulaire de rapport d'anomalies                   |

### 3.9 Tâches Automatisées (CRON)

| Tâche                                 | Description                                           |
| ------------------------------------- | ----------------------------------------------------- |
| Mise à jour des promotions            | Passage automatique des niveaux en fin d'année        |
| Vérification des emplois du temps     | Mise à jour du statut des séances (effectué/manqué)   |
| Rappels de paiement                   | Envoi automatique d'emails pour les échéances         |
| Gestion des résultats et inscriptions | Traitement automatisé des résultats et réinscriptions |

---

## 4. SPÉCIFICATIONS TECHNIQUES

### 4.1 Architecture Générale

L'application repose sur une **architecture client-serveur** avec :

- **Frontend** : Application web monopage (SPA)
- **Backend** : API RESTful
- **Base de données** : Base de données NoSQL
- **Communication temps réel** : WebSocket

### 4.2 Technologies Utilisées

#### Frontend

| Technologie       | Rôle                                              |
| ----------------- | ------------------------------------------------- |
| **Vue.js**        | Framework JavaScript pour l'interface utilisateur |
| HTML5 / CSS3      | Structure et styles                               |
| JavaScript (ES6+) | Logique côté client                               |

#### Backend

| Technologie      | Rôle                                              |
| ---------------- | ------------------------------------------------- |
| **Node.js**      | Environnement d'exécution JavaScript côté serveur |
| **Express.js 5** | Framework web pour les API REST                   |
| **MongoDB**      | Base de données NoSQL orientée documents          |
| **Mongoose**     | ODM pour MongoDB                                  |
| **Socket.io**    | Communication temps réel (WebSocket)              |

#### Sécurité

| Technologie            | Rôle                                  |
| ---------------------- | ------------------------------------- |
| **Argon2**             | Hachage sécurisé des mots de passe    |
| **express-session**    | Gestion des sessions utilisateur      |
| **connect-mongo**      | Stockage des sessions en base MongoDB |
| **Helmet**             | Protection des en-têtes HTTP          |
| **CORS**               | Contrôle des origines autorisées      |
| **express-rate-limit** | Limitation du nombre de requêtes      |

#### Services Externes

| Technologie             | Rôle                                                         |
| ----------------------- | ------------------------------------------------------------ |
| **Nodemailer / Resend** | Envoi d'emails (inscription, rappels, réinitialisation)      |
| **Cloudinary**          | Stockage et gestion des images                               |
| **Puppeteer**           | Génération de documents PDF                                  |
| **QRCode**              | Génération de QR codes pour l'authentification des documents |
| **Sharp**               | Traitement et optimisation des images                        |
| **XLSX**                | Import/export de fichiers Excel                              |

#### Planification

| Technologie       | Rôle                             |
| ----------------- | -------------------------------- |
| **node-cron**     | Exécution de tâches planifiées   |
| **node-schedule** | Planification avancée de tâches  |
| **Luxon**         | Manipulation des dates et heures |

### 4.3 Organisation du Code Backend

```
backend-isa/
├── index.js                 # Point d'entrée, configuration Express
├── database/                # Connexion MongoDB
├── models/                  # Modèles Mongoose (schémas de données)
├── routes/                  # Définition des routes API
├── controllers/             # Logique métier des endpoints
├── queries/                 # Requêtes complexes à la base de données
├── middleware/              # Middlewares (auth, validation, etc.)
├── function/                # Fonctions utilitaires
├── mail/                    # Templates et envoi d'emails
├── script/                  # Scripts CRON et tâches planifiées
├── socket/                  # Configuration Socket.io
├── utils/                   # Utilitaires divers
├── views/                   # Templates EJS (emails, documents)
├── public/                  # Fichiers statiques
├── private/                 # Fichiers privés (documents générés)
└── upload/                  # Fichiers uploadés
```

### 4.4 Modèle de Données (Entités Principales)

| Entité                    | Description                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **User**                  | Utilisateur de base (matricule, nom, email, mot de passe, rôle)                        |
| **Student**               | Étudiant (hérite de User) : photo, date de naissance, CIN, parcours, contact d'urgence |
| **Professor**             | Professeur (hérite de User) : département, type de contrat, salaire                    |
| **Admin**                 | Administrateur (hérite de User)                                                        |
| **Promotion**             | Niveau d'études (L1, L2, L3, M1, M2) + filière                                         |
| **TeachingUnit**          | Unité d'enseignement                                                                   |
| **Module**                | Matière (code, titre, crédits, coefficient, heures)                                    |
| **Schedule**              | Séance de cours (date, heure, salle, type, statut)                                     |
| **Assignment**            | Devoir/examen (titre, date limite, type, module)                                       |
| **Submission**            | Soumission d'un étudiant (fichier, note, feedback)                                     |
| **Payment**               | Paiement effectué (montant, méthode, date)                                             |
| **TuitionFee**            | Frais de scolarité (promotion, tranches)                                               |
| **Notification**          | Notification (titre, message, type, destinataires)                                     |
| **AdministrativeRequest** | Demande de document (type, statut)                                                     |
| **Resources**             | Ressource pédagogique (document, vidéo)                                                |

---

## 5. CONTRAINTES ET EXIGENCES

### 5.1 Contraintes Fonctionnelles

- L'application doit être accessible 24h/24, 7j/7
- Les données doivent être sauvegardées régulièrement
- Le système doit supporter plusieurs utilisateurs simultanés
- Les documents générés doivent être vérifiables (QR code)

### 5.2 Contraintes de Sécurité

- Mots de passe hachés avec Argon2 (jamais stockés en clair)
- Sessions sécurisées avec expiration automatique (7 jours)
- Protection CSRF et XSS via Helmet
- Limitation des tentatives de connexion
- Contrôle d'accès basé sur les rôles (RBAC)
- HTTPS obligatoire en production
- Validation des entrées utilisateur

### 5.3 Contraintes de Performance

- Temps de réponse API < 2 secondes pour les opérations courantes
- Support de 100+ utilisateurs simultanés
- Indexation des champs fréquemment recherchés en base de données

### 5.4 Contraintes d'Ergonomie

- Interface responsive (desktop, tablette, mobile)
- Navigation intuitive
- Messages d'erreur explicites
- Feedback visuel pour les actions utilisateur

---

## 6. LIVRABLES

| Livrable                  | Description                          |
| ------------------------- | ------------------------------------ |
| Code source Frontend      | Application Vue.js complète          |
| Code source Backend       | API Node.js/Express complète         |
| Base de données           | Schémas MongoDB et données initiales |
| Documentation technique   | Architecture, installation, API      |
| Documentation utilisateur | Guide d'utilisation par profil       |
| Mémoire de soutenance     | Document académique complet          |

---

## 7. PLANNING PRÉVISIONNEL

| Phase                  | Durée estimée | Activités                                   |
| ---------------------- | ------------- | ------------------------------------------- |
| Analyse des besoins    | 2 semaines    | Entretiens, spécifications, maquettes       |
| Conception             | 2 semaines    | Architecture, modèle de données, API design |
| Développement Backend  | 6 semaines    | API, modèles, authentification, CRON        |
| Développement Frontend | 6 semaines    | Interfaces, intégration API                 |
| Tests et corrections   | 2 semaines    | Tests fonctionnels, corrections de bugs     |
| Déploiement            | 1 semaine     | Mise en production, configuration serveur   |
| Documentation          | 1 semaine     | Rédaction des guides et du mémoire          |

---

## 8. ANNEXES

### 8.1 Liste des Endpoints API (Principales Routes)

- `/api/auth/*` — Authentification (login, logout, reset password)
- `/api/students/*` — Gestion des étudiants
- `/api/professors/*` — Gestion des professeurs
- `/api/promotions/*` — Gestion des promotions
- `/api/modules/*` — Gestion des modules
- `/api/teaching-units/*` — Gestion des UE
- `/api/schedules/*` — Gestion des emplois du temps
- `/api/assignments/*` — Gestion des devoirs
- `/api/submissions/*` — Gestion des soumissions
- `/api/payments/*` — Gestion des paiements
- `/api/tuition-fees/*` — Gestion des frais de scolarité
- `/api/notifications/*` — Gestion des notifications
- `/api/administrative-requests/*` — Demandes administratives
- `/api/resources/*` — Ressources pédagogiques
- `/api/dashboard/*` — Statistiques et tableaux de bord
- `/api/settings/*` — Paramètres système

### 8.2 Variables d'Environnement Requises

```
PORT=4000
MONGO_URI=mongodb://...
SECRET_SESSION_KEY=...
CLIENT_ORIGINS=http://localhost:5173,...
NODE_ENV=production
# Configuration email (Nodemailer/Resend)
# Configuration Cloudinary
```

---

## 9. VALIDATION

| Critère                   | Méthode de validation                       |
| ------------------------- | ------------------------------------------- |
| Fonctionnalités conformes | Tests fonctionnels par scénario             |
| Performance acceptable    | Tests de charge                             |
| Sécurité                  | Audit des accès, tests d'intrusion basiques |
| Ergonomie                 | Tests utilisateurs                          |
| Documentation complète    | Revue documentaire                          |

---

_Document rédigé dans le cadre du projet de fin d'études — ISA Ambato_  
_Date : Janvier 2026_
