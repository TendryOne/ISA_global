# DICTIONNAIRE DE DONNÉES
## Application de Gestion Académique - ISA

---

| Nom de Rubrique | Description | Type | Taille |
|-----------------|-------------|------|--------|
| acceptingTerms | Acceptation des conditions générales par l'étudiant en attente | AN | 5 |
| action | Action effectuée dans le rapport d'activité | AN | 255 |
| address | Adresse de résidence de l'utilisateur | AN | 255 |
| amount | Montant d'un paiement ou d'une échéance | N | 10 |
| approvedByCron | Indication si l'emploi du temps a été approuvé automatiquement | AN | 5 |
| approvedManuallyAfterCronBy | ID de l'administrateur ayant approuvé manuellement après le cron | AN | 24 |
| assignment | Référence vers un devoir | AN | 24 |
| authorId | Identifiant de l'auteur du rapport | AN | 50 |
| authorName | Nom de l'auteur du rapport | AN | 100 |
| bacSeries | Série du baccalauréat (A1, A2, C, D, Techniques, autre) | AN | 15 |
| bacTranscript | Relevé de notes du baccalauréat (fichier) | AN | 255 |
| bacYear | Année d'obtention du baccalauréat | N | 4 |
| birthDate | Date de naissance | D | 10 |
| birthPlace | Lieu de naissance | AN | 100 |
| charterAcceptance | Acceptation de la charte informatique | AN | 5 |
| cin | Numéro de carte d'identité nationale | AN | 20 |
| code | Code du module ou de l'unité d'enseignement | AN | 20 |
| coefficient | Coefficient du module | N | 2 |
| courseType | Type de cours (cm, td, tp, exam, other) | AN | 10 |
| createdAt | Date de création de l'enregistrement | D | 20 |
| createdBy | ID de l'utilisateur ayant créé l'enregistrement | AN | 24 |
| credits | Nombre de crédits du module ou de l'unité d'enseignement | N | 2 |
| date | Date générique (paiement, échéance, emploi du temps) | D | 10 |
| defaultPassword | Indication si l'utilisateur utilise le mot de passe par défaut | AN | 5 |
| department | Département(s) du professeur (informatique, gestion, btp) | AN | 100 |
| description | Description détaillée (module, devoir, ressource, etc.) | AN | 1000 |
| details | Détails de l'action dans le rapport d'activité | AN | 500 |
| documentReviewDate | Date de révision des documents | D | 10 |
| dueDate | Date limite de soumission d'un devoir ou d'une échéance | D | 10 |
| duration | Durée en minutes (emploi du temps) | N | 3 |
| email | Adresse email de l'utilisateur | AN | 100 |
| emailProfessional | Email professionnel du professeur | AN | 100 |
| emergencyContactName | Nom du contact d'urgence | AN | 100 |
| emergencyContactPhone | Téléphone du contact d'urgence | AN | 20 |
| emergencyContactRelation | Relation avec le contact d'urgence | AN | 50 |
| endDate | Date de fin (promotion) | D | 10 |
| endTime | Heure de fin (emploi du temps) | AN | 5 |
| engagementAcceptance | Acceptation du contrat d'engagement | AN | 5 |
| expireAt | Date d'expiration de la notification | D | 20 |
| expiredToken | Indication si le token a expiré | AN | 5 |
| feedback | Commentaire ou retour sur une soumission | AN | 1000 |
| fees | Montant des frais de scolarité | N | 10 |
| field | Filière (btp, informatique, gestion) | AN | 20 |
| fileUrl | URL ou chemin du fichier (devoir, soumission) | AN | 255 |
| files | Liste de fichiers liés au module | AN | 1000 |
| finalEnrollmentDate | Date limite d'inscription finale | D | 10 |
| firstName | Prénom de l'utilisateur | AN | 100 |
| function | Fonction de l'administrateur (RH, Scolarite, PDG, IT, Finance, Support) | AN | 20 |
| gender | Genre de l'utilisateur (male, female) | AN | 10 |
| googleMeetLink | Lien Google Meet pour un cours en distanciel | AN | 255 |
| grade | Note obtenue (sur 20) | N | 4 |
| handledBy | ID de l'utilisateur ayant traité la demande | AN | 24 |
| hireDate | Date d'embauche du professeur | D | 10 |
| hours | Nombre d'heures du module | N | 3 |
| idDocument | Document d'identité (fichier) | AN | 255 |
| identityPhoto | Photo d'identité (fichier) | AN | 255 |
| informationType | Type d'information de la notification | AN | 30 |
| inscriptionId | Numéro d'inscription | AN | 50 |
| installmentLabel | Libellé de la tranche de paiement | AN | 100 |
| installments | Liste des tranches de paiement | AN | 5000 |
| isActive | Indication si l'entité est active (promotion, devoir) | AN | 5 |
| isAutomatic | Indication si le processus est automatique | AN | 5 |
| isBackground | Indication si une tâche s'exécute en arrière-plan | AN | 5 |
| isInscriptionOpen | Indication si les inscriptions sont ouvertes | AN | 5 |
| isPermanent | Indication si le professeur est permanent | AN | 5 |
| isResolved | Indication si le bug est résolu | AN | 5 |
| isRestricted | Indication si l'étudiant est restreint | AN | 5 |
| isResultAvailable | Indication si les résultats sont disponibles | AN | 5 |
| label | Libellé d'une échéance | AN | 100 |
| lastDiploma | Dernier diplôme obtenu (Bepc, bac, licence) | AN | 20 |
| lastPasswordChange | Date du dernier changement de mot de passe | D | 20 |
| lastReminderDate | Date du dernier rappel | D | 10 |
| lastName | Nom de famille de l'utilisateur | AN | 100 |
| level | Niveau académique (L1, L2, L3, M1, M2) | AN | 5 |
| levelAsked | Niveau demandé lors de la pré-inscription | AN | 5 |
| link | Lien vers une ressource | AN | 255 |
| linkTo | Lien associé à une notification | AN | 255 |
| lockedGrade | Indication si la note est verrouillée | AN | 5 |
| maintenanceMode | Mode maintenance activé | AN | 5 |
| matricule | Numéro matricule de l'utilisateur | AN | 50 |
| message | Message de la notification | AN | 1000 |
| method | Méthode de paiement (mobile_money, cash, card, mobile, bank) | AN | 20 |
| modifiedBy | ID de l'utilisateur ayant modifié l'enregistrement | AN | 24 |
| module | Référence vers un module | AN | 24 |
| name | Nom de l'utilisateur ou de la promotion | AN | 100 |
| numberOfReminders | Nombre de rappels envoyés | N | 3 |
| parcours | Parcours académique de l'étudiant | AN | 5000 |
| password | Mot de passe de l'utilisateur (crypté) | AN | 255 |
| paymentDate | Date du paiement | D | 10 |
| paymentProof | Preuve de paiement (fichier) | AN | 255 |
| paymentReference | Référence de paiement | AN | 100 |
| phone | Numéro de téléphone | AN | 20 |
| plannedStartDate | Date de début prévue | D | 10 |
| previousInstitution | Établissement précédent | AN | 200 |
| priority | Priorité du rapport de bug (low, medium, high, critical) | AN | 10 |
| privacyAcceptance | Acceptation de la politique de confidentialité | AN | 5 |
| professor | Référence vers un professeur | AN | 24 |
| promotion | Référence vers une promotion | AN | 24 |
| promotions | Liste des promotions concernées | AN | 500 |
| promotionYear | Année de promotion | N | 4 |
| proofFile | Fichier de preuve de paiement | AN | 255 |
| recoveryDate | Date de récupération de document | D | 10 |
| registrationDate | Date d'ouverture des inscriptions | D | 10 |
| rejectionReason | Raison du rejet de la candidature | AN | 500 |
| reporter | Référence vers le rapporteur d'un bug | AN | 24 |
| reporterMatricule | Matricule du rapporteur | AN | 50 |
| requestType | Type de demande administrative (transcript, enrollment_certificate, diploma) | AN | 30 |
| resetPasswordExpires | Date d'expiration du token de réinitialisation | D | 20 |
| resetPasswordToken | Token de réinitialisation de mot de passe | AN | 255 |
| residenceCertificate | Certificat de résidence (fichier) | AN | 255 |
| resultsPublicationDate | Date de publication des résultats | D | 10 |
| role | Rôle de l'utilisateur (student, professor, admin, superAdmin) | AN | 20 |
| room | Salle de cours | AN | 50 |
| salaryAmount | Montant du salaire | N | 10 |
| salaryType | Type de salaire (mensuel, horaire) | AN | 10 |
| semester | Semestre (S1 à S10) | AN | 5 |
| session | Session d'examen (normal, rattrapage) | AN | 15 |
| startDate | Date de début (promotion) | D | 10 |
| startTime | Heure de début (emploi du temps) | AN | 5 |
| status | Statut générique (pending, approved, rejected, etc.) | AN | 30 |
| student | Référence vers un étudiant | AN | 24 |
| studentReclamations | Liste des réclamations étudiantes | AN | 500 |
| submissionDate | Date de soumission | D | 10 |
| submissionLocation | Lieu de soumission (online, in-person) | AN | 15 |
| submittedAt | Date et heure de soumission | D | 20 |
| teacher | Référence vers l'enseignant responsable | AN | 24 |
| teachingUnit | Référence vers l'unité d'enseignement | AN | 24 |
| title | Titre (module, devoir, ressource, notification, bug) | AN | 255 |
| token | Token de vérification ou d'authentification | AN | 255 |
| totalAmount | Montant total des frais | N | 10 |
| transactionNumber | Numéro de transaction unique | AN | 100 |
| transactionRef | Référence de transaction | AN | 100 |
| tuitionFeeId | Référence vers les frais de scolarité | AN | 24 |
| type | Type générique (module, devoir, notification, ressource) | AN | 50 |
| UniqueToken | Token unique pour l'authentification des notes | AN | 255 |
| updatedAt | Date de dernière mise à jour | D | 20 |
| user | Référence vers un utilisateur | AN | 24 |
| userId | Identifiant de l'utilisateur | AN | 24 |
| verified | Indication si l'entité est vérifiée | AN | 5 |
| verifiedBy | ID de l'utilisateur ayant vérifié | AN | 24 |
| warningLevel | Niveau d'alerte de la notification (info, warning, critical) | AN | 10 |
| year | Année académique | N | 4 |

---

**Légende des types :**
- **N** : Numérique
- **AN** : Alphanumérique
- **D** : Date

**Total des rubriques : 144**

---

*Document généré le 24 janvier 2026*
*Application de Gestion Académique - ISA*
