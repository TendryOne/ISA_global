# RÈGLES DE GESTION
## Plateforme de Gestion Académique et Administrative – ISA

**Document** : Spécifications des règles métier  
**Date** : Janvier 2026  
**Version** : 1.0

---

## SOMMAIRE

1. [Authentification & Sécurité](#1-authentification--sécurité)
2. [Gestion des Utilisateurs](#2-gestion-des-utilisateurs)
3. [Gestion Académique](#3-gestion-académique)
4. [Gestion Pédagogique](#4-gestion-pédagogique)
5. [Gestion Administrative](#5-gestion-administrative)
6. [Gestion Financière](#6-gestion-financière)
7. [Communications & Notifications](#7-communications--notifications)
8. [Tâches Automatisées](#8-tâches-automatisées)
9. [Audit & Conformité](#9-audit--conformité)

---

## 1. AUTHENTIFICATION & SÉCURITÉ

### RG-AUTH-01 : Connexion utilisateur
- **Condition** : Utilisateur non authentifié accède à l'application
- **Règle** : 
  - La connexion se fait par `matricule` + `mot de passe`
  - Le mot de passe doit être hashé en Argon2 (non stocké en clair)
  - L'authentification génère une session/token valide 7 jours
  - Token déclaré invalide après 7 jours d'inactivité
- **Exception** : Compte bloqué → redirection vers "déblocage"

### RG-AUTH-02 : Limitations des tentatives échouées
- **Condition** : Utilisateur échoue une connexion
- **Règle** :
  - Compteur de tentatives échouées incrémenté
  - Après 5 tentatives échouées consécutives → compte bloqué 30 minutes
  - Premier déblocage après 30 min automatique
  - Admin peut débloquer manuellement avant 30 min
  - Email de notification envoyé au compte lors du blocage
- **Données tracées** : matricule, heure essai, IP source, motif (credential invalid|account blocked)

### RG-AUTH-03 : Réinitialisation de mot de passe
- **Condition** : Utilisateur a oublié mot de passe ou premier accès
- **Règle** :
  - Email de réinitialisation envoyé contenant lien sécurisé (token unique)
  - Token expire après 3 heures
  - Token à usage unique (invalidé après utilisation)
  - Nouveau mot de passe doit respecter critères : ≥ 8 caractères, majuscule, minuscule, chiffre, caractère spécial
  - Historique des 5 derniers mots de passe conservé (impossible de réutiliser)
  - Événement d'audit généré
- **Notification** : Email de confirmation du changement

### RG-AUTH-04 : Mot de passe temporaire (Première connexion)
- **Condition** : Utilisateur créé par Admin ou inscription validée
- **Règle** :
  - `configs.defaultPassword = true` jusqu'à premier changement
  - Au premier login, utilisateur doit changer mot de passe
  - Impossible d'accéder aux fonctionnalités tant que mot de passe par défaut
- **Flag** : `configs.lastPasswordChange` = null jusqu'au changement

### RG-AUTH-05 : Expiration de session
- **Condition** : Session utilisateur active
- **Règle** :
  - Session valide 7 jours calendaires
  - Session déconnectée après 7 jours d'inactivité (aucune requête API)
  - Reconnecter force nouvelle authentification
  - Logs de déconnexion tracés
- **Événement** : EventLog { action: "logout", status: "success" }

### RG-AUTH-06 : Double authentification (Optional - Future)
- **Condition** : Admin active MFA pour un utilisateur/rôle
- **Règle** :
  - 2e facteur = SMS OTP 6 chiffres ou authenticator app
  - OTP valide 5 minutes
  - Maximum 3 tentatives OTP échouées → bloquer 15 min

---

## 2. GESTION DES UTILISATEURS

### RG-USER-01 : Unicité des identifiants
- **Règle** :
  - `matricule` : unique dans la base (format : ISAYYYY-NNNN ou auto-généré)
  - `email` : unique (convertir en minuscules avant insertion)
  - `phone` : unique (international format)
  - `cin` (Student uniquement) : unique et nullable (peut être absent)
- **Impact** : Contrainte UNIQUE au niveau BDD + validation applicative

### RG-USER-02 : Format matricule étudiant
- **Condition** : Étudiant nouvellement validé/créé
- **Règle** :
  - Format : `ISA[ANNÉE]-[SÉQUENCE]` (ex: ISA2025-0001)
  - `[ANNÉE]` = année académique d'inscription
  - `[SÉQUENCE]` = compteur auto-incrémenté (4 chiffres, zéro-complété)
  - Séquence indépendante par année + filière (optionnel : ISA2025-INF-0001)
- **Gestion** : Table `Counter` ou `CounterMatricule` dédiée
- **Concurrence** : Accès atomique (session/transaction) pour éviter doublons

### RG-USER-03 : Numéro d'inscription (Pending Student)
- **Condition** : Candidat en processus d'inscription
- **Règle** :
  - Format : `INS[DATE]-[SÉQUENCE]` (ex: INS20250128-0042)
  - `[DATE]` = date de candidature (YYYYMMDD)
  - `[SÉQUENCE]` = compteur du jour (4 chiffres)
  - Assigné à création de `PendingStudent`
  - Conservé après validation → `Student.inscriptionId`
- **Gestion** : Counter dédié

### RG-USER-04 : Modification de profil autorisée
- **Condition** : Utilisateur modifie son profil
- **Règle** :
  - Champs modifiables (self) : email, phone, address, firstName, name, gender, emergencyContact* (Student)
  - Champs non modifiables : matricule, role, verified, isRestricted, cin (immutable)
  - Admin peut modifier tous les champs d'un autre utilisateur sauf matricule/role
  - SuperAdmin peut modifier matricule/role (trace obligatoire)
- **Validation** :
  - Email unique après changement
  - Phone format international
- **Audit** : EventLog { entityType: "user", action: "update", oldValues, newValues }

### RG-USER-05 : Suppression d'utilisateur (Soft Delete)
- **Condition** : Admin supprime un utilisateur (rare)
- **Règle** :
  - Suppression logique (soft delete) : ajouter champ `deletedAt: DateTime` (non visible par défaut)
  - Données conservées (audit/conformité)
  - Compte inaccessible après suppression (masqué des listes)
  - Impossible de créer nouvel utilisateur avec même email/phone après suppression (24h bloqué minimum)
- **Audit** : EventLog { action: "delete", entityType: "user" }
- **Exception** : Suppression physique seulement après accord légal (RGPD)

### RG-USER-06 : Rôles et permissions
- **Condition** : Utilisateur connecté effectue une action
- **Règle** :
  - 4 rôles : student, professor, admin, superadmin
  - Permissions hiérarchiques : student < professor < admin < superadmin
  - SuperAdmin hérite TOUTES permissions Admin + UC47, UC50
  - Rôle déterminé par champ `role` (discriminateur)
  - Chaque route/action requiert vérification de rôle/permission
- **Implémentation** : Middleware `AdminVerification`, decorators `@RequireRole()`

### RG-USER-07 : Restriction d'accès (Compte bloqué)
- **Condition** : Étudiant a impayés > 30 jours OU compte administrativement restreint
- **Règle** :
  - Flag `Student.isRestricted = true`
  - Utilisateur peut se connecter MAIS :
    - Pas d'accès aux notes
    - Pas de soumission de devoirs
    - Pas de demande de documents
    - Notification permanente "Compte restreint – Régularisez vos paiements"
  - Admin peut réactiver manuellement ou automatique après paiement
- **Workflow** : FeesManagement.status = "overdue" → isRestricted = true

---

## 3. GESTION ACADÉMIQUE

### RG-ACAD-01 : Filières et niveaux
- **Condition** : Création ou modification promotion/module
- **Règle** :
  - Filières autorisées : informatique, gestion, btp
  - Niveaux autorisés : L1, L2, L3, M1, M2
  - Chaque promotion = filière + niveau unique par année académique
  - Code promotion auto-généré : `[FILIERE]-[LEVEL]-[ANNÉE]` (ex: INF-L2-2025)
- **Validation** : Enum au niveau model + controller

### RG-ACAD-02 : Promotion unique par année
- **Condition** : Admin crée nouvelle promotion
- **Règle** :
  - Une seule promotion active par (filière, niveau, académicYear)
  - Promotions précédentes archivées (`status = "archived"`)
  - Code promotion : unique globalement
  - Capacité par défaut : 40 étudiants (configurable)
- **Validation** : Index unique (field, level, academicYear, status='active')

### RG-ACAD-03 : Affectation étudiant à promotion
- **Condition** : Inscription d'étudiant validée
- **Règle** :
  - Étudiant affecter à 1 seule promotion active à la fois
  - Nouvel entrée `Parcours { promotion, status='in progress', enrollmentDate=now }`
  - Champ `Student.level` = promotion.level
  - Impossible de changer promotion active (archive ancienne, créer parcours historique)
- **Validation** : Constraint unique (student, promotion) où status != 'completed'

### RG-ACAD-04 : Unités d'enseignement et modules
- **Condition** : Création module par Admin
- **Règle** :
  - UE regroupe 2-6 modules par semestre
  - Code UE : `[FILIERE]-[LEVEL]-[SEMESTRE]-UE[N]` (ex: INF-L2-S3-UE1)
  - Code Module : `[FILIERE]-[LEVEL]-[SEMESTRE]-[CODE]` (ex: INF-L2-S3-ANA1)
  - Crédits ECTS : UE entre 6-30, Module entre 1-10
  - Coefficient : 1-4 (poids pour moyenne)
  - Professeur responsable : 1 seul par module
- **Répartition temps** : cmHours + tdHours + tpHours = totalHours

### RG-ACAD-05 : Semestres académiques
- **Condition** : Organisation pédagogique
- **Règle** :
  - 10 semestres possibles (S1-S10) : L1(S1,S2), L2(S3,S4), L3(S5,S6), M1(S7,S8), M2(S9,S10)
  - Semestres consécutifs (S1 puis S2)
  - Modules attribués à 1 semestre uniquement
  - Validé par semestre (moyenne ≥ 10/20)

### RG-ACAD-06 : Professeurs et modules
- **Condition** : Affectation professeur à module
- **Règle** :
  - 1 professeur responsable par module (peut enseigner plusieurs modules)
  - Professeur ne peut noter/valider que ses propres devoirs
  - Impossible de supprimer professeur si modules actifs assignés
- **Cascade** : Si professeur supprimé → réassigner responsable

---

## 4. GESTION PÉDAGOGIQUE

### RG-PED-01 : Création de devoir/examen
- **Condition** : Professeur crée un assignment
- **Règle** :
  - Champs obligatoires : titre, description, dueDate, type, module, promotion
  - Type : homework (devoir), project (projet), exam (examen)
  - Session : normal ou rattrapage
  - Due date ≥ date actuelle + 24h (minimum 1 jour)
  - Fichier énoncé : optionnel (PDF, .doc, .txt)
  - Professeur = créateur (User.matricule enregistré)
  - Assignment.isActive = true (défaut)
  - MaxScore par défaut : 20
- **Audit** : EventLog { action: "create", entityType: "assignment" }

### RG-PED-02 : Modification/Suppression d'assignment
- **Condition** : Professeur modifie assignment non soumis
- **Règle** :
  - Assignement peut être modifié si aucune soumission reçue
  - Une fois ≥ 1 soumission → modification de titre/description seulement
  - DueDate modifiable seulement s'aucune soumission OR tous étudiants avertis (notification)
  - Suppression logique seulement si 0 soumission (archiver, pas delete physique)
  - Suppression physique après 90 jours d'archivage
- **Audit** : EventLog pour chaque modification

### RG-PED-03 : Soumission de devoir
- **Condition** : Étudiant soumet un devoir
- **Règle** :
  - 1 seule soumission par étudiant/devoir (modification possible avant deadline)
  - Fichier : obligatoire, max 50MB, formats acceptés (.pdf, .doc, .docx, .zip)
  - Horodatage : `submittedAt = now()`
  - Statut initial : "submitted"
  - Si submittedAt > dueDate → `isLate = true`, statut = "late"
  - Soumission en ligne (online) seulement ou en personne (in-person) → pas de fichier, admin enregistre
- **Validation** :
  - Unique (student, assignment)
  - Étudiant doit être affecté à la promotion cible
- **Notification** : Professeur notifié de soumission

### RG-PED-04 : Notation et feedback
- **Condition** : Professeur note une soumission
- **Règle** :
  - Note : decimal 0 à 20 (1 décimale : 0.0 à 20.0)
  - Feedback : optionnel, max 1000 caractères
  - Professeur peut modifier note/feedback tant que `Assignment.lockedGrade = false`
  - Une fois `lockedGrade = true` → notes immuables
  - Statut soumission : "submitted" → "graded"
  - EventLog : { action: "grade", entityType: "submission", oldValues: {grade, feedback}, newValues }
- **Calcul moyenne** : Automatique après notation (voir RG-PED-06)

### RG-PED-05 : Verrouillage des notes
- **Condition** : Professeur finalise les notes
- **Règle** :
  - Professeur seulement peut verrouiller : `Assignment.lockedGrade = true`
  - Une fois verrouillé → impossible de modifier/supprimer notes
  - SuperAdmin peut déverrouiller (trace obligatoire)
  - Email de confirmation envoyé aux étudiants après verrouillage
  - Notification visible sur dashboard étudiant
- **Impact** : Pas de modification possible sans déverrouillage

### RG-PED-06 : Calcul des moyennes
- **Condition** : Module complété ou consultation notes
- **Règle** :
  - Moyenne module = Σ(note × coefficient assignment) / Σ(coefficient)
  - Moyenne UE = Σ(moyenne module × coefficient module) / Σ(coefficient module)
  - Moyenne générale = Σ(moyenne UE × crédit UE) / Σ(crédit UE)
  - Valeur minimale : 0.0, maximale : 20.0
  - Calcul per semester (S1/S2 independant)
  - Arrondi à 2 décimales
- **Recalcul** : Automatique à chaque nouvelle notation

### RG-PED-07 : Validation semestre
- **Condition** : Fin de semestre
- **Règle** :
  - Semestre validé si moyenne générale ≥ 10/20
  - Étudiant progress vers semestre suivant
  - Moyenne < 10 → statut parcours = "repeated" (redoublement possible)
  - Admin/Professeur valide manuellement dans interface
- **Automatisation** : CRON UC48/UC49 peut proposer validation

### RG-PED-08 : Ressources pédagogiques
- **Condition** : Professeur partage ressource
- **Règle** :
  - Type : video, document, external_link
  - Module + Promotion destinataire obligatoires
  - Lien accessible seulement à étudiants de promotion cible
  - Compteur téléchargement incrémenté par accès
  - Suppression logique (archive) possible, pas suppression physique immédiate
  - Visibilité : `isVisible = true` (professeur peut masquer)
- **Accès** : Authentification requise, contrôle d'accès par promotion

### RG-PED-09 : Authentification des notes (Token QR)
- **Condition** : Étudiant génère relevé de notes certifié
- **Règle** :
  - Token unique généré par promotion/étudiant : `GradesAuthentication.uniqueToken`
  - Token inclus dans QR code du relevé PDF
  - Tiers peut scanner QR → vérifier authenticité relevé (endpoint public)
  - Token valide indéfiniment (pas d'expiration)
  - Impossible de régénérer (1 token par étudiant/promotion)
- **Endpoint** : `/api/public/verify-grades/:token` retourne données relévé

---

## 5. GESTION ADMINISTRATIVE

### RG-ADMIN-01 : Emploi du temps (Séances)
- **Condition** : Admin crée séance
- **Règle** :
  - Champs obligatoires : title, date, startTime, endTime, promotions[]
  - Date future ≥ date actuelle (séances rétroactives interdites sauf Admin/SuperAdmin)
  - Durée = endTime - startTime (minutes), doit être > 0
  - CourseType : cm, td, tp, exam, other
  - Type : presentiel, distanciel, hybride
  - Si distanciel/hybride → googleMeetLink obligatoire (format URL valide)
  - Room (salle) optionnelle
  - Professeur optionnel (séance sans prof possible)
  - Status initial : "pending"
- **Validation** :
  - startTime < endTime (HH:MM format)
  - Pas de chevauchement même salle/prof (optionnel)

### RG-ADMIN-02 : Statut séance
- **Condition** : Durée de vie d'une séance
- **Règle** :
  - Statut initial : "pending"
  - Transition possible : pending → done → (aucun changement)
  - Transition possible : pending → missed (via réclamation étudiant OU CRON)
  - À minuit après endTime : CRON UC48 change pending → done (si aucune réclamation)
  - Étudiant peut réclamation "cours manqué" → Admin examine → status = "missed"
  - Admin peut forcer status manuellement (trace obligatoire)
- **Audit** : Chaque changement de status tracé

### RG-ADMIN-03 : Réclamation séance manquée
- **Condition** : Étudiant signale cours manqué
- **Règle** :
  - Étudiant ajoute matricule à `Schedule.studentReclamations[]`
  - Réclamation possible si date passée (vérif endTime < now)
  - Admin examine réclamation → approve ou reject
  - Si approve → Schedule.status = "missed"
  - Si reject → réclamation supprimée
  - Limite : 1 réclamation par séance par étudiant
- **Notification** : Admin notifié nouvelle réclamation

### RG-ADMIN-04 : Demande document administratif
- **Condition** : Étudiant demande relevé, attestation, diplôme
- **Règle** :
  - Type : transcript (relevé notes), enrollment_certificate (attestation inscription), diploma (diplôme)
  - Étudiant doit être vérifié et non restreint
  - Status initial : "pending"
  - Statut workflow : pending → in-progress → recoverable → delivered OU cancelled
  - Admin seul peut modifier status
  - `recoveryDate` optionnel (date de récupération prévue)
  - Motif/remarques : optionnel (raison demande)
  - Impossible 2 demandes identiques en attente (unique constraint)
- **Validation** : student.verified = true AND student.isRestricted = false

### RG-ADMIN-05 : Génération document PDF
- **Condition** : Admin marque demande prête
- **Règle** :
  - Document généré automatiquement depuis template
  - Type template selon requestType (transcript, certificate, diploma)
  - Données : infos étudiant, notes (si transcript), logo école, signatures
  - QR code généré : encode `GradesAuthentication.uniqueToken` (si applicable)
  - PDF signé numériquement (certificat école)
  - URL stockée : `AdministrativeRequest.documentUrl`
  - Fichier nommé : `[MATRICULE]_[REQUESTTYPE]_[DATETIME].pdf`
  - Stockage : serveur local (/secure/documents) ou Cloudinary
- **Accès** : Seul étudiant concerné + admin + superadmin

### RG-ADMIN-06 : Notification récupération document
- **Condition** : Document prêt
- **Règle** :
  - Status = "recoverable" → notification envoyée étudiant
  - Email + SMS (si numéro fourni) + in-app notification
  - Lien sécurisé pour télécharger (token valide 30 jours)
  - Email relance après 7 jours si non récupéré
  - Auto-archive après 90 jours sans récupération (status = "cancelled")
- **Notification template** : "Votre document [TYPE] est prêt – [lien téléchargement]"

---

## 6. GESTION FINANCIÈRE

### RG-FIN-01 : Politique de frais scolarité
- **Condition** : Admin définit frais pour promotion
- **Règle** :
  - `TuitionFees` créé par Admin pour promotion + année académique
  - Montant total : décimal > 0
  - Devise : XAF (par défaut, extensible)
  - Nombre d'échéances : 1-4 (généralement 3)
  - PaymentSchedule[] : tableau d'échéances avec date + montant
  - Σ(échéance) = totalAmount
  - Description : optionnel (ex: "Frais 2024-2025 L2 Informatique")
- **Validation** : totalAmount > 0, dates croissantes, somme cohérente

### RG-FIN-02 : Modèle de paiement
- **Condition** : Étudiant effectue paiement
- **Règle** :
  - Paiement partiel autorisé (aucun minimum)
  - Méthodes acceptées : cash, bank_transfer, cheque, card, momo
  - Preuve obligatoire (fichier reçu, ticket, capture écran)
  - Statut initial : "pending" (en attente validation)
  - Admin valide → "validated" ET balance réactualisé
  - Admin rejette (preuve invalide) → "rejected" + notification étudiant
  - solde = totalFees - Σ(montant paiements validés)
- **Calcul** : FeesManagement.balance automatiquement recalculé

### RG-FIN-03 : Déblocage compte après paiement
- **Condition** : Étudiant restreint paie
- **Règle** :
  - Si `FeesManagement.balance = 0` (paiement complet) :
    - `Student.isRestricted = false` (auto-débloqué)
    - FeesManagement.status = "completed"
    - Notification "Compte débloqué – accès rétabli"
  - Si `balance > 0` mais `balance < 100` (ex: petite dette) :
    - Account non restreint (seuil configurable)
    - FeesManagement.status = "current"
- **Seuil de restriction** : configurable via Settings (défaut: 0 – restrictif)

### RG-FIN-04 : Rappels paiement automatiques
- **Condition** : Tâche CRON UC49 activée
- **Règle** :
  - Quotidien, 6h du matin
  - Identifie étudiants avec balance > 0 ET dueDate ≤ J+2
  - Envoie notification/email/SMS rappel
  - Contenu : montant dû, date limite, moyens paiement
  - Maximum 1 rappel par jour par étudiant
  - Après dueDate + 30j : status = "overdue" → restriction auto
- **Notification** : "Rappel: [MONTANT] dû avant [DATE] – Payez en ligne"

### RG-FIN-05 : Retard de paiement
- **Condition** : dueDate passée et balance > 0
- **Règle** :
  - daysOverdue = now - dueDate (en jours)
  - À J+7 en retard : notification escalade + frais pénalité? (configurable)
  - À J+30 en retard : Account restreint (Student.isRestricted = true)
  - FeesManagement.status = "overdue"
  - Blocage accès notes, soumissions, demandes doc
- **Calcul** : CRON quotidien, FeesManagement.status recalculé

### RG-FIN-06 : Exonération/Bourse
- **Condition** : Admin accorde exonération
- **Règle** :
  - Admin peut réduire `TuitionFees.totalAmount` pour promotion entière
  - OU réduire `FeesManagement.totalFees` pour étudiant individuel
  - Motif enregistré : "bourse", "difficulté financière", etc.
  - Note attachée à `FeesManagement.notes`
  - Audit : EventLog { action: "update", entityType: "feesManagement" }
- **Workflow** : Admin crée nouveau TuitionFees avec montant réduit

### RG-FIN-07 : Historique paiements
- **Condition** : Étudiant consulte historique
- **Règle** :
  - Liste tous Payment validés pour étudiant
  - Affiche : date, montant, méthode, statut, n° transaction
  - Seulement Payment.status = "validated" visible
  - Admin peut voir tous payments (validés + pending + rejected)
- **Accès** : Étudiant voit sien, Admin voit tous, Prof aucun accès

---

## 7. COMMUNICATIONS & NOTIFICATIONS

### RG-NOTIF-01 : Types de notifications
- **Condition** : Système envoie notification
- **Règle** :
  - Type récipient : individual (1 user), promotion (promotion entière), global (tous)
  - Canaux : in-app (BDD), email, SMS
  - Priorité : low, normal, high, critical
  - Catégorie : info, warning, success, error, alert
  - Message max 2000 caractères
  - Title max 200 caractères
- **Défaut** : Canal in-app (toujours), email si high/critical

### RG-NOTIF-02 : Notification individuelle
- **Condition** : Admin envoie message ciblé
- **Règle** :
  - RecipientType = "individual"
  - RecipientId = User.id (obligatoire)
  - Étudiant = Student, Professeur = Professor, etc.
  - Notification enregistrée dans `Notification` + `NotificationSeen`
  - Défaut lu : isRead = false
  - Étudiant marque lu via UC42 → NotificationSeen.isRead = true, readAt = now()
- **Badge** : Compteur notifications non lues visible

### RG-NOTIF-03 : Notification promotion
- **Condition** : Admin envoie message à promotion
- **Règle** :
  - RecipientType = "promotion"
  - PromotionId = Promotion.id
  - Créer 1 Notification + N NotificationSeen (1 per étudiant de promotion)
  - Chaque étudiant reçoit copie (NotificationSeen.user = etudiant)
  - Suppression notification supprime aussi NotificationSeen associées
- **Performance** : Batch insert pour N étudiants

### RG-NOTIF-04 : Notification globale
- **Condition** : Admin envoie annonce système
- **Règle** :
  - RecipientType = "global"
  - RecipientId = null
  - Créer 1 Notification → visible pour TOUS users
  - NotificationSeen créée pour chaque user (at creation time)
  - Cas utilisateur connecté après création : retrouve notification
- **Exemple** : "Maintenance serveur 22h-23h – Accès indisponible"

### RG-NOTIF-05 : Expiration notification
- **Condition** : Notification en attente de suppression
- **Règle** :
  - ExpiresAt défaut : created + 30 jours
  - CRON quotidien : supprime Notification + NotificationSeen où expiresAt < now
  - Admin peut raccourcir/allonger expiresAt
  - NotificationSeen reste visible jusqu'à expiration de Notification mère
- **Archive** : Optionnel : archiver plutôt que supprimer

### RG-NOTIF-06 : Notifications système automatiques
- **Condition** : Événements clés
- **Règle** :
  - Inscription validée → "Bienvenue, votre compte activé"
  - Devoir créé → notification promotion "Nouveau devoir [TITRE]"
  - Soumission reçue → prof "Soumission reçue: [ETUDIANT]"
  - Notes publiées → étudiant "Notes disponibles pour [MODULE]"
  - Paiement reçu → étudiant "Paiement validé – [MONTANT]"
  - Demande document → admin "Nouvelle demande [TYPE]"
  - Cours manqué signalé → prof "Réclamation: [SEANCE]"
- **Template** : Système + custom par Admin

---

## 8. TÂCHES AUTOMATISÉES

### RG-AUTO-01 : UC47 - Mise à jour promotions (Annuelle)
- **Condition** : Fin année académique (1er juillet)
- **Règle** :
  - Exécution automatique CRON 1er juillet 00:00
  - Pour chaque étudiant avec `parcours.status = "in progress"` :
    - Si moyenne validée (≥ 10/20) :
      - Promotion actuelle → status = "completed"
      - Créer Parcours.status = "in progress" pour niveau suivant
      - Notification "Passage réussi – Bienvenue en [NIVEAU]"
    - Si moyenne < 10/20 :
      - Status = "repeated" (redoublement)
      - Rester même promotion l'année suivante
      - Notification "Redoublement – Nouveau parcours l'année prochaine"
  - M2 complété → Status = "completed", parcours terminé, diplôme possible
- **Log** : EventLog per étudiant { action: "promotion_update", entityType: "student" }

### RG-AUTO-02 : UC48 - Vérification emplois du temps
- **Condition** : Toutes les heures
- **Règle** :
  - Schedule avec status = "pending" ET endTime < now :
    - Aucune `studentReclamation` → status = "done" (cours effectué)
    - Minimum 1 reclamation → reste "pending" (admin examinera)
    - Plus de 30% promotion a réclamé → force status = "missed"
  - Notification admin si nombre reclamations > seuil (ex: > 5)
- **Transaction** : Mise à jour atomique pour éviter conditions race

### RG-AUTO-03 : UC49 - Rappels automatiques
- **Condition** : Quotidien 6h du matin
- **Règle** :
  - Rappels paiement (dueDate J+2)
  - Rappels devoir (dueDate J+1)
  - Rappels séance (date demain)
  - Query : `FeesManagement.nextDueDate = tomorrow` → envoyer rappel paiement
  - Query : `Assignment.dueDate = tomorrow` → notifier promotion
  - Query : `Schedule.date = tomorrow` → notifier promotion + prof
- **Anti-spam** : Max 1 email par jour par user/catégorie

### RG-AUTO-04 : UC50 - Nettoyage notifications
- **Condition** : Hebdomadaire (dimanche minuit)
- **Règle** :
  - Supprimer Notification + NotificationSeen où expiresAt < now
  - Archive optionnelle avant suppression (si audit req)
  - Compacter indexes MongoDB post-suppression
  - Supprimer EventLog anciens (> 1 an) OU archiver
  - Nettoyer temp files (/temp, /upload) non référencés (age > 90j)
  - Optimiser storage : consolidate indexes
- **Notification** : SuperAdmin reçoit résumé cleanup (stats supprimées)

### RG-AUTO-05 : Tâches planifiables (CronTask)
- **Condition** : SuperAdmin configure tâche personnalisée
- **Règle** :
  - Champ `schedule` : expression CRON (0 6 * * * = 6h quotidien)
  - LastRun, NextRun gérés automatiquement
  - IsActive flag pour pause sans suppression
  - Log d'exécution : success/failure + duration
  - Retry automatique si échec (3 tentatives)
- **Limitation** : Max 10 CronTasks simultanées (configurable)

---

## 9. AUDIT & CONFORMITÉ

### RG-AUDIT-01 : Traçabilité des actions
- **Condition** : Utilisateur effectue action importante
- **Règle** :
  - Actions tracées : create, update, delete, validate, authenticate, export, download
  - EventLog créé automatiquement pour :
    - Création/modif/suppression user/student/grade/payment
    - Validation inscription/paiement/demande
    - Changement status (restriction, promotion, etc.)
    - Exports/téléchargements sensibles (notes, documents)
  - Contenu : { userId, userName, entityType, entityId, action, oldValues, newValues, ip, userAgent, timestamp }
- **Rétention** : 1 an minimum, 7 ans si demande légale

### RG-AUDIT-02 : Historique de connexion
- **Condition** : Utilisateur se connecte
- **Règle** :
  - LoginLog créé : { userId, matricule, status (success|failed|blocked), loginAt, logoutAt, duration, ip, userAgent }
  - Success : session créée, token généré
  - Failed : raison (invalid credentials|account blocked|account deleted)
  - Blocked : compte temporairement verrouillé
  - LogoutAt enregistré lors déconnexion
- **Rétention** : 6 mois

### RG-AUDIT-03 : Conformité RGPD
- **Condition** : Demande d'accès/suppression data
- **Règle** :
  - Droit d'accès : utilisateur demande copy de ses data
  - Droit oubli : utilisateur demande suppression (soft-delete)
  - Délai : réponse dans 30 jours
  - Processus : User → Admin → Validation → Exécution → Notification
  - Extraction : JSON export des collections (user, student, submissions, payments, etc.)
  - Anonymisation : Remplacer email/phone/address par "ANONYME" si suppression
- **Documentation** : Log de demande + réponse archivée

### RG-AUDIT-04 : Sécurité données sensibles
- **Condition** : Données personnelles/financières accessibles
- **Règle** :
  - Mot de passe : hashé Argon2 (jamais en clair)
  - CIN, photo identité : accès Admin seulement
  - Notes : accès Student/Prof/Admin selon permissions
  - Paiements : accès Student (own), Admin, SuperAdmin
  - Encrypt : données très sensibles en transit (HTTPS/TLS)
  - Chiffrement au repos : optionnel pour CIN, données bancaires (future)
- **Backdoor** : SuperAdmin audit trail obligatoire si accès data autre user

### RG-AUDIT-05 : Intégrité données
- **Condition** : Système en fonctionnement
- **Règle** :
  - Indexes MongoDB pour garantir contraintes UNIQUE
  - Transactions multi-documents pour opérations complexes
  - Soft-delete pour préserver références (FK intégrité)
  - Backup quotidien BDD (rétention 30 jours)
  - Checksums/hashes pour fichiers critiques (PDF diplômes)
  - Versioning : changelogs de modifications schéma
- **Récupération** : RTO 4h, RPO 1h (SLA)

### RG-AUDIT-06 : Rapport d'incidents
- **Condition** : Utilisateur signale bug/problème
- **Règle** :
  - BugReport : { title, description, reporter, type (bug|feature|improvement), priority, status }
  - Priority automatiquement : CRITICAL si "crash système", HIGH si "données perdues"
  - Admin/SuperAdmin notifiés nouvelle critical
  - Resolution : fixer bug → status = "resolved" → notifier reporter
  - Fermeture : status = "closed" après vérification
  - Historique conservé pour post-mortem
- **SLA** : Critical = 24h, High = 3 jours, Medium = 1 semaine

---

## RÉSUMÉ - MATRICE DE TRAÇABILITÉ

| Domaine | Nombre RG | Enjeu |
|---------|-----------|-------|
| Authentification & Sécurité | 6 | Accès sécurisé, prévention brute-force |
| Gestion Utilisateurs | 7 | Unicité, permissions, cycle de vie |
| Gestion Académique | 6 | Structure promotion/module/parcours |
| Gestion Pédagogique | 9 | Assignements, soumissions, notation, moyenne |
| Gestion Administrative | 6 | Emploi du temps, demandes docs |
| Gestion Financière | 7 | Frais, paiements, rappels, restrictions |
| Communications | 6 | Notifications multi-canal, cycle de vie |
| Tâches Automatisées | 5 | CRON UC47-UC50, planification |
| Audit & Conformité | 6 | Traçabilité, RGPD, intégrité |
| **TOTAL** | **58** | **Gouvernance complète** |

---

_Document établi selon standards métier et meilleures pratiques  
Dernière mise à jour : Janvier 2026_
