# SPÉCIFICATIONS DES BESOINS TECHNIQUES
## Plateforme de Gestion Académique et Administrative – ISA

---

## 1. ARCHITECTURE TECHNIQUE

### 1.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                      COUCHE PRÉSENTATION                     │
│                    (Frontend React/Next.js)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                     COUCHE APPLICATION                       │
│              ┌────────────────────────────────┐             │
│              │   API REST (Express.js)        │             │
│              │   - Routes                     │             │
│              │   - Controllers                │             │
│              │   - Middleware                 │             │
│              └────────────────────────────────┘             │
│              ┌────────────────────────────────┐             │
│              │   Services Métier              │             │
│              │   - Queries                    │             │
│              │   - Business Logic             │             │
│              │   - Validations                │             │
│              └────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      COUCHE DONNÉES                          │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│    │   MongoDB    │  │ File System  │  │   Sessions   │   │
│    │   (Primary)  │  │   (Private)  │  │  (Connect-   │   │
│    │              │  │              │  │   Mongo)     │   │
│    └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES EXTERNES                         │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│    │   Nodemailer │  │   Sharp      │  │   Puppeteer  │   │
│    │   (Email)    │  │  (Images)    │  │    (PDF)     │   │
│    └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Modèle Architecture

**Type :** Architecture en couches (Layered Architecture)

**Justification :**
- Séparation claire des responsabilités
- Facilité de maintenance et d'évolution
- Testabilité accrue
- Réutilisabilité des composants

---

## 2. STACK TECHNOLOGIQUE

### 2.1 Backend

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Runtime** | Node.js | ≥ 18.x | Performance, écosystème riche, JavaScript full-stack |
| **Framework Web** | Express.js | 4.x | Léger, flexible, middleware robuste |
| **Langage** | JavaScript (ES6+) | - | Syntaxe moderne, async/await natif |
| **Base de données** | MongoDB | 6.x | NoSQL, flexibilité schéma, performance requêtes complexes |
| **ODM** | Mongoose | 8.x | Schémas, validations, middleware, relations |

### 2.2 Sécurité & Authentification

| Composant | Technologie | Utilisation |
|-----------|-------------|-------------|
| **Hash mot de passe** | Argon2 | Chiffrement sécurisé des mots de passe |
| **Sessions** | express-session + connect-mongo | Gestion sessions côté serveur, persistence MongoDB |
| **Chiffrement données** | Crypto (Node.js) | Chiffrement CIN, tokens sécurisés |
| **Rate Limiting** | express-rate-limit | Protection contre attaques par force brute |
| **Validation** | express-validator | Validation et sanitization des entrées |

### 2.3 Gestion Fichiers & Médias

| Composant | Technologie | Utilisation |
|-----------|-------------|-------------|
| **Upload fichiers** | Multer | Gestion upload multipart/form-data |
| **Traitement images** | Sharp | Compression, redimensionnement, conversion WebP |
| **Génération PDF** | Puppeteer + EJS | Génération documents officiels (attestations, relevés) |
| **Stockage** | File System (private/) | Stockage local sécurisé des fichiers |

### 2.4 Communication & Notifications

| Composant | Technologie | Utilisation |
|-----------|-------------|-------------|
| **Email** | Nodemailer | Envoi emails transactionnels |
| **Templates Email** | EJS | Templates dynamiques pour emails |
| **WebSocket** | Socket.io | Notifications temps réel |

### 2.5 Utilitaires & Outils

| Composant | Technologie | Utilisation |
|-----------|-------------|-------------|
| **Export Excel** | XLSX | Export données notes, inscriptions |
| **Date/Time** | Luxon | Manipulation dates, fuseaux horaires |
| **Validation** | Joi / express-validator | Validation schémas complexes |
| **Logging** | Morgan | Logs HTTP requests |

---

## 3. EXIGENCES FONCTIONNELLES TECHNIQUES

### 3.1 Authentification & Autorisation

#### BT-AUTH-001 : Système d'authentification
- **Description :** Authentification par matricule/mot de passe
- **Implémentation :**
  - Hash Argon2id pour les mots de passe
  - Sessions persistantes (cookie: ISA_auth)
  - Durée session : 7 jours
- **Contraintes :**
  - Blocage après 5 tentatives échouées (30 min)
  - Rate limiting : 10 tentatives / 15 min par IP
  - Logout destroy session + clear cookie

#### BT-AUTH-002 : Gestion des rôles
- **Rôles supportés :** student, professor, admin, superAdmin
- **Middleware :** `isConnectedMiddleware`, `isAdminAndSuperAdmin`, `isProfessorMiddleware`, `isStudentMiddleware`
- **Stockage :** Session côté serveur (req.session.role)

#### BT-AUTH-003 : Réinitialisation mot de passe
- **Token :** Crypto.randomBytes(32) + hash SHA-256
- **Expiration :** 24 heures
- **Cooldown :** 15 jours entre deux changements
- **Envoi :** Email avec lien sécurisé

### 3.2 Gestion des Fichiers

#### BT-FILE-001 : Upload fichiers
- **Taille maximale :** 5 Mo par fichier
- **Types autorisés :**
  - Images : PNG, JPEG, JPG, WebP
  - Documents : PDF
- **Validation :** MIME type + extension
- **Stockage :** `/private/{type}/{id}/`

#### BT-FILE-002 : Traitement images
- **Compression :** WebP qualité 85%
- **Redimensionnement :** Max width 600px pour photos identité
- **Pipeline :** Upload temp → Compression → Déplacement définitif
- **Nettoyage :** Suppression fichiers temporaires après traitement

#### BT-FILE-003 : Génération PDF
- **Outil :** Puppeteer (headless Chrome)
- **Templates :** EJS pour rendering HTML
- **Fonctionnalités :**
  - QR code vérification
  - Signature électronique
  - Styles personnalisés (Times New Roman)
- **Types documents :**
  - Attestations inscription
  - Relevés de notes
  - Certificats de scolarité

### 3.3 Base de Données

#### BT-DB-001 : Schéma MongoDB
- **Collections principales :** 21 collections
  - users, students, professors, admins
  - pendingStudents
  - promotions, modules, teachingUnits
  - assignments, submissions
  - schedules
  - tuitionFees, payments, feesManagement
  - notifications, eventLogs
  - administrativeRequests

#### BT-DB-002 : Transactions ACID
- **Utilisation :** Opérations critiques multi-collections
- **Implémentation :** `mongoose.startSession()` + `transaction()`
- **Cas d'usage :**
  - Inscription étudiant (User + Student + TuitionFees)
  - Validation pré-inscription (PendingStudent → Student)
  - Création promotion avec rapport

#### BT-DB-003 : Indexation
- **Index uniques :**
  - users.matricule
  - users.email
  - pendingStudents.email
  - tuitionFees.transactionRef
- **Index composés :**
  - schedules : (date, startTime, endTime)
  - submissions : (student, assignment)
- **Index texte :** Recherche nom/prénom étudiants

#### BT-DB-004 : Agrégation
- **Pipeline complexes :**
  - Statistiques notes par module
  - Comptage étudiants par filière
  - Calcul moyennes pondérées
  - Rapports financiers

### 3.4 APIs REST

#### BT-API-001 : Structure endpoints
```
/api/auth/login              POST   - Connexion
/api/auth/logout             POST   - Déconnexion
/api/auth/forgot-password    POST   - Reset password

/api/pending-users/          POST   - Pré-inscription
/api/pending-users/:id       GET    - Détails candidat (admin)
/api/pending-users/:id       PATCH  - Valider (admin)
/api/pending-users/:id       DELETE - Rejeter (admin)

/api/promotions/             GET    - Liste promotions
/api/promotions/             POST   - Créer promotion
/api/promotions/:id          PATCH  - Modifier promotion
/api/promotions/:id          DELETE - Supprimer promotion

/api/modules/admin/UE/:ueId  GET    - Modules par UE
/api/modules/admin/UE/:ueId  POST   - Créer module

/api/assignments/            POST   - Créer devoir
/api/submissions/online/:id  POST   - Soumettre devoir
/api/submissions/:id         PATCH  - Noter soumission

/api/schedule/               POST   - Créer séance
/api/schedule/by-range       GET    - Emploi du temps

/api/tuition-fees/user/:id   GET    - Frais étudiant
/api/tuition-fees/:id        PATCH  - Valider paiement

/api/notifications/          GET    - Notifications utilisateur
```

#### BT-API-002 : Format réponses
```json
// Succès
{
  "data": {...},
  "message": "Operation successful"
}

// Erreur
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

#### BT-API-003 : Codes HTTP
- **200** : Succès
- **201** : Ressource créée
- **204** : Suppression réussie
- **400** : Erreur validation
- **401** : Non authentifié
- **403** : Non autorisé
- **404** : Ressource introuvable
- **409** : Conflit (doublon)
- **500** : Erreur serveur

### 3.5 Notifications Temps Réel

#### BT-NOTIF-001 : WebSocket
- **Protocole :** Socket.io
- **Événements :**
  - `new_notification` : Nouvelle notification
  - `notification_read` : Notification lue
- **Namespaces :** Par rôle utilisateur

#### BT-NOTIF-002 : Notifications email
- **Service :** Nodemailer (SMTP)
- **Types :**
  - Transactionnels : Inscription, validation, paiement
  - Rappels : Échéances, devoirs
- **Templates :** EJS avec styles inline

---

## 4. EXIGENCES NON-FONCTIONNELLES

### 4.1 Performance

#### BT-PERF-001 : Temps de réponse
| Opération | Temps cible | Temps max acceptable |
|-----------|-------------|----------------------|
| Login | < 500 ms | 1 s |
| Liste données (pagination) | < 800 ms | 2 s |
| Upload fichier (3 Mo) | < 3 s | 5 s |
| Génération PDF | < 4 s | 8 s |
| Requêtes simples | < 300 ms | 1 s |
| Agrégations complexes | < 1.5 s | 3 s |

#### BT-PERF-002 : Optimisations MongoDB
- **Lean queries** : `.lean()` pour lecture seule (+30% performance)
- **Projection** : Sélection champs nécessaires uniquement
- **Pagination** : Skip + Limit sur toutes les listes
- **Agrégation** : Pipeline optimisé avec `$match` en premier

#### BT-PERF-003 : Caching
- **Sessions :** Cache Redis/MongoDB
- **Images :** Compression préalable
- **Données statiques :** Cache en mémoire (promotions actives)

### 4.2 Sécurité

#### BT-SEC-001 : Protection données sensibles
- **CIN :** Chiffrement AES-256-CBC
- **Mots de passe :** Argon2id (salt automatique)
- **Tokens :** SHA-256 hash
- **Sessions :** Cookie httpOnly, secure en production

#### BT-SEC-002 : Protection contre attaques
- **Injection NoSQL :** Validation stricte + express-validator
- **XSS :** Sanitization entrées
- **CSRF :** Non applicable (API stateless pour certaines routes)
- **Rate limiting :**
  - Login : 10 req / 15 min
  - Inscription : 5 req / 15 min
  - APIs générales : Configuration par route

#### BT-SEC-003 : Validation entrées
- **Côté serveur :** Obligatoire sur toutes les routes
- **Règles :**
  - Email : Format RFC 5322
  - Matricule : Format ISA[ANNÉE]-[NNNN]
  - Fichiers : Type MIME + extension + taille
  - Dates : ISO 8601 ou formats acceptés

#### BT-SEC-004 : Gestion erreurs
- **Production :** Messages génériques (pas de stack trace)
- **Logs :** Détails complets côté serveur
- **Codes HTTP :** Appropriés au contexte

### 4.3 Disponibilité & Fiabilité

#### BT-AVAIL-001 : Disponibilité cible
- **Uptime :** 99% (≈ 7h downtime/mois)
- **Plage maintenance :** Dimanche 2h-6h (hors pics)

#### BT-AVAIL-002 : Gestion erreurs
- **Try-catch :** Systématique sur routes async
- **Rollback :** Transactions MongoDB
- **Logs :** Toutes erreurs 500 dans eventLogs

#### BT-AVAIL-003 : Backup
- **Fréquence :** Quotidien (3h du matin)
- **Rétention :** 30 jours
- **Scope :** Base de données + fichiers privés
- **Test restore :** Mensuel

### 4.4 Scalabilité

#### BT-SCALE-001 : Capacité utilisateurs
- **Utilisateurs simultanés :** 500 minimum
- **Pics prévus :** Inscriptions, consultations notes
- **Stratégie :** Horizontal scaling (load balancer)

#### BT-SCALE-002 : Volumétrie données
| Entité | Volume annuel estimé | Taille unitaire | Total |
|--------|---------------------|-----------------|-------|
| Étudiants | 500 | 5 Ko + 5 Mo fichiers | 2.5 Go |
| Devoirs | 1000 | 2 Ko | 2 Mo |
| Soumissions | 20000 | 5 Mo | 100 Go |
| Logs | 500000 | 500 bytes | 250 Mo |

#### BT-SCALE-003 : Optimisation stockage
- **Compression images :** WebP -40% taille
- **Nettoyage automatique :** Fichiers temp, notifications expirées
- **Archivage :** Données > 2 ans (externe)

### 4.5 Maintenabilité

#### BT-MAINT-001 : Structure code
```
backend-isa/
├── routes/          # Définition endpoints
├── controllers/     # Logique métier spécifique
├── queries/         # Accès données (couche DAO)
├── models/          # Schémas Mongoose
├── middleware/      # Middlewares réutilisables
├── function/        # Utilitaires métier
├── mail/            # Services email
├── private/         # Stockage fichiers
└── utils/           # Helpers génériques
```

#### BT-MAINT-002 : Conventions code
- **Naming :** camelCase (fonctions), PascalCase (models)
- **Async :** async/await (pas de callbacks)
- **Erreurs :** try-catch systématique
- **Comments :** JSDoc pour fonctions publiques

#### BT-MAINT-003 : Logging
- **Niveaux :** error, warn, info, debug
- **Format :** JSON structuré
- **Destination :** Console + fichiers + eventLogs collection
- **Contenu :**
  ```json
  {
    "timestamp": "2026-02-02T10:30:00Z",
    "level": "error",
    "userId": "ISA2025-0001",
    "action": "login",
    "message": "Failed login attempt",
    "metadata": {...}
  }
  ```

### 4.6 Compatibilité

#### BT-COMPAT-001 : Navigateurs
- **Desktop :**
  - Chrome ≥ 90
  - Firefox ≥ 88
  - Safari ≥ 14
  - Edge ≥ 90
- **Mobile :**
  - iOS Safari ≥ 14
  - Chrome Android ≥ 90

#### BT-COMPAT-002 : API versioning
- **Stratégie :** URI versioning (future : /api/v2/)
- **Rétrocompatibilité :** Maintien v1 pendant 6 mois après v2

---

## 5. GESTION DES DONNÉES

### 5.1 Modèle de Données

#### BT-DATA-001 : Schémas principaux

**User**
```javascript
{
  matricule: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum (required),
  name: String,
  firstName: String,
  configs: {
    lastPasswordChange: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  }
}
```

**Student**
```javascript
{
  user: ObjectId (ref: User),
  promotion: ObjectId (ref: Promotion),
  inscriptionId: String (unique),
  field: Enum (informatique, gestion, btp),
  level: Enum (L1, L2, L3, M1, M2),
  isRestricted: Boolean,
  academicYear: String
}
```

**Assignment**
```javascript
{
  title: String (required),
  description: String,
  type: Enum (homework, project, exam),
  module: ObjectId (ref: Module),
  promotion: ObjectId (ref: Promotion),
  professor: ObjectId (ref: Professor),
  dueDate: Date,
  submissionLocation: Enum (online, in-person),
  isActive: Boolean,
  lockedGrade: Boolean,
  session: Enum (normal, rattrapage)
}
```

**Submission**
```javascript
{
  student: ObjectId (ref: Student),
  assignment: ObjectId (ref: Assignment),
  submittedAt: Date,
  status: Enum (submitted, late, graded),
  grade: Number (0-20),
  feedback: String,
  fileUrl: String
}
```

### 5.2 Relations

```
User (1) ←→ (1) Student/Professor/Admin
Student (N) → (1) Promotion
Promotion (N) → (N) Module
Module (N) → (1) TeachingUnit
Module (N) → (1) Professor
Assignment (N) → (1) Module
Assignment (N) → (1) Promotion
Submission (N) → (1) Student
Submission (N) → (1) Assignment
Schedule (N) → (N) Promotion
Schedule (N) → (1) Module
Schedule (N) → (1) Professor
TuitionFees (1) → (1) Student
Payment (N) → (1) TuitionFees
```

### 5.3 Intégrité Référentielle

#### BT-DATA-002 : Contraintes
- **Cascade delete :** Désactivé (soft delete préféré)
- **Validation :** Mongoose + custom validators
- **Références :** populate() pour jointures
- **Orphelins :** Tâche CRON nettoyage mensuel

### 5.4 Migration & Évolution

#### BT-DATA-003 : Stratégie migration
- **Outil :** Scripts Node.js personnalisés
- **Versioning :** Collection `migrations` avec état
- **Rollback :** Script inverse pour chaque migration
- **Timing :** Hors heures ouvrées

---

## 6. SERVICES EXTERNES & INTÉGRATIONS

### 6.1 Service Email

#### BT-EXT-001 : Configuration SMTP
- **Provider :** À configurer (Gmail, SendGrid, MailGun)
- **Protocole :** SMTP / SMTP TLS
- **Port :** 587 (TLS) ou 465 (SSL)
- **Authentification :** Compte service dédié

#### BT-EXT-002 : Templates
- **Format :** HTML + Text fallback
- **Variables dynamiques :** EJS templates
- **Pièces jointes :** Support documents générés

### 6.2 Stockage Fichiers

#### BT-EXT-003 : File System local
- **Chemin :** `/private/` (hors racine publique)
- **Structure :**
  ```
  private/
  ├── inscription/{field}/{inscriptionId}/
  ├── user/{matricule}/info/
  ├── user/{matricule}/payments/
  └── module-materials/{moduleCode}/
  ```
- **Permissions :** Lecture serveur uniquement

#### BT-EXT-004 : Alternative Cloud (future)
- **Options :** AWS S3, Cloudinary, Azure Blob
- **Avantages :** Scalabilité, CDN, backup automatique
- **Migration :** Script batch upload existant

### 6.3 Génération Documents

#### BT-EXT-005 : Puppeteer
- **Mode :** Headless Chrome
- **Format sortie :** PDF/A (archivage)
- **Options :**
  - Format : A4
  - Marges : 2cm
  - Qualité : 300 DPI
- **Performance :** Pool instances réutilisables

---

## 7. CONTRAINTES TECHNIQUES

### 7.1 Environnement Serveur

#### BT-ENV-001 : Prérequis
- **OS :** Linux Ubuntu 20.04+ / Windows Server 2019+
- **Node.js :** v18.x ou v20.x LTS
- **MongoDB :** v6.x ou v7.x
- **RAM :** 4 Go minimum, 8 Go recommandé
- **CPU :** 2 cores minimum, 4 cores recommandé
- **Disque :** 100 Go minimum (SSD recommandé)

#### BT-ENV-002 : Variables environnement
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/isa_db
SESSION_SECRET=<secret>
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=<email>
MAIL_PASS=<password>
ENCRYPTION_KEY=<key>
```

### 7.2 Déploiement

#### BT-DEPLOY-001 : Processus
1. **Build :** Aucun (JavaScript natif)
2. **Install :** `npm ci --production`
3. **Migrations :** Scripts pre-start
4. **Start :** PM2 ou systemd
5. **Health check :** Endpoint `/health`

#### BT-DEPLOY-002 : Process Manager
- **Outil :** PM2
- **Instances :** Cluster mode (CPU cores)
- **Restart :** Auto on crash
- **Logs :** Rotation automatique

### 7.3 Monitoring

#### BT-MONITOR-001 : Métriques
- **Serveur :** CPU, RAM, Disque
- **Application :** Request/s, Response time, Error rate
- **Database :** Connexions, Query time, Lock time
- **Alertes :**
  - CPU > 80% pendant 5 min
  - RAM > 90%
  - Erreurs 500 > 10/min
  - Response time > 5s

#### BT-MONITOR-002 : Outils recommandés
- **APM :** New Relic, DataDog
- **Logs :** ELK Stack, Loki
- **Uptime :** UptimeRobot, Pingdom

---

## 8. TESTS & QUALITÉ

### 8.1 Stratégie de Tests

#### BT-TEST-001 : Types de tests
| Type | Couverture cible | Outils |
|------|------------------|--------|
| **Unitaires** | 70% | Jest, Mocha |
| **Intégration** | 50% | Supertest, Jest |
| **End-to-End** | Scénarios critiques | Postman, Newman |
| **Performance** | Load testing | Artillery, K6 |
| **Sécurité** | Scan automatique | OWASP ZAP, Snyk |

#### BT-TEST-002 : Tests prioritaires
1. Authentification (login, logout, reset)
2. Inscription (pré-inscription, validation)
3. Création ressources (devoir, séance, promotion)
4. Transactions financières
5. Upload/Download fichiers

### 8.2 Qualité Code

#### BT-QUAL-001 : Linting
- **Outil :** ESLint
- **Config :** Airbnb style guide
- **Pre-commit :** Husky + lint-staged

#### BT-QUAL-002 : Sécurité dépendances
- **Scan :** npm audit hebdomadaire
- **Update :** Automatique (patch), Manuel (minor/major)
- **Alerts :** GitHub Dependabot

---

## 9. DOCUMENTATION TECHNIQUE

### 9.1 Documentation API

#### BT-DOC-001 : Format
- **Outil :** Swagger/OpenAPI 3.0
- **Contenu :**
  - Endpoints
  - Paramètres
  - Body schemas
  - Réponses possibles
  - Exemples requêtes
- **Accès :** `/api-docs` (dev uniquement)

### 9.2 Documentation Code

#### BT-DOC-002 : Inline documentation
- **Format :** JSDoc
- **Couverture :** Fonctions publiques, modèles, utilitaires
- **Génération :** Automatique (JSDoc tool)

### 9.3 Documentation Déploiement

#### BT-DOC-003 : Guides
- Installation & Configuration
- Scripts migrations
- Procédures backup/restore
- Troubleshooting guide
- Runbook opérationnel

---

## 10. ÉVOLUTIONS FUTURES

### 10.1 Roadmap Technique

#### BT-FUTURE-001 : Court terme (6 mois)
- Migration vers TypeScript
- API GraphQL (alternative REST)
- Cache Redis
- WebSocket notifications avancées

#### BT-FUTURE-002 : Moyen terme (12 mois)
- Microservices (authentification, paiements)
- Message Queue (RabbitMQ/Kafka)
- Storage Cloud (S3)
- CI/CD complet (GitHub Actions)

#### BT-FUTURE-003 : Long terme (18+ mois)
- Architecture event-driven
- Elasticsearch (recherche avancée)
- Analytics embarqué
- Mobile app (React Native)

---

## 11. ANNEXES

### 11.1 Glossaire Technique

| Terme | Définition |
|-------|------------|
| **ODM** | Object Document Mapper - Couche abstraction MongoDB |
| **Rate Limiting** | Limitation nombre de requêtes par unité de temps |
| **Lean Query** | Requête MongoDB retournant objets plain JavaScript (non Mongoose) |
| **Aggregation Pipeline** | Suite transformations données MongoDB |
| **Session** | Données utilisateur stockées côté serveur |
| **Middleware** | Fonction intermédiaire traitement requête |
| **Populate** | Jointure références MongoDB (remplacement ObjectId) |

### 11.2 Références

- **MongoDB Documentation :** https://docs.mongodb.com/
- **Express.js Guide :** https://expressjs.com/
- **Node.js Best Practices :** https://github.com/goldbergyoni/nodebestpractices
- **OWASP Security :** https://owasp.org/www-project-top-ten/

---

_Document rédigé dans le cadre des spécifications techniques – ISA Ambato_  
_Version 1.0 – Février 2026_
