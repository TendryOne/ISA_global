# DICTIONNAIRE DE DONNÉES - STRUCTURE PAR ENTITÉ
## Plateforme de Gestion Académique et Administrative – ISA

**Document Neutre** – Structure logique indépendante de la technologie (MongoDB/SQL)  
**Date de création** : Janvier 2026  
**Version** : 1.0

---

## SOMMAIRE
1. [Entités d'Authentification](#1-entités-dauthentification)
2. [Entités Académiques](#2-entités-académiques)
3. [Entités Pédagogiques](#3-entités-pédagogiques)
4. [Entités Administratives](#4-entités-administratives)
5. [Entités Financières](#5-entités-financières)
6. [Entités de Communication](#6-entités-de-communication)
7. [Entités de Logs et Audit](#7-entités-de-logs-et-audit)

---

## 1. ENTITÉS D'AUTHENTIFICATION

### 1.1 USER (Utilisateur)
**Description** : Entité de base pour tous les utilisateurs du système  
**Type d'héritage** : Classe mère (héritée par Student, Professor, Admin, SuperAdmin)  
**Clé primaire** : ID (UUID/ObjectId)  
**Index recommandé** : matricule, email, role

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant unique de l'utilisateur |
| **matricule** | String | 20 | Unique, Non-null | Code unique (format: ISAYYYY-NNNN ou auto-généré) |
| **password** | String | 255 | Non-null | Mot de passe hashé (Argon2) |
| **name** | String | 100 | Non-null | Nom de famille (majuscules) |
| **firstName** | String | 100 | Non-null | Prénom (titre-casse) |
| **email** | String | 255 | Unique, Non-null | Email (minuscules) |
| **phone** | String | 20 | Unique, Non-null | Numéro de téléphone international |
| **address** | String | 255 | Non-null | Adresse complète |
| **gender** | Enum | - | Non-null | Valeurs: male, female |
| **role** | Enum | 20 | Discriminateur | Valeurs: student, professor, admin, superAdmin |
| **resetPasswordToken** | String | 500 | Nullable | Token pour réinitialisation de mot de passe |
| **resetPasswordExpires** | DateTime | - | Nullable | Expiration du token (3h après création) |
| **configs.defaultPassword** | Boolean | - | Défaut: true | Indique si PWD est provisoire |
| **configs.lastPasswordChange** | DateTime | - | Nullable | Dernière modification du mot de passe |
| **createdAt** | DateTime | - | Non-null, Auto | Timestamp de création |
| **updatedAt** | DateTime | - | Non-null, Auto | Timestamp de modification |

---

### 1.2 STUDENT (Étudiant) - Hérite de USER
**Description** : Extension de User avec données académiques et administratives  
**Clé primaire** : ID (héritée de User)  
**Références externes** : Promotion, TuitionFees, Parcours  
**Index recommandé** : field, level, verified, isRestricted, parcours.promotion

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **inscriptionId** | String | 50 | Unique, Non-null | Numéro d'inscription unique |
| **identityPhoto** | String | 255 | Non-null | Chemin fichier (Cloudinary/local) |
| **birthDate** | Date | - | Non-null | Date de naissance |
| **birthPlace** | String | 100 | Non-null | Lieu de naissance |
| **cin** | String | 30 | Unique, Nullable | Numéro de carte d'identité |
| **idDocument** | String | 255 | Non-null | Fichier numérisé ID |
| **residenceCertificate** | String | 255 | Non-null | Fichier certificat de résidence |
| **bacTranscript** | String | 255 | Nullable | Fichier relevé BAC |
| **emergencyContactName** | String | 100 | Non-null | Nom du contact d'urgence |
| **emergencyContactPhone** | String | 20 | Non-null | Téléphone du contact d'urgence |
| **emergencyContactRelation** | String | 50 | Non-null | Lien de parenté |
| **field** | Enum | - | Non-null | Filière: informatique, gestion, btp |
| **level** | Enum | 5 | Non-null | Niveau: L1, L2, L3, M1, M2 |
| **previousInstitution** | String | 200 | Non-null | Établissement d'origine |
| **promotionYear** | Integer | 4 | Défaut: année courante | Année d'admission |
| **parcours** | Array[Parcours] | - | Non-null | Historique du parcours académique |
| **parcours.promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion |
| **parcours.status** | Enum | - | Non-null | Statut: in progress, completed, dropped, repeated |
| **verified** | Boolean | - | Défaut: false | Inscription validée par admin |
| **isRestricted** | Boolean | - | Défaut: false | Compte restreint (impayés) |
| **terms.cguAcceptance** | Boolean | - | Défaut: true | Acceptation CGU |
| **terms.privacyAcceptance** | Boolean | - | Défaut: true | Acceptation politique confidentialité |
| **terms.engagementAcceptance** | Boolean | - | Défaut: true | Acceptation charte engagement |
| **terms.charterAcceptance** | Boolean | - | Défaut: true | Acceptation charte informatique |

---

### 1.3 PROFESSOR (Professeur) - Hérite de USER
**Description** : Extension de User avec données d'enseignement  
**Clé primaire** : ID (héritée de User)  
**Références externes** : Modules (enseignés)  

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **department** | String | 100 | Nullable | Département/Filière d'affectation |
| **contract_type** | Enum | - | Nullable | Valeurs: fulltime, parttime, contract |
| **specialization** | String | 255 | Nullable | Domaine d'expertise |
| **office** | String | 50 | Nullable | Numéro de bureau |

---

### 1.4 ADMIN (Administrateur) - Hérite de USER
**Description** : Extension de User avec permissions administratives  
**Clé primaire** : ID (héritée de User)  

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **function** | Enum | - | Non-null | Fonction: RH, Scolarite, PDG, IT, Finance, Support |
| **department** | String | 100 | Nullable | Service d'affectation |

---

### 1.5 SUPER_ADMIN (Super Administrateur) - Hérite de USER
**Description** : Extension de User avec permissions système complètes  
**Clé primaire** : ID (héritée de User)  
**Permissions** : Toutes les permissions Admin + Gestion tâches automatisées (UC47, UC50)

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **function** | Enum | - | Non-null | Fonction: RH, Scolarite, PDG, IT, Finance, Support |
| **systemAccess** | Boolean | - | Défaut: true | Accès complet au système |

---

### 1.6 PENDING_STUDENT (Étudiant en attente)
**Description** : Étudiant dont l'inscription est en cours de validation  
**Clé primaire** : ID (UUID/ObjectId)  
**Index recommandé** : status, field, levelAsked

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant unique |
| **inscriptionId** | String | 50 | Unique, Non-null | Numéro d'inscription provisoire |
| **firstName** | String | 100 | Non-null | Prénom |
| **lastName** | String | 100 | Non-null | Nom de famille |
| **birthDate** | Date | - | Non-null | Date de naissance |
| **birthPlace** | String | 100 | Non-null | Lieu de naissance |
| **gender** | Enum | - | Non-null | Valeurs: male, female |
| **cin** | String | 30 | Unique, Nullable | Numéro de carte d'identité |
| **address** | String | 255 | Non-null | Adresse |
| **phone** | String | 20 | Unique, Non-null | Numéro de téléphone |
| **email** | String | 255 | Unique, Non-null | Email |
| **identityPhoto** | String | 255 | Non-null | Chemin de la photo d'identité |
| **field** | Enum | - | Non-null | Filière: informatique, gestion, btp |
| **levelAsked** | Enum | 5 | Défaut: L1 | Niveau demandé: L1, L2, L3, M1, M2 |
| **previousInstitution** | String | 200 | Non-null | Établissement d'origine |
| **bacTranscript** | String | 255 | Nullable | Fichier relevé BAC |
| **idDocument** | String | 255 | Non-null | Fichier pièce d'identité |
| **residenceCertificate** | String | 255 | Non-null | Fichier certificat de résidence |
| **status** | Enum | - | Non-null | Statut: pending, approved, rejected |
| **rejectionReason** | String | 500 | Nullable | Motif de refus si rejeté |
| **token** | String | 500 | Nullable | Token de confirmation email |
| **expiredToken** | Boolean | - | Défaut: false | Token expiré |
| **createdAt** | DateTime | - | Non-null, Auto | Date de candidature |
| **updatedAt** | DateTime | - | Non-null, Auto | Dernière mise à jour |

---

### 1.7 LOGIN_ATTEMPTS (Tentatives de connexion)
**Description** : Suivi des tentatives échouées pour la sécurité  
**Clé primaire** : ID (UUID/ObjectId)  
**Index recommandé** : matricule, timestamp

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **matricule** | String | 20 | FK, Non-null | Référence User.matricule |
| **attemptCount** | Integer | - | Défaut: 1 | Nombre de tentatives échouées |
| **lastAttemptAt** | DateTime | - | Non-null | Dernier essai échoué |
| **blockedUntil** | DateTime | - | Nullable | Déblocage prévu à (30min après 5e tentative) |
| **isBlocked** | Boolean | - | Défaut: false | Compte actuellement bloqué |
| **createdAt** | DateTime | - | Non-null, Auto | Création de l'enregistrement |
| **updatedAt** | DateTime | - | Non-null, Auto | Mise à jour |

---

## 2. ENTITÉS ACADÉMIQUES

### 2.1 PROMOTION
**Description** : Niveau d'études dans une filière  
**Clé primaire** : ID (UUID/ObjectId)  
**Index recommandé** : code, field, level, status

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **code** | String | 50 | Unique, Non-null | Code unique (ex: INFO-L2-2025) |
| **name** | String | 100 | Non-null | Libellé (ex: L2 Informatique 2024-2025) |
| **field** | Enum | - | Non-null | Filière: informatique, gestion, btp |
| **level** | Enum | 5 | Non-null | Niveau: L1, L2, L3, M1, M2 |
| **academicYear** | String | 9 | Non-null | Année académique (2024-2025) |
| **status** | Enum | - | Défaut: active | Statut: active, archived, inactive |
| **studentCount** | Integer | - | Défaut: 0 | Nombre d'étudiants actuels |
| **capacity** | Integer | - | Nullable | Capacité maximale |
| **responsibleAdmin** | ObjectId/FK | 24 | FK, Nullable | Admin responsable de la promotion |
| **startDate** | Date | - | Non-null | Date de début |
| **endDate** | Date | - | Nullable | Date de fin |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 2.2 TEACHING_UNIT (Unité d'Enseignement)
**Description** : Groupement de modules  
**Clé primaire** : ID (UUID/ObjectId)  
**Index recommandé** : code, field, level, semester

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **code** | String | 50 | Unique, Non-null | Code de l'UE (ex: INF-L2-S3-UE1) |
| **name** | String | 200 | Non-null | Libellé complet |
| **field** | Enum | - | Non-null | Filière: informatique, gestion, btp |
| **level** | Enum | 5 | Non-null | Niveau: L1, L2, L3, M1, M2 |
| **semester** | Enum | - | Non-null | Semestre: S1, S2, S3, S4, S5, S6, S7, S8, S9, S10 |
| **credits** | Integer | - | Défaut: 0 | Crédits ECTS |
| **description** | String | 500 | Non-null | Description pédagogique |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 2.3 MODULE
**Description** : Matière d'enseignement  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : TeachingUnit, Professor, Promotion  
**Index recommandé** : code, teachingUnit, professor

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **code** | String | 50 | Unique, Non-null | Code du module (ex: INF-L2-S3-ANA1) |
| **name** | String | 200 | Non-null | Titre du module |
| **teachingUnit** | ObjectId/FK | 24 | FK, Non-null | Référence UE parent |
| **professor** | ObjectId/FK | 24 | FK, Nullable | Responsable du module |
| **coefficient** | Decimal | - | Défaut: 1.0 | Coefficient pour calcul moyenne |
| **credits** | Integer | - | Défaut: 0 | Crédits ECTS |
| **totalHours** | Integer | - | Défaut: 0 | Nombre total d'heures |
| **cmHours** | Integer | - | Défaut: 0 | Heures de CM |
| **tdHours** | Integer | - | Défaut: 0 | Heures de TD |
| **tpHours** | Integer | - | Défaut: 0 | Heures de TP |
| **description** | String | 500 | Nullable | Description pédagogique |
| **objectives** | String | 1000 | Nullable | Objectifs d'apprentissage |
| **prerequisites** | String | 500 | Nullable | Pré-requis |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 2.4 PARCOURS (Parcours Académique)
**Description** : Historique du parcours d'un étudiant (sous-document de Student)  
**Type** : Tableau d'objets imbriqués dans Student  

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion |
| **status** | Enum | - | Non-null | Statut: in progress, completed, dropped, repeated |
| **enrollmentDate** | Date | - | Non-null | Date d'inscription à la promotion |
| **completionDate** | DateTime | - | Nullable | Date de fin/validation |

---

## 3. ENTITÉS PÉDAGOGIQUES

### 3.1 ASSIGNMENT (Devoir/Examen)
**Description** : Travail à remettre par les étudiants  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Module, Promotion, Professor  
**Index recommandé** : module, promotion, dueDate, professor

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **title** | String | 200 | Non-null | Titre du devoir |
| **description** | String | 2000 | Non-null | Description détaillée |
| **module** | ObjectId/FK | 24 | FK, Non-null | Référence Module |
| **promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion cible |
| **professor** | ObjectId/FK | 24 | FK, Non-null | Référence Professeur créateur |
| **type** | Enum | - | Non-null | Type: homework, project, exam |
| **session** | Enum | - | Défaut: normal | Session: normal, rattrapage |
| **dueDate** | DateTime | - | Non-null | Date limite de remise |
| **fileUrl** | String | 255 | Nullable | Fichier d'énoncé (si applicable) |
| **submissionLocation** | Enum | - | Défaut: online | Lieu: online, in-person |
| **maxScore** | Integer | - | Défaut: 20 | Score maximum (généralement 20) |
| **isActive** | Boolean | - | Défaut: true | Devoir actif/visible |
| **lockedGrade** | Boolean | - | Défaut: false | Notes verrouillées (non modifiables) |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 3.2 SUBMISSION (Soumission)
**Description** : Travail soumis par un étudiant  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Student, Assignment  
**Contrainte** : Unique (student, assignment)  
**Index recommandé** : student, assignment, status, submittedAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **student** | ObjectId/FK | 24 | FK, Non-null | Référence Student |
| **assignment** | ObjectId/FK | 24 | FK, Non-null | Référence Assignment |
| **fileUrl** | String | 255 | Nullable | Fichier remis (null si présentiel) |
| **submittedAt** | DateTime | - | Défaut: now() | Date/heure de remise |
| **isLate** | Boolean | - | Calculé | Remise en retard (submittedAt > dueDate) |
| **status** | Enum | - | Non-null | Statut: submitted, graded, late, missing |
| **grade** | Decimal | - | Nullable, Min:0, Max:20 | Note attribuée (0-20) |
| **feedback** | String | 2000 | Nullable | Commentaires du professeur |
| **gradedAt** | DateTime | - | Nullable | Date de notation |
| **gradedBy** | ObjectId/FK | 24 | FK, Nullable | Référence Professor qui a noté |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 3.3 RESOURCE (Ressource pédagogique)
**Description** : Document, vidéo ou lien partagé par les professeurs  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Module, Promotion, Professor  
**Index recommandé** : module, promotion, professor, type

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **title** | String | 200 | Non-null | Titre de la ressource |
| **description** | String | 500 | Non-null | Description |
| **type** | Enum | - | Non-null | Type: video, document, external_link |
| **module** | ObjectId/FK | 24 | FK, Non-null | Référence Module |
| **promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion |
| **professor** | ObjectId/FK | 24 | FK, Non-null | Référence Professeur qui a téléchargé |
| **link** | String | 500 | Non-null | URL ou chemin d'accès |
| **fileSize** | Integer | - | Nullable | Taille en bytes |
| **downloadCount** | Integer | - | Défaut: 0 | Nombre de téléchargements |
| **isVisible** | Boolean | - | Défaut: true | Ressource visible par les étudiants |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 3.4 GRADES_AUTHENTICATION (Authentification des notes)
**Description** : Token unique pour authentifier les relevés de notes générés  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Promotion, Student  
**Contrainte** : Unique (promotion, student)  

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion |
| **student** | ObjectId/FK | 24 | FK, Non-null | Référence Student |
| **uniqueToken** | String | 255 | Unique, Non-null | Token pour QR code |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

## 4. ENTITÉS ADMINISTRATIVES

### 4.1 SCHEDULE (Emploi du temps / Séances)
**Description** : Séances de cours (CM, TD, TP, examens)  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Promotion[], Module, Professor, CreatedBy, ModifiedBy  
**Index recommandé** : promotions, module, date, professor, status

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **promotions** | ObjectId[]/FK | 24 | FK, Non-null | Référence Promotions concernées |
| **module** | ObjectId/FK | 24 | FK, Nullable | Référence Module (optionnel) |
| **title** | String | 200 | Non-null | Titre de la séance |
| **description** | String | 500 | Nullable | Description complémentaire |
| **courseType** | Enum | - | Défaut: cm | Type: cm, td, tp, exam, other |
| **type** | Enum | - | Défaut: presentiel | Format: presentiel, distanciel, hybride |
| **date** | Date | - | Non-null | Date de la séance |
| **startTime** | String | 5 | Non-null | Heure de début (HH:MM) |
| **endTime** | String | 5 | Non-null | Heure de fin (HH:MM) |
| **duration** | Integer | - | Non-null | Durée en minutes |
| **room** | String | 50 | Nullable | Numéro/libellé de la salle |
| **professor** | ObjectId/FK | 24 | FK, Nullable | Référence Professeur animateur |
| **googleMeetLink** | String | 500 | Nullable | Lien Google Meet (si distanciel) |
| **department** | String[] | - | Nullable | Département(s) impliqué(s) |
| **status** | Enum | - | Défaut: pending | Statut: pending, done, missed |
| **studentReclamations** | ObjectId[]/FK | 24 | FK, Array | Étudiants ayant réclamé absence |
| **createdBy** | ObjectId/FK | 24 | FK, Non-null | Admin/utilisateur qui a créé |
| **modifiedBy** | ObjectId/FK | 24 | FK, Nullable | Dernière modification par |
| **approvedByCron** | Boolean | - | Défaut: false | Approuvé automatiquement |
| **approvedManuallyAfterCronBy** | ObjectId/FK | 24 | FK, Nullable | Approuvé manuellement par |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 4.2 ADMINISTRATIVE_REQUEST (Demande administrative)
**Description** : Demande de document (attestation, relevé, diplôme)  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Student, Promotion, HandledBy  
**Contrainte** : Unique (student, promotion, requestType) pour statut pending/in-progress  
**Index recommandé** : student, promotion, status, requestType

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **matricule** | String | 20 | Non-null | Matricule de l'étudiant (dénormalisation) |
| **student** | ObjectId/FK | 24 | FK, Non-null | Référence Student |
| **promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion |
| **requestType** | Enum | - | Non-null | Type: transcript, enrollment_certificate, diploma |
| **status** | Enum | - | Défaut: pending | Statut: pending, in-progress, recoverable, delivered, cancelled |
| **specialRequests** | String | 500 | Nullable | Demandes spéciales (notes, motif, etc.) |
| **recoveryDate** | Date | - | Nullable | Date de récupération prévue |
| **handledBy** | ObjectId/FK | 24 | FK, Nullable | Admin qui a traité |
| **documentUrl** | String | 255 | Nullable | Chemin du document généré |
| **qrCode** | String | 500 | Nullable | QR code de vérification |
| **createdAt** | DateTime | - | Non-null, Auto | Date de demande |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

## 5. ENTITÉS FINANCIÈRES

### 5.1 TUITION_FEES (Frais de scolarité)
**Description** : Frais applicables à une promotion  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Promotion  
**Index recommandé** : promotion, academicYear

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion |
| **academicYear** | String | 9 | Non-null | Année académique (2024-2025) |
| **totalAmount** | Decimal | - | Non-null, Min: 0 | Montant total des frais |
| **currency** | String | 3 | Défaut: XAF | Devise (ISO 4217) |
| **installments** | Integer | - | Défaut: 3 | Nombre d'échéances |
| **paymentSchedule** | Object[] | - | Non-null | Calendrier d'échéances (tableau) |
| **paymentSchedule.dueDate** | Date | - | Non-null | Date de paiement |
| **paymentSchedule.amount** | Decimal | - | Non-null | Montant de cette échéance |
| **paymentSchedule.description** | String | 100 | Nullable | Libellé (ex: Acompte 1) |
| **description** | String | 500 | Nullable | Description des frais |
| **createdAt** | DateTime | - | Non-null, Auto | Création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 5.2 PAYMENT (Paiement)
**Description** : Enregistrement d'un paiement effectué  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Student, TuitionFees, RecordedBy  
**Index recommandé** : student, tuitionFees, status, paidAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **student** | ObjectId/FK | 24 | FK, Non-null | Référence Student |
| **tuitionFees** | ObjectId/FK | 24 | FK, Non-null | Référence TuitionFees |
| **amount** | Decimal | - | Non-null, Min: 0 | Montant payé |
| **currency** | String | 3 | Défaut: XAF | Devise |
| **paymentMethod** | Enum | - | Non-null | Méthode: cash, bank_transfer, cheque, card, momo |
| **transactionId** | String | 100 | Nullable | Numéro de transaction (si bancaire) |
| **proofFile** | String | 255 | Nullable | Fichier de preuve (ticket, reçu) |
| **status** | Enum | - | Défaut: pending | Statut: pending, validated, rejected |
| **validatedBy** | ObjectId/FK | 24 | FK, Nullable | Admin qui a validé |
| **rejectionReason** | String | 500 | Nullable | Motif de rejet si applicable |
| **paidAt** | DateTime | - | Non-null | Date du paiement |
| **recordedBy** | ObjectId/FK | 24 | FK, Non-null | Admin qui a enregistré |
| **createdAt** | DateTime | - | Non-null, Auto | Création enregistrement |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 5.3 FEES_MANAGEMENT (Gestion des frais - Dashboard)
**Description** : Suivi consolidé des frais par étudiant/promotion  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Student, Promotion  
**Index recommandé** : student, promotion, status

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **student** | ObjectId/FK | 24 | FK, Non-null | Référence Student |
| **promotion** | ObjectId/FK | 24 | FK, Non-null | Référence Promotion |
| **totalFees** | Decimal | - | Non-null | Montant total dû |
| **totalPaid** | Decimal | - | Défaut: 0 | Total payé à ce jour |
| **balance** | Decimal | - | Calculé | Solde restant (totalFees - totalPaid) |
| **isFullyPaid** | Boolean | - | Calculé | Tous les frais payés |
| **lastPaymentDate** | DateTime | - | Nullable | Date du dernier paiement |
| **nextDueDate** | Date | - | Nullable | Prochaine échéance |
| **daysOverdue** | Integer | - | Calculé | Jours de retard |
| **status** | Enum | - | Non-null | Statut: current, overdue, completed, exempted |
| **notes** | String | 500 | Nullable | Remarques (exonération, etc.) |
| **updatedAt** | DateTime | - | Non-null, Auto | Mise à jour |

---

## 6. ENTITÉS DE COMMUNICATION

### 6.1 NOTIFICATION
**Description** : Notification (email, SMS, push) destinée aux utilisateurs  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : RecipientType (Student, Professor, Promotion, global), CreatedBy  
**Index recommandé** : recipientId, status, createdAt, expiresAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **title** | String | 200 | Non-null | Titre/Sujet |
| **message** | String | 2000 | Non-null | Contenu principal |
| **recipientType** | Enum | - | Non-null | Type: individual, promotion, global, system |
| **recipientId** | ObjectId/FK | 24 | FK, Nullable | ID du destinataire (si individual) |
| **promotionId** | ObjectId/FK | 24 | FK, Nullable | Promotion ciblée (si type=promotion) |
| **priority** | Enum | - | Défaut: normal | Priorité: low, normal, high, critical |
| **type** | Enum | - | Non-null | Type: info, warning, success, error, alert |
| **channels** | String[] | - | Défaut: [in-app] | Canaux: in-app, email, sms |
| **status** | Enum | - | Défaut: sent | Statut: drafted, sent, failed, pending |
| **createdBy** | ObjectId/FK | 24 | FK, Non-null | Admin créateur |
| **expiresAt** | DateTime | - | Nullable | Expiration (défaut: 30j) |
| **isRead** | Boolean | - | Défaut: false | Notification lue (per recipient) |
| **readAt** | DateTime | - | Nullable | Quand lue |
| **createdAt** | DateTime | - | Non-null, Auto | Date création |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 6.2 NOTIFICATION_SEEN (Lecture des notifications)
**Description** : Suivi des notifications lues par chaque utilisateur  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Notification, User  
**Index recommandé** : notification, user, readAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **notification** | ObjectId/FK | 24 | FK, Non-null | Référence Notification |
| **user** | ObjectId/FK | 24 | FK, Non-null | Référence User (destinataire) |
| **readAt** | DateTime | - | Nullable | Moment où notification a été lue |
| **isRead** | Boolean | - | Défaut: false | Notification lue |
| **createdAt** | DateTime | - | Non-null, Auto | Création |

---

## 7. ENTITÉS DE LOGS ET AUDIT

### 7.1 EVENT_LOG (Logs des événements système)
**Description** : Traçabilité complète des actions critiques  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : AuthorId (User), TargetId (entité modifiée)  
**Index recommandé** : authorId, entityType, action, createdAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **authorId** | ObjectId/FK | 24 | FK, Non-null | Utilisateur qui a effectué l'action |
| **authorName** | String | 100 | Non-null | Nom complet pour traçabilité |
| **entityType** | Enum | - | Non-null | Type d'entité: user, student, grade, payment, etc. |
| **entityId** | ObjectId/FK | 24 | FK, Nullable | ID de l'entité modifiée |
| **entityIdentifier** | String | 100 | Nullable | Identifiant lisible (matricule, code, etc.) |
| **action** | Enum | - | Non-null | Action: create, read, update, delete, validate, export |
| **oldValues** | Object | - | Nullable | Valeurs avant modification (JSON) |
| **newValues** | Object | - | Nullable | Valeurs après modification (JSON) |
| **status** | Enum | - | Défaut: success | Statut: success, failure, warning |
| **ipAddress** | String | 45 | Nullable | IP source (IPv4/IPv6) |
| **userAgent** | String | 500 | Nullable | User-Agent du navigateur |
| **details** | String | 1000 | Nullable | Détails supplémentaires |
| **createdAt** | DateTime | - | Non-null, Auto | Timestamp de l'action |

---

### 7.2 LOGIN_LOG (Historique des connexions)
**Description** : Traçabilité des accès au système  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : UserId  
**Index recommandé** : userId, loginAt, status

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **userId** | ObjectId/FK | 24 | FK, Non-null | Référence User |
| **matricule** | String | 20 | Non-null | Matricule (dénormalisation) |
| **status** | Enum | - | Non-null | Statut: success, failed, blocked |
| **loginAt** | DateTime | - | Non-null | Date/heure de connexion |
| **logoutAt** | DateTime | - | Nullable | Date/heure de déconnexion |
| **sessionDuration** | Integer | - | Nullable | Durée en secondes |
| **ipAddress** | String | 45 | Nullable | IP source |
| **userAgent** | String | 500 | Nullable | User-Agent |
| **failureReason** | String | 200 | Nullable | Motif si échouée (invalid credentials, blocked) |

---

### 7.3 USAGE_LOG (Utilisation du système)
**Description** : Statistiques d'utilisation des fonctionnalités  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : UserId  
**Index recommandé** : userId, featureName, usedAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **userId** | ObjectId/FK | 24 | FK, Non-null | Référence User |
| **featureName** | String | 100 | Non-null | Nom de la fonctionnalité |
| **action** | String | 100 | Non-null | Action effectuée (view, submit, download) |
| **resourceId** | ObjectId/FK | 24 | FK, Nullable | ID de la ressource utilisée |
| **duration** | Integer | - | Nullable | Durée en secondes |
| **status** | Enum | - | Défaut: success | Statut: success, error |
| **ipAddress** | String | 45 | Nullable | IP source |
| **usedAt** | DateTime | - | Non-null | Date/heure d'utilisation |

---

### 7.4 REPORT (Signalement de bugs/problèmes)
**Description** : Rapports d'incidents signalés par les utilisateurs  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : ReportedBy, AssignedTo  
**Index recommandé** : status, priority, reportedAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **title** | String | 200 | Non-null | Titre du problème |
| **description** | String | 2000 | Non-null | Description détaillée |
| **reportedBy** | ObjectId/FK | 24 | FK, Non-null | Utilisateur qui signale |
| **category** | Enum | - | Non-null | Catégorie: bug, feature_request, data_error, performance |
| **severity** | Enum | - | Non-null | Sévérité: low, medium, high, critical |
| **status** | Enum | - | Défaut: open | Statut: open, in-progress, resolved, closed, wontfix |
| **assignedTo** | ObjectId/FK | 24 | FK, Nullable | Admin/Dev assigné |
| **module** | String | 100 | Nullable | Module concerné |
| **affectedUsers** | String[] | - | Nullable | Utilisateurs impactés |
| **steps** | String | 1000 | Nullable | Étapes pour reproduire |
| **expectedBehavior** | String | 500 | Nullable | Comportement attendu |
| **actualBehavior** | String | 500 | Nullable | Comportement observé |
| **attachments** | String[] | - | Nullable | Fichiers joints (captures, logs) |
| **resolution** | String | 1000 | Nullable | Solution appliquée |
| **resolvedAt** | DateTime | - | Nullable | Date de résolution |
| **createdAt** | DateTime | - | Non-null, Auto | Date signalement |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

### 7.5 BUG_REPORT (Rapports de bugs)
**Description** : Rapports techniques de dysfonctionnements  
**Clé primaire** : ID (UUID/ObjectId)  
**Références externes** : Reporter  
**Index recommandé** : status, priority, createdAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **title** | String | 200 | Non-null | Titre du bug |
| **description** | String | 2000 | Non-null | Reproduction et symptômes |
| **reporter** | ObjectId/FK | 24 | FK, Non-null | Utilisateur qui signale |
| **status** | Enum | - | Défaut: open | Statut: open, assigned, in-progress, fixed, closed |
| **priority** | Enum | - | Défaut: medium | Priorité: low, medium, high, critical |
| **module** | String | 100 | Nullable | Module problématique |
| **errorMessage** | String | 500 | Nullable | Message d'erreur exact |
| **stackTrace** | String | 2000 | Nullable | Stack trace si disponible |
| **environment** | String | 100 | Nullable | Environnement: dev, staging, production |
| **browser** | String | 100 | Nullable | Navigateur/Client |
| **osVersion** | String | 100 | Nullable | OS et version |
| **attachments** | String[] | - | Nullable | Fichiers joints (screenshots, logs) |
| **createdAt** | DateTime | - | Non-null, Auto | Date du signalement |
| **updatedAt** | DateTime | - | Non-null, Auto | Modification |

---

## 8. ENTITÉS COMPLÉMENTAIRES

### 8.1 SETTINGS (Paramètres système)
**Description** : Configuration de l'application  
**Clé primaire** : ID (UUID/ObjectId)  

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **key** | String | 100 | Unique, Non-null | Clé du paramètre (ex: max_login_attempts) |
| **value** | Mixed | - | Non-null | Valeur (peut être string, number, boolean, JSON) |
| **description** | String | 255 | Nullable | Description du paramètre |
| **category** | String | 50 | Nullable | Catégorie (security, academic, financial, etc.) |
| **type** | Enum | - | Non-null | Type: string, integer, boolean, decimal, json |
| **updatedBy** | ObjectId/FK | 24 | FK, Nullable | Admin qui a modifié |
| **updatedAt** | DateTime | - | Non-null, Auto | Dernière modification |

---

### 8.2 COUNTER (Compteurs auto-incrémentiels)
**Description** : Gestion des numérotations auto-générées  
**Clé primaire** : ID (UUID/ObjectId)  
**Usage** : Pour matricules, numéros d'inscription, etc.

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique | Identifiant |
| **sequence** | String | 50 | Unique, Non-null | Nom du compteur (matricule, inscription, etc.) |
| **nextValue** | Integer | - | Non-null | Prochaine valeur à attribuer |
| **prefix** | String | 20 | Nullable | Préfixe (ISA, 2025, etc.) |
| **suffix** | String | 20 | Nullable | Suffixe |
| **padLength** | Integer | - | Défaut: 4 | Nombre de chiffres (zéro-complété) |
| **lastUsed** | DateTime | - | Nullable | Dernier utilisé |

---

### 8.3 CONTACT (Messages de contact)
**Description** : Messages reçus via formulaire de contact  
**Clé primaire** : ID (UUID/ObjectId)  
**Index recommandé** : email, status, createdAt

| Champ | Type | Taille | Contrainte | Description |
|-------|------|--------|-----------|-------------|
| **id** | UUID/ObjectId | 24 | PK, Unique, Non-null | Identifiant |
| **name** | String | 100 | Non-null | Nom du contact |
| **email** | String | 255 | Non-null | Email du contact |
| **phone** | String | 20 | Nullable | Téléphone de contact |
| **subject** | String | 200 | Non-null | Sujet du message |
| **message** | String | 2000 | Non-null | Contenu du message |
| **status** | Enum | - | Défaut: new | Statut: new, read, responded, closed |
| **respondedBy** | ObjectId/FK | 24 | FK, Nullable | Admin qui a répondu |
| **response** | String | 2000 | Nullable | Réponse fournie |
| **respondedAt** | DateTime | - | Nullable | Date de la réponse |
| **createdAt** | DateTime | - | Non-null, Auto | Date du message |

---

## NOTES GÉNÉRALISTES

### Conventions de Nommage
- **Clés primaires** : `id` (UUID ou ObjectId)
- **Clés étrangères** : Suffixe `_id` ou nommage explicite + référence en commentaire
- **Timestamps** : `createdAt`, `updatedAt` (auto-gérés)
- **Booléens** : Préfixe `is` ou `has` (isActive, hasAccess)
- **Énumérations** : minuscule avec underscore (in_progress, pending)

### Indexation Recommandée
- Clés primaires : Always
- Clés étrangères : Pour queries jointes fréquentes
- Champs de recherche : name, email, matricule, code
- Champs de filtrage : status, role, field, level, date, verified
- Champs de tri : createdAt, updatedAt, dueDate

### Contraintes de Validité
- **Email** : Format RFC 5322, unique
- **Téléphone** : Format international
- **Dates** : Pas de dates futures pour createdAt, logique cohérente (startDate < endDate)
- **Montants** : Positifs ou nuls
- **Notes** : Entre 0 et 20
- **Pourcentages** : Entre 0 et 100

### Sécurité des Données
- **Mots de passe** : Toujours hashés (Argon2)
- **Tokens** : Avec expiration
- **Accès** : Contrôle basé sur role + permissions granulaires
- **Audit** : Tous les changements tracés via EVENT_LOG
- **RGPD** : Possibilité d'anonymisation/suppression de données utilisateur

### Performance
- Indexes sur colonnes utilisées en WHERE/JOIN/SORT
- Dénormalisation légère (matricule, name dans logs/audits)
- Pagination obligatoire sur listes volumineuses
- Soft-delete recommandé pour entités sensibles

---

_Document établi selon standards de modélisation de données  
Dernière mise à jour : Janvier 2026_
