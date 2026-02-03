# DICTIONNAIRE DE DONNÉES - STRUCTURE MONGODB
## Application de Gestion Académique - ISA

---

## COLLECTION: users
*Collection principale utilisant le pattern discriminateur avec héritage (User → Student, Professor, Admin)*

### Champs de Base (User)

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré, Unique |
| address | Adresse de résidence de l'utilisateur | String | 255 | Requis, Min 1 car. |
| configs | Sous-document de configuration utilisateur | Object | - | - |
| configs.defaultPassword | Indique si mot de passe par défaut | Boolean | - | Défaut: true |
| configs.lastPasswordChange | Date du dernier changement de mot de passe | Date | - | Nullable |
| createdAt | Date de création de l'enregistrement | Date | - | Auto-généré |
| email | Adresse email de l'utilisateur | String | 100 | Requis, Unique, Lowercase |
| firstName | Prénom de l'utilisateur | String | 100 | Requis, Capitalisé |
| gender | Genre (male, female) | String | 10 | Requis, Enum |
| matricule | Numéro matricule de l'utilisateur | String | 50 | Requis, Unique |
| name | Nom de famille de l'utilisateur | String | 100 | Requis, Uppercase |
| password | Mot de passe crypté | String | 255 | Requis, Hashé |
| phone | Numéro de téléphone | String | 20 | Requis, Unique |
| resetPasswordExpires | Date d'expiration du token réinitialisation | Date | - | Nullable |
| resetPasswordToken | Token de réinitialisation de mot de passe | String | 255 | Nullable |
| role | Type d'utilisateur (discriminateur) | String | 20 | Enum: student, professor, admin, superAdmin |
| updatedAt | Date de dernière mise à jour | Date | - | Auto-généré |

### Champs Spécifiques: Student (extends User)

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| bacSeries | Série du baccalauréat | String | 15 | Requis, Enum: A1, A2, C, D, Techniques, autre |
| bacTranscript | Relevé de notes BAC (fichier) | String | 255 | Nullable |
| bacYear | Année d'obtention du baccalauréat | Number | 4 | Requis, Min: 1950 |
| birthDate | Date de naissance | Date | - | Requis |
| birthPlace | Lieu de naissance | String | 100 | Requis |
| cin | Numéro carte d'identité nationale | String | 20 | Unique, Sparse |
| emergencyContactName | Nom du contact d'urgence | String | 100 | Requis |
| emergencyContactPhone | Téléphone du contact d'urgence | String | 20 | Requis |
| emergencyContactRelation | Relation avec le contact d'urgence | String | 50 | Requis |
| field | Filière | String | 20 | Requis, Enum: btp, informatique, gestion |
| idDocument | Document d'identité (fichier) | String | 255 | Requis |
| identityPhoto | Photo d'identité (fichier) | String | 255 | Requis |
| inscriptionId | Numéro d'inscription unique | String | 50 | Unique |
| isRestricted | Étudiant restreint | Boolean | - | Défaut: false |
| level | Niveau académique | String | 5 | Enum: L1, L2, L3, M1, M2 |
| parcours | Tableau du parcours académique | Array | - | Tableau d'objets |
| parcours[].promotion | Référence vers Promotion | ObjectId | 24 | Référence Promotion |
| parcours[].status | Statut du parcours | String | 20 | Enum: in progress, completed, dropped, repeated |
| previousInstitution | Établissement précédent | String | 200 | Requis |
| promotionYear | Année de promotion | Number | 4 | Défaut: année courante |
| residenceCertificate | Certificat de résidence (fichier) | String | 255 | Requis |
| terms | Sous-document des acceptations | Object | - | - |
| terms.charterAcceptance | Acceptation charte informatique | Boolean | - | Défaut: true |
| terms.cguAcceptance | Acceptation des CGU | Boolean | - | Défaut: true |
| terms.engagementAcceptance | Acceptation contrat d'engagement | Boolean | - | Défaut: true |
| terms.privacyAcceptance | Acceptation politique confidentialité | Boolean | - | Défaut: true |
| verified | Compte vérifié | Boolean | - | Défaut: false |

### Champs Spécifiques: Professor (extends User)

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| department | Départements du professeur | Array[String] | - | Enum: informatique, gestion, btp |
| emailProfessional | Email professionnel | String | 100 | Nullable |
| hireDate | Date d'embauche | Date | - | Nullable |
| isPermanent | Professeur permanent | Boolean | - | Défaut: false |
| salaryAmount | Montant du salaire | Number | 10 | Défaut: 0 |
| salaryType | Type de salaire | String | 10 | Enum: mensuel, horaire |

### Champs Spécifiques: Admin (extends User)

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| function | Fonction de l'administrateur | String | 20 | Requis, Enum: RH, Scolarite, PDG, IT, Finance, Support |

---

## COLLECTION: pendingStudents
*Étudiants en attente de validation d'inscription*

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| acceptingTerms | Acceptation des conditions | Boolean | - | Défaut: true |
| address | Adresse de résidence | String | 255 | Requis, Min 10 car. |
| bacSeries | Série du baccalauréat | String | 15 | Requis, Enum |
| bacTranscript | Relevé de notes BAC (fichier) | String | 255 | Nullable |
| bacYear | Année d'obtention du BAC | Number | 4 | Requis, Min: 1950 |
| birthDate | Date de naissance | Date | - | Requis |
| birthPlace | Lieu de naissance | String | 100 | Requis |
| cin | Numéro CIN | String | 20 | Unique, Sparse |
| createdAt | Date de création | Date | - | Auto-généré |
| email | Adresse email | String | 100 | Requis, Unique |
| emergencyContactName | Nom du contact d'urgence | String | 100 | Requis |
| emergencyContactPhone | Téléphone contact d'urgence | String | 20 | Requis |
| emergencyContactRelation | Relation contact d'urgence | String | 50 | Requis |
| expiredToken | Token expiré | Boolean | - | Défaut: false |
| field | Filière demandée | String | 20 | Requis, Enum |
| firstName | Prénom | String | 100 | Requis, Min 2 car. |
| gender | Genre | String | 10 | Requis, Enum |
| idDocument | Document d'identité (fichier) | String | 255 | Requis |
| identityPhoto | Photo d'identité (fichier) | String | 255 | Requis |
| inscriptionId | Numéro d'inscription | String | 50 | Requis, Unique |
| lastDiploma | Dernier diplôme obtenu | String | 20 | Requis, Enum: Bepc, bac, licence |
| lastName | Nom de famille | String | 100 | Requis, Min 2 car. |
| levelAsked | Niveau demandé | String | 5 | Enum: L1, L2, L3, M1, M2 |
| phone | Numéro de téléphone | String | 20 | Requis, Unique |
| previousInstitution | Établissement précédent | String | 200 | Requis |
| rejectionReason | Raison du rejet | String | 500 | Nullable |
| residenceCertificate | Certificat résidence (fichier) | String | 255 | Requis |
| status | Statut de la demande | String | 30 | Enum: pending, approved, rejected |
| submissionDate | Date de soumission | Date | - | Défaut: Date.now |
| token | Token de vérification | String | 255 | Nullable |
| transactionNumber | Numéro de transaction unique | String | 100 | Requis, Unique |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: promotions

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| endDate | Date de fin de la promotion | Date | - | Nullable |
| field | Filière de la promotion | String | 20 | Nullable |
| isActive | Promotion active | Boolean | - | Défaut: false |
| level | Niveau de la promotion | String | 5 | Nullable |
| name | Nom de la promotion | String | 100 | Unique, Nullable |
| startDate | Date de début de la promotion | Date | - | Nullable |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: modules

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| code | Code du module (ex: MATH101) | String | 20 | Requis, Unique |
| coefficient | Coefficient du module | Number | 2 | Requis |
| createdAt | Date de création | Date | - | Auto-généré |
| credits | Nombre de crédits | Number | 2 | Requis |
| description | Description du module | String | 1000 | Requis |
| files | Tableau de chemins vers fichiers PDF | Array[String] | - | Défaut: [] |
| hours | Nombre d'heures du module | Number | 3 | Requis |
| teacher | Référence vers professeur responsable | ObjectId | 24 | Référence User, Nullable |
| teachingUnit | Référence vers unité d'enseignement | ObjectId | 24 | Référence TeachingUnit |
| title | Titre du module | String | 255 | Requis |
| type | Type de cours | String | 20 | Enum: Cours Magistral, TD, TP |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: teachingUnits

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| code | Code de l'unité d'enseignement | String | 20 | Requis, Unique |
| createdAt | Date de création | Date | - | Auto-généré |
| credits | Nombre de crédits | Number | 2 | Défaut: 0 |
| description | Description de l'UE | String | 1000 | Requis |
| field | Filière | String | 20 | Requis, Enum: informatique, btp, gestion |
| level | Niveau académique | String | 5 | Requis, Enum: L1-M2 |
| name | Nom de l'unité d'enseignement | String | 255 | Requis |
| semester | Semestre | String | 5 | Requis, Enum: S1-S10 |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: assignments

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| description | Description du devoir | String | 1000 | Requis |
| dueDate | Date limite de soumission | Date | - | Requis |
| fileUrl | URL du fichier du devoir | String | 255 | Nullable |
| isActive | Devoir actif | Boolean | - | Défaut: true |
| lockedGrade | Notes verrouillées | Boolean | - | Défaut: false |
| module | Référence vers Module | ObjectId | 24 | Requis, Référence Module |
| professor | Référence vers Professeur | ObjectId | 24 | Requis, Référence User |
| promotion | Référence vers Promotion | ObjectId | 24 | Requis, Référence Promotion |
| session | Session d'examen | String | 15 | Enum: normal, rattrapage |
| submissionLocation | Lieu de soumission | String | 15 | Enum: online, in-person |
| title | Titre du devoir | String | 255 | Requis |
| type | Type de devoir | String | 20 | Requis, Enum: homework, project, exam |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: submissions

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| assignment | Référence vers Assignment | ObjectId | 24 | Requis, Référence Assignment |
| createdAt | Date de création | Date | - | Auto-généré |
| feedback | Commentaire du professeur | String | 1000 | Nullable |
| fileUrl | URL du fichier soumis | String | 255 | Nullable |
| grade | Note obtenue (sur 20) | Number | 4 | Min: 0, Max: 20 |
| status | Statut de la soumission | String | 20 | Enum: submitted, graded, late, missing |
| student | Référence vers Étudiant | ObjectId | 24 | Requis, Référence User |
| submittedAt | Date de soumission | Date | - | Défaut: Date.now |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: tutionFees

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| field | Filière | String | 20 | Nullable |
| installments | Tableau des tranches de paiement | Array | - | Tableau d'objets |
| installments[].amount | Montant de la tranche | Number | 10 | Requis |
| installments[].dueDate | Date d'échéance | Date | - | Nullable |
| installments[].label | Libellé de la tranche | String | 100 | Requis |
| installments[].lastReminderDate | Date du dernier rappel | Date | - | Nullable |
| installments[].method | Méthode de paiement | String | 10 | Enum: mobile, bank |
| installments[].numberOfReminders | Nombre de rappels envoyés | Number | 3 | Défaut: 0 |
| installments[].paymentDate | Date de paiement | Date | - | Nullable |
| installments[].proofFile | Fichier de preuve | String | 255 | Nullable |
| installments[].transactionRef | Référence de transaction | String | 100 | Nullable |
| installments[].verified | Paiement vérifié | Boolean | - | Défaut: false |
| installments[].verifiedBy | Vérifié par (User ID) | ObjectId | 24 | Référence User, Nullable |
| level | Niveau académique | String | 5 | Nullable |
| promotion | Référence vers Promotion | ObjectId | 24 | Référence Promotion, Nullable |
| totalAmount | Montant total des frais | Number | 10 | Requis |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |
| user | Référence vers Utilisateur | ObjectId | 24 | Requis, Référence User |
| year | Année académique | Number | 4 | Nullable |

---

## COLLECTION: payments

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| amount | Montant du paiement | Number | 10 | Requis |
| date | Date du paiement | Date | - | Défaut: Date.now |
| installmentLabel | Libellé de la tranche payée | String | 100 | Nullable |
| method | Méthode de paiement | String | 20 | Requis, Enum: mobile_money, cash, card |
| paymentProof | Preuve de paiement (fichier) | String | 255 | Nullable |
| paymentReference | Référence de paiement | String | 100 | Nullable |
| tuitionFeeId | Référence vers TuitionFee | ObjectId | 24 | Requis, Référence TuitionFee |
| userId | Référence vers User | ObjectId | 24 | Requis, Référence User |

---

## COLLECTION: schedules

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| approvedByCron | Approuvé automatiquement | Boolean | - | Défaut: false |
| approvedManuallyAfterCronBy | Approuvé manuellement par | ObjectId | 24 | Référence User, Nullable |
| courseType | Type de cours | String | 10 | Enum: cm, td, tp, exam, other |
| createdAt | Date de création | Date | - | Auto-généré |
| createdBy | Créé par | ObjectId | 24 | Référence User |
| date | Date du cours | Date | - | Requis |
| department | Départements concernés | Array[String] | - | Tableau de chaînes |
| description | Description du cours | String | 1000 | Nullable |
| duration | Durée en minutes | Number | 3 | Requis |
| endTime | Heure de fin (format HH:MM) | String | 5 | Requis |
| googleMeetLink | Lien Google Meet | String | 255 | Nullable |
| modifiedBy | Modifié par | ObjectId | 24 | Référence User, Nullable |
| module | Référence vers Module | ObjectId | 24 | Référence Module, Nullable |
| professor | Référence vers Professeur | ObjectId | 24 | Référence User, Nullable |
| promotions | Références vers Promotions | Array[ObjectId] | - | Référence Promotion |
| room | Salle de cours | String | 50 | Nullable |
| startTime | Heure de début (format HH:MM) | String | 5 | Requis |
| status | Statut du cours | String | 20 | Enum: pending, missed, done |
| studentReclamations | Réclamations étudiantes | Array[ObjectId] | - | Référence User |
| title | Titre du cours | String | 255 | Requis |
| type | Mode de cours | String | 15 | Enum: presentiel, distanciel, hybride |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: notifications

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| expireAt | Date d'expiration | Date | - | Défaut: +30 jours, TTL Index |
| informationType | Type d'information | String | 30 | Enum: schedule, academic, administrative, etc. |
| linkTo | Lien associé | String | 255 | Nullable |
| message | Contenu de la notification | String | 1000 | Requis |
| promotion | Références vers Promotions | Array[ObjectId] | - | Référence Promotion |
| title | Titre de la notification | String | 255 | Requis |
| type | Type de notification | String | 20 | Enum: individual, global, promotion, admin, professor, student, superAdmin |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |
| user | Référence vers User | ObjectId | 24 | Référence User, Nullable |
| warningLevel | Niveau d'alerte | String | 10 | Enum: info, warning, critical |

---

## COLLECTION: resources

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| description | Description de la ressource | String | 1000 | Requis |
| link | Lien vers la ressource | String | 255 | Requis |
| module | Référence vers Module | ObjectId | 24 | Requis, Référence Module |
| professor | Référence vers Professeur | ObjectId | 24 | Requis, Référence User |
| promotion | Référence vers Promotion | ObjectId | 24 | Requis, Référence Promotion |
| title | Titre de la ressource | String | 255 | Requis |
| type | Type de ressource | String | 20 | Requis, Enum: video, document |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: administrativeRequests

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| handledBy | Traité par | ObjectId | 24 | Référence User, Nullable |
| matricule | Matricule de l'étudiant | String | 50 | Requis, Indexé |
| promotion | Référence vers Promotion | ObjectId | 24 | Requis, Référence Promotion |
| recoveryDate | Date de récupération | Date | - | Nullable |
| requestType | Type de demande | String | 30 | Requis, Enum: transcript, enrollment_certificate, diploma |
| status | Statut de la demande | String | 30 | Enum: pending, in-progress, recoverable, delivered, cancelled |
| student | Référence vers Étudiant | ObjectId | 24 | Requis, Référence User |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: bugReports

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| description | Description du bug | String | 1000 | Requis |
| isResolved | Bug résolu | Boolean | - | Défaut: false |
| priority | Priorité | String | 10 | Enum: low, medium, high, critical |
| reporter | Référence vers Rapporteur | ObjectId | 24 | Requis, Référence User |
| reporterMatricule | Matricule du rapporteur | String | 50 | Requis |
| title | Titre du bug | String | 255 | Requis |
| type | Type de rapport | String | 20 | Requis, Enum: bug, feature, improvement, other |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: reports

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| action | Action effectuée | String | 255 | Requis |
| authorId | Identifiant de l'auteur | String | 50 | Requis, Indexé |
| authorName | Nom de l'auteur | String | 100 | Requis |
| createdAt | Date de création | Date | - | Auto-généré, Indexé |
| details | Détails de l'action | String | 500 | Requis |
| role | Rôle de l'auteur | String | 20 | Requis, Indexé |

---

## COLLECTION: gradesAuthentications

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| promotion | Référence vers Promotion | ObjectId | 24 | Requis, Référence Promotion |
| student | Référence vers Étudiant | ObjectId | 24 | Requis, Référence User |
| UniqueToken | Token unique pour authentification | String | 255 | Requis |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: feesManagement

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| createdAt | Date de création | Date | - | Auto-généré |
| echeances | Tableau des échéances | Array | - | Tableau d'objets |
| echeances[].amount | Montant de l'échéance | Number | 10 | Requis |
| echeances[].date | Date d'échéance | Date | - | Requis |
| echeances[].label | Libellé de l'échéance | String | 100 | Requis |
| fees | Montant total des frais | Number | 10 | Requis |
| field | Filière | String | 20 | Enum: gestion, informatique, btp |
| level | Niveau académique | String | 5 | Requis |
| updatedAt | Date de mise à jour | Date | - | Auto-généré |

---

## COLLECTION: settings

| Nom de Rubrique | Description | Type MongoDB | Taille | Contraintes |
|-----------------|-------------|--------------|--------|-------------|
| _id | Identifiant unique MongoDB | ObjectId | 24 | Auto-généré |
| documentReviewDate | Date de révision des documents | Date | - | Nullable |
| finalEnrollmentDate | Date limite d'inscription finale | Date | - | Nullable |
| isAutomatic | Processus automatique | Boolean | - | Défaut: false |
| isInscriptionOpen | Inscriptions ouvertes | Boolean | - | Défaut: false |
| isResultAvailable | Résultats disponibles | Boolean | - | Défaut: false |
| maintenanceMode | Mode maintenance | Boolean | - | Défaut: false |
| plannedStartDate | Date de début prévue | Date | - | Nullable |
| registrationDate | Date d'ouverture inscriptions | Date | - | Nullable |
| resultsPublicationDate | Date publication résultats | Date | - | Nullable |

---

## LÉGENDE DES TYPES MONGODB

| Type | Description | Exemple |
|------|-------------|---------|
| **ObjectId** | Identifiant unique MongoDB (12 bytes) | `507f1f77bcf86cd799439011` |
| **String** | Chaîne de caractères | `"ISA"` |
| **Number** | Nombre (Integer ou Float) | `42`, `3.14` |
| **Boolean** | Valeur booléenne | `true`, `false` |
| **Date** | Date et heure | `ISODate("2026-01-24T...")` |
| **Array** | Tableau de valeurs | `["info", "gestion"]` |
| **Object** | Sous-document imbriqué | `{ key: "value" }` |
| **Array[Type]** | Tableau typé | `Array[ObjectId]` |

---

## CONVENTIONS DE NOTATION

- **champ** : Champ simple
- **champ.sousChamp** : Sous-document (embedded document)
- **champ[]** : Tableau (array)
- **champ[].element** : Élément dans un tableau d'objets

---

## INDEX ET PERFORMANCES

### Index Composites Importants
- `users` : `{ role: 1, matricule: 1 }`
- `students` : `{ "parcours.promotion": 1 }`
- `tutionFees` : `{ user: 1, promotion: 1 }` (unique)
- `submissions` : `{ student: 1, assignment: 1 }` (unique)
- `schedules` : `{ promotions: 1, module: 1, date: 1, startTime: 1 }`

### Index TTL (Time To Live)
- `notifications` : `{ expireAt: 1 }` (expire automatiquement après 30 jours)

---

**Total des Collections : 16**  
**Total des Champs (incluant imbriqués) : 200+**

*Document généré le 24 janvier 2026*  
*Application de Gestion Académique - ISA*  
*Structure MongoDB avec Documents Imbriqués*
