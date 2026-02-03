# ANALYSE ET SPÉCIFICATION DES BESOINS
## Plateforme de Gestion Académique et Administrative – ISA

---

## 1. DIAGRAMMES DE CAS D'UTILISATION PAR ACTEUR

### 1.1 Diagramme Étudiant (17 cas d'utilisation)

```plantuml
@startuml
!theme plain
skinparam actorStyle awesome

left to right direction

actor "Étudiant" as Student

' Packages par domaine
package "Authentification" {
    usecase "Se connecter" as UC1
    usecase "Se déconnecter" as UC2
    usecase "Réinitialiser mot de passe" as UC3
    usecase "Modifier mot de passe" as UC4
    usecase "S'inscrire en ligne" as UC5
}

package "Profil" {
    usecase "Consulter profil" as UC9
    usecase "Modifier informations" as UC10
}

package "Académique" {
    usecase "Consulter emploi du temps" as UC15
    usecase "Consulter notes" as UC19
    usecase "Consulter ressources" as UC23
    usecase "Consulter planning" as UC26
}

package "Pédagogique" {
    usecase "Soumettre devoir" as UC17
}

package "Administratif & Financier" {
    usecase "Demander document" as UC29
    usecase "Consulter historique demandes" as UC32
    usecase "Consulter situation financière" as UC35
}

package "Communication" {
    usecase "Consulter notifications" as UC41
    usecase "Marquer notification lue" as UC42
}

package "Support" {
    usecase "Signaler absence professeur" as UC27
    usecase "Signaler bug" as UC45
}

' Relations
Student --> UC1
Student --> UC2
Student --> UC3
Student --> UC4
Student --> UC5
Student --> UC9
Student --> UC10
Student --> UC15
Student --> UC17
Student --> UC19
Student --> UC23
Student --> UC26
Student --> UC27
Student --> UC29
Student --> UC32
Student --> UC35
Student --> UC41
Student --> UC42
Student --> UC45

' Includes et Extends
UC3 ..> UC4 : <<extend>>
UC5 ..> "Valider format" : <<include>>
UC5 ..> "Uploader photo" : <<include>>

@enduml
```

---

### 1.2 Diagramme Professeur (15 cas d'utilisation)

```plantuml
@startuml
!theme plain
skinparam actorStyle awesome

left to right direction

actor "Professeur" as Professor

' Packages par domaine
package "Authentification" {
    usecase "Se connecter" as UC1
    usecase "Se déconnecter" as UC2
    usecase "Réinitialiser mot de passe" as UC3
    usecase "Modifier mot de passe" as UC4
}

package "Profil" {
    usecase "Consulter profil" as UC9
    usecase "Modifier informations" as UC10
}

package "Académique" {
    usecase "Consulter emploi du temps" as UC15
    usecase "Consulter planning" as UC26
}

package "Gestion Pédagogique" {
    usecase "Créer devoir/examen" as UC16
    usecase "Noter soumission" as UC18
    usecase "Consulter notes" as UC19
    usecase "Verrouiller notes" as UC20
    usecase "Exporter notes" as UC21
    usecase "Déposer ressources" as UC22
}

package "Communication" {
    usecase "Consulter notifications" as UC41
    usecase "Marquer notification lue" as UC42
}

package "Support" {
    usecase "Signaler bug" as UC45
}

' Relations
Professor --> UC1
Professor --> UC2
Professor --> UC3
Professor --> UC4
Professor --> UC9
Professor --> UC10
Professor --> UC15
Professor --> UC16
Professor --> UC18
Professor --> UC19
Professor --> UC20
Professor --> UC21
Professor --> UC22
Professor --> UC26
Professor --> UC41
Professor --> UC42
Professor --> UC45

' Includes et Extends
UC16 ..> "Définir date limite" : <<include>>
UC16 ..> "Joindre fichier" : <<extend>>
UC18 ..> "Ajouter feedback" : <<extend>>
UC19 ..> "Calculer moyennes" : <<include>>

@enduml
```

---

### 1.3 Diagramme Administrateur (23 cas d'utilisation)

```plantuml
@startuml
!theme plain
skinparam actorStyle awesome

left to right direction

actor "Administrateur" as Admin

' Packages par domaine
package "Authentification & Accès" {
    usecase "Se connecter" as UC1
    usecase "Se déconnecter" as UC2
}

package "Gestion Utilisateurs" {
    usecase "Valider inscription" as UC6
    usecase "Gérer profil étudiant" as UC7
    usecase "Gérer profil professeur" as UC8
}

package "Gestion Académique" {
    usecase "Gérer promotions" as UC11
    usecase "Gérer modules" as UC12
    usecase "Gérer UE" as UC13
    usecase "Affecter étudiants" as UC14
}

package "Emploi du Temps" {
    usecase "Créer séance" as UC24
    usecase "Modifier séance" as UC25
    usecase "Mettre à jour statut séance" as UC28
}

package "Gestion Administrative" {
    usecase "Traiter demande" as UC30
    usecase "Générer document PDF" as UC31
}

package "Gestion Financière" {
    usecase "Définir frais scolarité" as UC33
    usecase "Enregistrer paiement" as UC34
    usecase "Générer rappel paiement" as UC36
    usecase "Valider paiement" as UC37
}

package "Communication" {
    usecase "Envoyer notification individuelle" as UC38
    usecase "Envoyer notification promotion" as UC39
    usecase "Envoyer notification globale" as UC40
}

package "Reporting" {
    usecase "Consulter tableau de bord" as UC43
    usecase "Générer rapport activité" as UC44
    usecase "Consulter logs système" as UC46
}

' Relations
Admin --> UC1
Admin --> UC2
Admin --> UC6
Admin --> UC7
Admin --> UC8
Admin --> UC11
Admin --> UC12
Admin --> UC13
Admin --> UC14
Admin --> UC24
Admin --> UC25
Admin --> UC28
Admin --> UC30
Admin --> UC31
Admin --> UC33
Admin --> UC34
Admin --> UC36
Admin --> UC37
Admin --> UC38
Admin --> UC39
Admin --> UC40
Admin --> UC43
Admin --> UC44
Admin --> UC46

' Includes et Extends
UC6 ..> UC38 : <<extend>>
UC30 ..> UC31 : <<include>>
UC34 ..> UC36 : <<extend>>
UC37 ..> UC38 : <<extend>>

@enduml
```

---

### 1.4 Diagramme Super Admin (25 cas d'utilisation - Admin + 2 spécifiques)

```plantuml
@startuml
!theme plain
skinparam actorStyle awesome

left to right direction

actor "Super Admin" as SuperAdmin

' Packages par domaine
package "Authentification & Accès" {
    usecase "Se connecter" as UC1
    usecase "Se déconnecter" as UC2
}

package "Gestion Utilisateurs" {
    usecase "Valider inscription" as UC6
    usecase "Gérer profil étudiant" as UC7
    usecase "Gérer profil professeur" as UC8
}

package "Gestion Académique" {
    usecase "Gérer promotions" as UC11
    usecase "Gérer modules" as UC12
    usecase "Gérer UE" as UC13
    usecase "Affecter étudiants" as UC14
}

package "Emploi du Temps" {
    usecase "Créer séance" as UC24
    usecase "Modifier séance" as UC25
    usecase "Mettre à jour statut" as UC28
}

package "Gestion Administrative" {
    usecase "Traiter demande" as UC30
    usecase "Générer document PDF" as UC31
}

package "Gestion Financière" {
    usecase "Définir frais scolarité" as UC33
    usecase "Enregistrer paiement" as UC34
    usecase "Générer rappel paiement" as UC36
    usecase "Valider paiement" as UC37
}

package "Communication" {
    usecase "Envoyer notification individuelle" as UC38
    usecase "Envoyer notification promotion" as UC39
    usecase "Envoyer notification globale" as UC40
}

package "Reporting" {
    usecase "Consulter tableau de bord" as UC43
    usecase "Générer rapport activité" as UC44
    usecase "Consulter logs système" as UC46
}

package "Tâches Automatisées" {
    usecase "Mettre à jour promotions" as UC47 <<automated>>
    usecase "Nettoyer notifications" as UC50 <<automated>>
}

' Relations (tous les droits Admin + UC47, UC50)
SuperAdmin --> UC1
SuperAdmin --> UC2
SuperAdmin --> UC6
SuperAdmin --> UC7
SuperAdmin --> UC8
SuperAdmin --> UC11
SuperAdmin --> UC12
SuperAdmin --> UC13
SuperAdmin --> UC14
SuperAdmin --> UC24
SuperAdmin --> UC25
SuperAdmin --> UC28
SuperAdmin --> UC30
SuperAdmin --> UC31
SuperAdmin --> UC33
SuperAdmin --> UC34
SuperAdmin --> UC36
SuperAdmin --> UC37
SuperAdmin --> UC38
SuperAdmin --> UC39
SuperAdmin --> UC40
SuperAdmin --> UC43
SuperAdmin --> UC44
SuperAdmin --> UC46
SuperAdmin --> UC47
SuperAdmin --> UC50

' Includes et Extends (hérités d'Admin)
UC6 ..> UC38 : <<extend>>
UC30 ..> UC31 : <<include>>
UC34 ..> UC36 : <<extend>>
UC37 ..> UC38 : <<extend>>

note right of SuperAdmin
  Hérite de tous les droits
  d'Administrateur + UC47, UC50
  pour les tâches automatisées
end note

@enduml
```

---

## 2. DIAGRAMMES DE CAS D'UTILISATION DÉTAILLÉS PAR MODULE

### 2.1 Module Gestion Authentification et Utilisateurs

```plantuml
@startuml
!theme plain
skinparam actorStyle awesome

title Cas d'Utilisation Détaillés - Authentification & Gestion Utilisateurs

' Acteurs
actor "Étudiant" as Student
actor "Professeur" as Professor
actor "Administrateur" as Admin
actor "Système Email" as EmailSystem

' Cas d'utilisation principaux
rectangle "Gestion Authentification" {
    usecase "Se connecter" as Login
    usecase "Se déconnecter" as Logout
    usecase "S'inscrire en ligne" as Register
    usecase "Réinitialiser mot de passe" as ResetPwd
    usecase "Modifier mot de passe" as ChangePwd
    usecase "Valider format données" as ValidateFormat
    usecase "Vérifier identifiants" as CheckCredentials
    usecase "Créer session" as CreateSession
    usecase "Envoyer email confirmation" as SendEmail
    usecase "Générer token temporaire" as GenerateToken
}

rectangle "Gestion Utilisateurs" {
    usecase "Valider inscription" as ValidateRegister
    usecase "Générer matricule" as GenerateMatricule
    usecase "Créer compte utilisateur" as CreateAccount
    usecase "Consulter profil" as ViewProfile
    usecase "Modifier informations\npersonnelles" as UpdateProfile
    usecase "Uploader photo identité" as UploadPhoto
    usecase "Gérer profil étudiant" as ManageStudent
    usecase "Gérer profil professeur" as ManageProfessor
    usecase "Activer/Désactiver compte" as ToggleAccount
}

' Relations acteurs principaux
Student --> Register
Student --> Login
Student --> Logout
Student --> ResetPwd
Student --> ChangePwd
Student --> ViewProfile
Student --> UpdateProfile

Professor --> Login
Professor --> Logout
Professor --> ResetPwd
Professor --> ChangePwd
Professor --> ViewProfile
Professor --> UpdateProfile

Admin --> Login
Admin --> Logout
Admin --> ValidateRegister
Admin --> ManageStudent
Admin --> ManageProfessor
Admin --> ToggleAccount

' Includes
Register ..> ValidateFormat : <<include>>
Register ..> UploadPhoto : <<include>>
Register ..> SendEmail : <<include>>
Login ..> CheckCredentials : <<include>>
Login ..> CreateSession : <<include>>
ResetPwd ..> GenerateToken : <<include>>
ResetPwd ..> SendEmail : <<include>>
ValidateRegister ..> GenerateMatricule : <<include>>
ValidateRegister ..> CreateAccount : <<include>>
ValidateRegister ..> SendEmail : <<include>>

' Extends
Login ..> "Bloquer compte\n(tentatives échouées)" : <<extend>>
Register ..> "Vérifier email unique" : <<extend>>
UpdateProfile ..> UploadPhoto : <<extend>>

' Relations système
EmailSystem -- SendEmail

@enduml
```

### 2.2 Module Gestion Pédagogique

```plantuml
@startuml
!theme plain
skinparam actorStyle awesome

title Cas d'Utilisation Détaillés - Gestion Pédagogique

' Acteurs
actor "Étudiant" as Student
actor "Professeur" as Professor
actor "Administrateur" as Admin
actor "Système Notification" as NotifSystem

' Cas d'utilisation
rectangle "Gestion Devoirs/Examens" {
    usecase "Créer devoir/examen" as CreateAssignment
    usecase "Modifier devoir" as EditAssignment
    usecase "Supprimer devoir" as DeleteAssignment
    usecase "Activer/Désactiver devoir" as ToggleAssignment
    usecase "Définir date limite" as SetDeadline
    usecase "Joindre fichier sujet" as AttachFile
    usecase "Consulter liste devoirs" as ListAssignments
}

rectangle "Gestion Soumissions" {
    usecase "Soumettre devoir en ligne" as SubmitOnline
    usecase "Modifier soumission" as EditSubmission
    usecase "Télécharger fichier" as DownloadFile
    usecase "Consulter statut soumission" as ViewSubmissionStatus
    usecase "Vérifier date limite" as CheckDeadline
    usecase "Enregistrer soumission\nprésentielle" as SubmitInPerson
}

rectangle "Gestion Notes" {
    usecase "Noter soumission" as GradeSubmission
    usecase "Modifier note" as EditGrade
    usecase "Ajouter feedback" as AddFeedback
    usecase "Verrouiller notes" as LockGrades
    usecase "Consulter notes" as ViewGrades
    usecase "Calculer moyennes" as CalculateAverage
    usecase "Exporter notes (Excel)" as ExportGrades
    usecase "Générer bulletin" as GenerateBulletin
}

rectangle "Ressources Pédagogiques" {
    usecase "Déposer ressource" as UploadResource
    usecase "Modifier ressource" as EditResource
    usecase "Supprimer ressource" as DeleteResource
    usecase "Consulter ressources" as ViewResources
    usecase "Télécharger ressource" as DownloadResource
    usecase "Catégoriser ressource" as CategorizeResource
}

' Relations Professeur
Professor --> CreateAssignment
Professor --> EditAssignment
Professor --> DeleteAssignment
Professor --> ToggleAssignment
Professor --> ListAssignments
Professor --> GradeSubmission
Professor --> EditGrade
Professor --> AddFeedback
Professor --> LockGrades
Professor --> ViewGrades
Professor --> ExportGrades
Professor --> UploadResource
Professor --> EditResource
Professor --> DeleteResource
Professor --> ViewResources
Professor --> SubmitInPerson

' Relations Étudiant
Student --> ListAssignments
Student --> SubmitOnline
Student --> EditSubmission
Student --> ViewSubmissionStatus
Student --> ViewGrades
Student --> ViewResources
Student --> DownloadResource
Student --> DownloadFile

' Relations Admin
Admin --> ViewGrades
Admin --> GenerateBulletin

' Includes
CreateAssignment ..> SetDeadline : <<include>>
CreateAssignment ..> AttachFile : <<extend>>
SubmitOnline ..> CheckDeadline : <<include>>
SubmitOnline ..> AttachFile : <<include>>
GradeSubmission ..> AddFeedback : <<extend>>
ViewGrades ..> CalculateAverage : <<include>>
UploadResource ..> CategorizeResource : <<include>>

' Extends
CreateAssignment ..> NotifSystem : <<extend>>
SubmitOnline ..> NotifSystem : <<extend>>
GradeSubmission ..> NotifSystem : <<extend>>
EditGrade ..> "Vérifier verrouillage" : <<extend>>
SubmitOnline ..> "Marquer en retard" : <<extend>>

@enduml
```

### 2.3 Module Gestion Administrative et Financière

```plantuml
@startuml
!theme plain
skinparam actorStyle awesome

title Cas d'Utilisation Détaillés - Gestion Administrative & Financière

' Acteurs
actor "Étudiant" as Student
actor "Administrateur" as Admin
actor "Système PDF" as PDFSystem
actor "Système Email" as EmailSystem

' Cas d'utilisation
rectangle "Demandes Administratives" {
    usecase "Demander document" as RequestDoc
    usecase "Sélectionner type document" as SelectDocType
    usecase "Préciser motif" as SpecifyReason
    usecase "Consulter statut demande" as ViewRequestStatus
    usecase "Consulter historique\ndemandes" as ViewHistory
    
    usecase "Traiter demande" as ProcessRequest
    usecase "Valider/Rejeter demande" as ValidateRequest
    usecase "Générer document PDF" as GeneratePDF
    usecase "Ajouter QR code\nvérification" as AddQRCode
    usecase "Marquer document délivré" as MarkDelivered
    usecase "Consulter toutes demandes" as ViewAllRequests
}

rectangle "Gestion Documents" {
    usecase "Générer attestation\ninscription" as GenCertificate
    usecase "Générer relevé notes" as GenTranscript
    usecase "Générer diplôme" as GenDiploma
    usecase "Signer document" as SignDocument
    usecase "Archiver document" as ArchiveDocument
}

rectangle "Gestion Financière" {
    usecase "Définir frais scolarité" as SetTuitionFees
    usecase "Définir échéancier" as SetSchedule
    usecase "Enregistrer paiement" as RecordPayment
    usecase "Uploader preuve paiement" as UploadProof
    usecase "Valider paiement" as ValidatePayment
    usecase "Consulter situation\nfinancière" as ViewFinancial
    usecase "Calculer solde" as CalculateBalance
    usecase "Générer reçu" as GenerateReceipt
    usecase "Débloquer compte" as UnblockAccount
    usecase "Bloquer compte (impayés)" as BlockAccount
    usecase "Générer rappel paiement" as SendReminder
    usecase "Consulter historique\npaiements" as ViewPaymentHistory
}

rectangle "Notifications Financières" {
    usecase "Notifier échéance proche" as NotifyDeadline
    usecase "Notifier paiement reçu" as NotifyPayment
    usecase "Notifier compte bloqué" as NotifyBlock
}

' Relations Étudiant
Student --> RequestDoc
Student --> ViewRequestStatus
Student --> ViewHistory
Student --> ViewFinancial
Student --> UploadProof
Student --> ViewPaymentHistory

' Relations Administrateur
Admin --> ViewAllRequests
Admin --> ProcessRequest
Admin --> ValidateRequest
Admin --> GeneratePDF
Admin --> MarkDelivered
Admin --> SetTuitionFees
Admin --> SetSchedule
Admin --> RecordPayment
Admin --> ValidatePayment
Admin --> GenerateReceipt
Admin --> UnblockAccount
Admin --> BlockAccount
Admin --> SendReminder

' Includes
RequestDoc ..> SelectDocType : <<include>>
RequestDoc ..> SpecifyReason : <<include>>
ProcessRequest ..> ValidateRequest : <<include>>
GeneratePDF ..> AddQRCode : <<include>>
GeneratePDF ..> SignDocument : <<include>>
RecordPayment ..> CalculateBalance : <<include>>
RecordPayment ..> GenerateReceipt : <<include>>
ViewFinancial ..> CalculateBalance : <<include>>

' Extends
GeneratePDF ..> GenCertificate : <<extend>>
GeneratePDF ..> GenTranscript : <<extend>>
GeneratePDF ..> GenDiploma : <<extend>>
ProcessRequest ..> ArchiveDocument : <<extend>>
RecordPayment ..> UnblockAccount : <<extend>>
ValidatePayment ..> NotifyPayment : <<extend>>

' Relations automatiques
BlockAccount ..> NotifyBlock
SendReminder ..> NotifyDeadline

' Relations systèmes externes
PDFSystem -- GeneratePDF
PDFSystem -- AddQRCode
EmailSystem -- SendReminder
EmailSystem -- NotifyPayment

@enduml
```

---

## 3. PRIORISATION DES CAS D'UTILISATION

### 2.1 Critères de Priorisation

Les cas d'utilisation sont classés selon trois critères :
- **Priorité Métier** : Impact sur les fonctionnalités essentielles
- **Complexité Technique** : Difficulté d'implémentation
- **Dépendances** : Pré-requis par d'autres cas d'utilisation

### 2.2 Matrice de Priorisation

| Priorité | Cas d'Utilisation | Acteurs | Complexité | Justification |
|----------|-------------------|---------|------------|---------------|
| **P0 - CRITIQUE** | | | | **Fonctionnalités bloquantes** |
| P0.1 | UC1 - Se connecter | Tous | Moyenne | Base de toute interaction |
| P0.2 | UC2 - Se déconnecter | Tous | Faible | Sécurité essentielle |
| P0.3 | UC5 - S'inscrire en ligne | Étudiant | Moyenne | Point d'entrée système |
| P0.4 | UC6 - Valider inscription | Admin | Moyenne | Création des comptes |
| **P1 - HAUTE** | | | | **Cœur métier académique** |
| P1.1 | UC11 - Gérer promotions | Admin | Moyenne | Structure académique |
| P1.2 | UC12 - Gérer modules | Admin | Moyenne | Organisation enseignements |
| P1.3 | UC14 - Affecter étudiants | Admin | Moyenne | Lien étudiant-promotion |
| P1.4 | UC16 - Créer devoir/examen | Professeur | Moyenne | Activité pédagogique |
| P1.5 | UC17 - Soumettre devoir | Étudiant | Moyenne | Participation étudiante |
| P1.6 | UC18 - Noter soumission | Professeur | Moyenne | Évaluation |
| P1.7 | UC19 - Consulter notes | Étudiant/Prof | Faible | Suivi pédagogique |
| P1.8 | UC15 - Consulter emploi du temps | Tous | Faible | Organisation quotidienne |
| **P2 - MOYENNE** | | | | **Fonctionnalités importantes** |
| P2.1 | UC24 - Créer séance | Admin | Moyenne | Gestion planning |
| P2.2 | UC26 - Consulter planning | Tous | Faible | Visibilité planning |
| P2.3 | UC22 - Déposer ressources | Professeur | Moyenne | Matériel pédagogique |
| P2.4 | UC23 - Consulter ressources | Étudiant | Faible | Accès contenu |
| P2.5 | UC29 - Demander document | Étudiant | Faible | Service administratif |
| P2.6 | UC30 - Traiter demande | Admin | Moyenne | Gestion administrative |
| P2.7 | UC34 - Enregistrer paiement | Admin | Moyenne | Gestion financière |
| P2.8 | UC35 - Consulter situation financière | Étudiant | Faible | Transparence |
| P2.9 | UC38 - Envoyer notification individuelle | Admin | Faible | Communication |
| P2.10 | UC41 - Consulter notifications | Tous | Faible | Information |
| **P3 - BASSE** | | | | **Confort et optimisation** |
| P3.1 | UC3 - Réinitialiser mot de passe | Tous | Moyenne | Récupération compte |
| P3.2 | UC4 - Modifier mot de passe | Tous | Faible | Sécurité personnelle |
| P3.3 | UC9 - Consulter profil | Tous | Faible | Gestion compte |
| P3.4 | UC10 - Modifier informations | Tous | Faible | Mise à jour données |
| P3.5 | UC20 - Verrouiller notes | Professeur | Faible | Protection données |
| P3.6 | UC21 - Exporter notes | Professeur | Moyenne | Reporting |
| P3.7 | UC27 - Signaler absence professeur | Étudiant | Faible | Feedback |
| P3.8 | UC31 - Générer document PDF | Système | Haute | Automatisation |
| P3.9 | UC39 - Notification promotion | Admin | Faible | Communication ciblée |
| P3.10 | UC40 - Notification globale | Admin | Faible | Annonces générales |
| P3.11 | UC43 - Tableau de bord | Admin | Moyenne | Supervision |
| P3.12 | UC45 - Signaler bug | Tous | Faible | Qualité système |
| **P4 - AUTOMATISÉES** | | | | **Tâches planifiées** |
| P4.1 | UC47 - Mettre à jour promotions | Système | Moyenne | Automatisation |
| P4.2 | UC48 - Vérifier emplois du temps | Système | Faible | Maintenance |
| P4.3 | UC49 - Rappels automatiques | Système | Moyenne | Communication auto |
| P4.4 | UC50 - Nettoyer notifications | Système | Faible | Optimisation BDD |

### 2.3 Planning de Développement par Sprint

#### **Sprint 1 (2 semaines) - Fondations**
- UC1, UC2 : Authentification base
- UC5 : Inscription en ligne
- UC6 : Validation inscription
- Infrastructure : BDD, sessions, middleware

#### **Sprint 2 (2 semaines) - Structure Académique**
- UC11 : Gestion promotions
- UC12 : Gestion modules
- UC13 : Gestion UE
- UC14 : Affectation étudiants

#### **Sprint 3 (2 semaines) - Pédagogie Cœur**
- UC16 : Création devoirs/examens
- UC17 : Soumission devoirs
- UC18 : Notation
- UC19 : Consultation notes

#### **Sprint 4 (2 semaines) - Planning & Ressources**
- UC15 : Consultation emploi du temps
- UC24 : Création séances
- UC22 : Dépôt ressources
- UC23 : Consultation ressources

#### **Sprint 5 (2 semaines) - Administratif & Financier**
- UC29, UC30 : Demandes administratives
- UC31 : Génération PDF
- UC33, UC34, UC35 : Gestion financière

#### **Sprint 6 (1 semaine) - Communication**
- UC38, UC39, UC40 : Notifications
- UC41, UC42 : Gestion notifications

#### **Sprint 7 (1 semaine) - Reporting & Automatisation**
- UC43, UC44 : Tableaux de bord
- UC47-50 : Tâches CRON
- UC45, UC46 : Logs et bugs

#### **Sprint 8 (1 semaine) - Finitions**
- UC3, UC4 : Gestion mots de passe
- UC20, UC21 : Fonctionnalités avancées notes
- Tests et corrections

---

## 4. DIAGRAMMES DE SÉQUENCE SYSTÈME

### 4.1 UC1 - Se Connecter

```plantuml
@startuml
!theme plain
autonumber

actor Utilisateur as User
participant "Système" as System
database "Base de données" as DB

User -> System : Saisir matricule et mot de passe
System -> System : Valider format des données
alt Format invalide
    System -> User : Erreur format
else Format valide
    System -> DB : Vérifier matricule
    alt Matricule inexistant
        System -> User : Erreur identifiants
    else Matricule existe
        System -> DB : Récupérer données utilisateur
        System -> System : Vérifier mot de passe (Argon2)
        alt Mot de passe incorrect
            System -> DB : Incrémenter tentatives échouées
            alt Trop de tentatives
                System -> DB : Bloquer compte temporairement
                System -> User : Compte bloqué
            else
                System -> User : Erreur identifiants
            end
        else Mot de passe correct
            System -> DB : Réinitialiser tentatives
            System -> System : Créer session
            System -> DB : Enregistrer log connexion
            System -> User : Redirection tableau de bord
            System -> User : Token session
        end
    end
end

@enduml
```

### 4.2 UC5 - S'inscrire en Ligne

```plantuml
@startuml
!theme plain
autonumber

actor "Étudiant" as Student
participant "Système" as System
participant "Service Email" as Mail
database "Base de données" as DB

Student -> System : Accéder formulaire inscription
System -> Student : Afficher formulaire

Student -> System : Soumettre données inscription\n(nom, prénom, email, photo, etc.)
System -> System : Valider données
alt Données invalides
    System -> Student : Erreur validation
else Données valides
    System -> DB : Vérifier email unique
    alt Email déjà utilisé
        System -> Student : Erreur email existant
    else Email unique
        System -> System : Générer mot de passe temporaire
        System -> DB : Créer pendingStudent
        System -> DB : Sauvegarder photo (Cloudinary)
        System -> Mail : Envoyer email confirmation
        Mail -> Student : Email avec instructions
        System -> Student : Message succès + matricule provisoire
        System -> DB : Logger événement
    end
end

@enduml
```

### 4.3 UC6 - Valider Inscription

```plantuml
@startuml
!theme plain
autonumber

actor "Administrateur" as Admin
participant "Système" as System
participant "Service Email" as Mail
database "Base de données" as DB

Admin -> System : Se connecter
Admin -> System : Consulter inscriptions en attente
System -> DB : Récupérer pendingStudentss


System -> Admin : Afficher liste

Admin -> System : Sélectionner inscription
System -> Admin : Afficher détails complets

alt Refuser inscription
    Admin -> System : Refuser avec motif
    System -> DB : Supprimer pendingStudent
    System -> Mail : Envoyer email refus
    System -> Admin : Confirmation refus
else Valider inscription
    Admin -> System : Valider inscription
    System -> System : Générer matricule unique
    System -> System : Générer numéro inscription
    System -> DB : Créer User
    System -> DB : Créer Student
    System -> DB : Définir frais scolarité
    System -> DB : Supprimer pendingStudent
    System -> Mail : Envoyer email validation\n(matricule + mot de passe)
    System -> DB : Logger événement
    System -> Admin : Confirmation succès
    
end

@enduml
```

### 4.4 UC16 - Créer Devoir/Examen

```plantuml
@startuml
!theme plain
autonumber

actor "Professeur" as Prof
participant "Système" as System
participant "Service Notification" as Notif
database "Base de données" as DB

Prof -> System : Se connecter
Prof -> System : Accéder section devoirs
System -> DB : Récupérer modules du professeur
System -> Prof : Afficher modules

Prof -> System : Sélectionner module et promotion
Prof -> System : Remplir formulaire devoir\n(titre, description, type, date limite, fichier)
System -> System : Valider données
alt Données invalides
    System -> Prof : Erreur validation
else Données valides
    System -> DB : Sauvegarder fichier (upload)
    System -> DB : Créer Assignment
    System -> DB : Récupérer étudiants promotion
    System -> Notif : Créer notification pour étudiants
    System -> Notif : Envoyer via WebSocket
    System -> DB : Logger événement
    System -> Prof : Confirmation création
    System -> Prof : Afficher détails devoir
end

@enduml
```

### 4.5 UC17 - Soumettre Devoir

```plantuml
@startuml
!theme plain
autonumber

actor "Étudiant" as Student
participant "Système" as System
participant "Service Notification" as Notif
database "Base de données" as DB

Student -> System : Se connecter
Student -> System : Consulter devoirs à rendre
System -> DB : Récupérer assignments de la promotion
System -> DB : Vérifier soumissions existantes
System -> Student : Afficher liste devoirs

Student -> System : Sélectionner devoir
System -> Student : Afficher détails + formulaire

alt Devoir en présentiel
    System -> Student : Message "Soumission en personne"
else Devoir en ligne
    Student -> System : Uploader fichier
    System -> System : Valider fichier (taille, type)
    alt Fichier invalide
        System -> Student : Erreur fichier
    else Fichier valide
        System -> DB : Sauvegarder fichier
        alt Première soumission
            System -> DB : Créer Submission
        else Modification soumission
            System -> DB : Mettre à jour Submission
        end
        System -> DB : Définir statut (submitted/late)
        System -> Notif : Notifier professeur
        System -> DB : Logger événement
        System -> Student : Confirmation soumission
    end
end

@enduml
```

### 4.6 UC18 - Noter Soumission

```plantuml
@startuml
!theme plain
autonumber

actor "Professeur" as Prof
participant "Système" as System
participant "Service Notification" as Notif
database "Base de données" as DB

Prof -> System : Se connecter
Prof -> System : Accéder section notation
System -> DB : Récupérer assignments du professeur
System -> Prof : Afficher liste devoirs

Prof -> System : Sélectionner devoir et promotion
System -> DB : Récupérer submissions
System -> Prof : Afficher liste soumissions

Prof -> System : Sélectionner soumission
System -> Prof : Afficher détails + formulaire notation

Prof -> System : Saisir note et feedback
System -> System : Valider note (0-20)
alt Note invalide
    System -> Prof : Erreur validation
else Note valide
    System -> DB : Vérifier verrouillage notes
    alt Notes verrouillées
        System -> Prof : Erreur modification interdite
    else Notes non verrouillées
        System -> DB : Mettre à jour Submission (grade, status)
        System -> Notif : Notifier étudiant
        System -> DB : Logger événement
        System -> Prof : Confirmation notation
    end
end

@enduml
```

### 4.7 UC19 - Consulter Notes

```plantuml
@startuml
!theme plain
autonumber

actor "Étudiant" as Student
participant "Système" as System
database "Base de données" as DB

Student -> System : Se connecter
Student -> System : Accéder section notes
System -> DB : Récupérer promotion étudiant
System -> DB : Récupérer modules de la promotion
System -> Student : Afficher liste modules

Student -> System : Sélectionner module
System -> DB : Récupérer assignments du module
System -> DB : Récupérer submissions de l'étudiant
System -> System : Calculer statistiques\n(moyenne, min, max)
System -> Student : Afficher notes détaillées

alt Consulter toutes les notes
    Student -> System : Demander vue globale
    System -> DB : Récupérer toutes notes
    System -> System : Calculer moyennes par UE/module
    System -> System : Calculer moyenne générale
    System -> Student : Afficher bulletin complet
end

@enduml
```

### 4.8 UC24 - Créer Séance

```plantuml
@startuml
!theme plain
autonumber

actor "Administrateur" as Admin
participant "Système" as System
participant "Service Notification" as Notif
database "Base de données" as DB

Admin -> System : Se connecter
Admin -> System : Accéder gestion emploi du temps
System -> Admin : Afficher calendrier

Admin -> System : Sélectionner date et créer séance
System -> DB : Récupérer promotions et modules
System -> Admin : Afficher formulaire

Admin -> System : Remplir formulaire\n(module, promotion, prof, salle, heure, type)
System -> System : Valider données
alt Données invalides
    System -> Admin : Erreur validation
else Données valides
    System -> DB : Vérifier conflits\n(salle, professeur, promotion)
    alt Conflit détecté
        System -> Admin : Avertissement conflit
        Admin -> System : Confirmer ou modifier
    end
    System -> DB : Créer Schedule
    System -> Notif : Notifier promotion et professeur
    System -> DB : Logger événement
    System -> Admin : Confirmation création
end

@enduml
```

### 4.9 UC29 - Demander Document

```plantuml
@startuml
!theme plain
autonumber

actor "Étudiant" as Student
participant "Système" as System
participant "Service Notification" as Notif
database "Base de données" as DB

Student -> System : Se connecter
Student -> System : Accéder demandes administratives
System -> DB : Vérifier restrictions compte
alt Compte restreint
    System -> Student : Accès refusé
else Compte actif
    System -> Student : Afficher formulaire

    Student -> System : Sélectionner type document\n(attestation, relevé notes, diplôme)
    Student -> System : Préciser motif et détails
    System -> System : Valider données
    alt Données invalides
        System -> Student : Erreur validation
    else Données valides
        System -> DB : Créer AdministrativeRequest (statut: pending)
        System -> Notif : Notifier administration
        System -> DB : Logger événement
        System -> Student : Confirmation demande\n+ numéro suivi
    end
end

@enduml
```

### 4.10 UC30 - Traiter Demande Administrative

```plantuml
@startuml
!theme plain
autonumber

actor "Administrateur" as Admin
participant "Système" as System
participant "Service PDF" as PDF
participant "Service Notification" as Notif
database "Base de données" as DB

Admin -> System : Se connecter
Admin -> System : Consulter demandes en attente
System -> DB : Récupérer AdministrativeRequests (pending/in_progress)
System -> Admin : Afficher liste

Admin -> System : Sélectionner demande
System -> DB : Récupérer détails complets
System -> Admin : Afficher détails

alt Rejeter demande
    Admin -> System : Rejeter avec motif
    System -> DB : Mettre à jour statut (cancelled)
    System -> Notif : Notifier étudiant
    System -> Admin : Confirmation rejet
else Traiter demande
    Admin -> System : Passer en traitement
    System -> DB : Mettre à jour statut (in_progress)
    
    Admin -> System : Générer document
    System -> DB : Récupérer données étudiant/notes
    System -> PDF : Générer PDF avec QR code
    PDF -> System : Fichier PDF
    System -> DB : Sauvegarder document
    System -> DB : Mettre à jour statut (ready)
    System -> Notif : Notifier étudiant
    System -> DB : Logger événement
    System -> Admin : Confirmation génération
    
    opt Document récupéré
        Admin -> System : Marquer comme délivré
        System -> DB : Mettre à jour statut (delivered)
        System -> Admin : Confirmation
    end
end

@enduml
```

### 4.11 UC34 - Enregistrer Paiement

```plantuml
@startuml
!theme plain
autonumber

actor "Administrateur" as Admin
participant "Système" as System
participant "Service Notification" as Notif
database "Base de données" as DB

Admin -> System : Se connecter
Admin -> System : Accéder gestion paiements
System -> DB : Récupérer étudiants et soldes
System -> Admin : Afficher liste

Admin -> System : Sélectionner étudiant
System -> DB : Récupérer situation financière
System -> Admin : Afficher détails paiements

Admin -> System : Enregistrer nouveau paiement\n(montant, méthode, date, preuve)
System -> System : Valider données
alt Données invalides
    System -> Admin : Erreur validation
else Données valides
    System -> DB : Sauvegarder preuve paiement
    System -> DB : Créer Payment
    System -> DB : Mettre à jour TuitionFees (solde)
    System -> DB : Calculer nouveau solde
    alt Solde payé intégralement
        System -> DB : Débloquer compte étudiant
        System -> Notif : Notification félicitations
    else Reste à payer
        System -> Notif : Notification confirmation
    end
    System -> DB : Logger événement
    System -> Admin : Confirmation enregistrement
    System -> Admin : Afficher reçu
end

@enduml
```


### 4.12 Gérer UE et Module

```plantuml
@startuml
!theme plain
autonumber

actor "Administrateur" as Admin
participant "Système" as System
database "Base de données" as DB

Admin -> System : Se connecter
Admin -> System : Accéder gestion UE/Modules
System -> Admin : Afficher interface gestion
Admin -> System : Créer/modifier/supprimer UE ou Module
System -> System : Valider données
alt Données invalides
    System -> Admin : Afficher erreur
else Données valides
    System -> DB : Enregistrer modification
    System -> DB : Logger événement
    System -> Admin : Confirmer opération
end

@enduml
```

### 4.13 Gérer Utilisateur

```plantuml
@startuml
!theme plain
autonumber

actor "Administrateur" as Admin
participant "Système" as System
database "Base de données" as DB

Admin -> System : Se connecter
Admin -> System : Accéder gestion utilisateurs
System -> Admin : Afficher liste utilisateurs
Admin -> System : Créer/modifier/supprimer utilisateur
System -> System : Valider données
alt Données invalides
    System -> Admin : Afficher erreur
else Données valides
    System -> DB : Appliquer modification
    System -> DB : Logger événement
    System -> Admin : Confirmer opération
end

@enduml
```

### 4.14 Gérer Traçabilité des Actions

```plantuml
@startuml
!theme plain
autonumber

actor "Utilisateur" as User
participant "Système" as System
database "Base de données" as DB

User -> System : Effectuer action (ex: modification)
System -> DB : Appliquer modification
System -> DB : Enregistrer événement dans journal d'audit
System -> User : Confirmer action

@enduml
```

### 4.15 Déposer et Gérer Ressources Pédagogiques

```plantuml
@startuml
!theme plain
autonumber

actor "Professeur" as Prof
participant "Système" as System
database "Base de données" as DB
participant "Stockage Fichiers" as Storage

Prof -> System : Se connecter
Prof -> System : Accéder gestion ressources
System -> Prof : Afficher interface dépôt
Prof -> System : Déposer/éditer/supprimer ressource
System -> System : Valider données
alt Données invalides
    System -> Prof : Afficher erreur
else Données valides
    System -> Storage : Enregistrer/mettre à jour/supprimer fichier
    System -> DB : Mettre à jour référence ressource
    System -> DB : Logger événement
    System -> Prof : Confirmer opération
end

@enduml
```

### 4.15 UC49 - Envoi Rappels Automatiques (CRON)

```plantuml
@startuml
!theme plain
autonumber

participant "CRON" as Cron
participant "Système" as System
participant "Service Email" as Mail
participant "Service Notification" as Notif
database "Base de données" as DB

Cron -> System : Déclenchement tâche quotidienne
System -> DB : Récupérer date actuelle

' Rappels paiements
System -> DB : Récupérer étudiants avec solde impayé
loop Pour chaque étudiant en retard
    System -> DB : Vérifier date échéance
    alt Échéance dépassée
        System -> Mail : Envoyer rappel paiement
        System -> Notif : Créer notification
        System -> DB : Logger rappel
    end
end

' Rappels devoirs
System -> DB : Récupérer assignments avec deadline proche (J-2)
loop Pour chaque devoir
    System -> DB : Récupérer étudiants n'ayant pas soumis
    System -> Notif : Envoyer notification rappel
    System -> DB : Logger rappel
end

' Rappels séances à venir
System -> DB : Récupérer séances du lendemain
loop Pour chaque séance
    System -> DB : Récupérer étudiants et professeur
    System -> Notif : Envoyer notification rappel
    System -> DB : Logger rappel
end

System -> Cron : Fin exécution

@enduml
```

---

## 5. SPÉCIFICATIONS COMPLÉMENTAIRES

### 5.1 Acteurs et Responsabilités

| Acteur | Description | Permissions Principales |
|--------|-------------|------------------------|
| **Étudiant** | Utilisateur en formation | Consulter (emploi du temps, notes, ressources), Soumettre (devoirs), Demander (documents) |
| **Professeur** | Enseignant de l'établissement | Créer (devoirs, ressources), Noter (soumissions), Consulter (emploi du temps, notes) |
| **Administrateur** | Personnel administratif | Gérer (utilisateurs, promotions, modules), Valider (inscriptions, paiements), Créer (emploi du temps, notifications) |
| **Super Admin** | Administrateur système | ✅ **TOUTES les permissions d'Admin** + UC47 (Mise à jour promotions), UC50 (Nettoyage notifications) |

**Notes :** 
- SuperAdmin hérite de tous les droits d'Administrateur (relation `--|>` en UML)
- SuperAdmin a accès additionnellement à UC47 et UC50 pour la gestion des tâches automatisées
- Les cas d'utilisation UC47-UC50 sont des processus automatisés (stéréotype `<<automated>>`) déclenchés par des événements temporels (planificateur de tâches), et non par un acteur externe

### 5.2 Règles de Gestion Principales

#### RG1 - Authentification
- Le matricule est unique par utilisateur
- Le mot de passe doit contenir minimum 8 caractères
- Après 5 tentatives échouées, le compte est bloqué 30 minutes
- Les sessions expirent après 7 jours d'inactivité

#### RG2 - Inscription
- L'email doit être unique dans le système
- La photo d'identité est obligatoire
- L'inscription n'est active qu'après validation admin
- Un matricule définitif est généré à la validation (format: ISAYYYY-NNNN)

#### RG3 - Académique
- Un étudiant ne peut être affecté qu'à une seule promotion active
- Un module appartient à une seule unité d'enseignement
- Une promotion contient plusieurs modules
- Un professeur peut enseigner plusieurs modules

#### RG4 - Notation
- Les notes sont comprises entre 0 et 20
- Une fois verrouillées, les notes ne peuvent plus être modifiées
- Un étudiant ne peut avoir qu'une soumission par devoir
- Les soumissions après la deadline sont marquées "late"

#### RG5 - Financier
- Les frais de scolarité sont définis par promotion et année
- Un paiement partiel est autorisé
- Le solde doit être >= 0 (pas de crédit)
- Les comptes avec impayés > 30 jours sont restreints

#### RG6 - Notifications
- Les notifications critiques déclenchent un email
- Les notifications expirent après 30 jours
- Les notifications peuvent être individuelles, par promotion ou globales

### 5.3 Contraintes Techniques

- **Sécurité** : Toutes les API nécessitent une authentification sauf login/inscription
- **Performance** : Les requêtes doivent répondre en < 2 secondes
- **Disponibilité** : Le système doit être disponible 99% du temps
- **Scalabilité** : Support de 500 utilisateurs simultanés minimum
- **Données** : Sauvegarde quotidienne de la base de données
- **Logs** : Conservation des logs pendant 1 an minimum

### 5.4 Traçabilité (Event Logs)

Tous les événements suivants sont tracés :
- Connexions/déconnexions
- Création/modification/suppression d'entités
- Soumissions de devoirs
- Modifications de notes
- Paiements
- Génération de documents
- Changements de statut

Format log : `{ userId, entityType, entityId, action, timestamp, metadata }`

---

## 6. GLOSSAIRE

| Terme | Définition |
|-------|------------|
| **Assignment** | Devoir, projet ou examen créé par un professeur |
| **Submission** | Soumission d'un devoir par un étudiant |
| **Promotion** | Niveau d'études (L1, L2, L3, M1, M2) dans une filière |
| **Module** | Matière enseignée (ex: Analyse 1, Algorithmique) |
| **UE** | Unité d'Enseignement regroupant plusieurs modules |
| **Schedule** | Séance de cours dans l'emploi du temps |
| **TuitionFees** | Frais de scolarité d'un étudiant pour une année |
| **Payment** | Paiement effectué par un étudiant |
| **Matricule** | Identifiant unique de l'utilisateur (format: ISAYYYY-NNNN) |
| **Pending Student** | Étudiant en attente de validation d'inscription |
| **Session** | Session d'examen (normal ou rattrapage) |
| **EventLog** | Trace d'un événement système |
| **Restriction** | Blocage d'un compte étudiant (généralement pour impayés) |

---

_Document rédigé dans le cadre de l'analyse des besoins – ISA Ambato_  
_Date : Janvier 2026_
