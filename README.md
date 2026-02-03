# 🚀 ISA Ambato - Déploiement Conteneurisé

Configuration Docker complète avec déploiement automatisé sans interruption.

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  isa-ambato.mg                          │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   
isa-ambato.mg    edu.isa-ambato.mg   api.isa-ambato.mg
  (Vitrine)        (Application)          (API)
  Nuxt.js          Vue.js              Node.js
  Port 3000        Port 80             Port 4000
```

## 🎯 Domaines

- **isa-ambato.mg** → Site vitrine (Nuxt.js)
- **edu.isa-ambato.mg** → Application étudiants (Vue.js)
- **api.isa-ambato.mg** → API Backend (Node.js/Express + Socket.IO)

## ⚡ Fonctionnalités

- ✅ **MongoDB avec Replica Set** - Support complet des transactions
- ✅ **Socket.IO** - WebSocket temps réel configuré
- ✅ **API REST** - Préfixe `/api/v1` supporté
- ✅ **SSL/HTTPS** - Certificats Let's Encrypt
- ✅ **Déploiement Zero-Downtime** - Mise à jour sans interruption
- ✅ **CI/CD automatique** - Push sur gitMain → déploiement auto

## 🚀 Démarrage rapide

### Local

```bash
# 1. Cloner le repo
git clone <repo-url>
cd ISA

# 2. Créer les fichiers .env
cp .env.example .env
cp Frontend-isa/.env.example Frontend-isa/.env
cp vitrine-isa/.env.example vitrine-isa/.env

# 3. Éditer les variables sensibles
nano .env

# 4. Lancer
docker-compose up -d

# 5. Initialiser le Replica Set MongoDB (première fois)
bash init-replica-set.sh

# 6. Vérifier
docker-compose ps
docker-compose logs -f
```

### VPS Production

```bash
# 1. Se connecter au VPS
ssh root@votre-vps

# 2. Installer Docker (première fois seulement)
bash setup-vps.sh

# 3. Générer certificats SSL
certbot certonly --standalone -d api.isa-ambato.mg
certbot certonly --standalone -d edu.isa-ambato.mg
certbot certonly --standalone -d isa-ambato.mg -d www.isa-ambato.mg

# 4. Copier les certificats
mkdir -p ssl/live/api.isa-ambato.mg
mkdir -p ssl/live/edu.isa-ambato.mg
mkdir -p ssl/live/isa-ambato.mg

cp /etc/letsencrypt/live/api.isa-ambato.mg/* ssl/live/api.isa-ambato.mg/
cp /etc/letsencrypt/live/edu.isa-ambato.mg/* ssl/live/edu.isa-ambato.mg/
cp /etc/letsencrypt/live/isa-ambato.mg/* ssl/live/isa-ambato.mg/

# 5. Cloner et configurer
git clone <repo-url> /home/isa
cd /home/isa
cp .env.example .env
nano .env  # Remplir les valeurs

# 6. Démarrer
docker-compose up -d

# 7. Initialiser MongoDB Replica Set (pour transactions)
bash init-replica-set.sh

# 8. Vérifier
docker-compose ps
docker-compose logs -f
```

## 🔧 Configuration GitHub Actions

### Secrets à ajouter dans GitHub

`Settings > Secrets and variables > Actions` :

```
VPS_HOST              # IP ou domaine du VPS
VPS_USERNAME          # Utilisateur SSH (ex: root)
VPS_SSH_KEY           # Clé SSH privée
VPS_SSH_PORT          # Port SSH (défaut: 22)
VPS_APP_DIR           # Chemin app (ex: /home/isa)
MONGO_USER            # admin
MONGO_PASSWORD        # mot de passe MongoDB
MONGO_DB              # isa
SESSION_SECRET        # 32+ caractères aléatoires
JWT_SECRET            # 32+ caractères aléatoires
```

## 🔄 Workflow de déploiement

```
1. Développeur push sur gitMain
         ↓
2. GitHub Actions trigger
         ↓
3. SSH vers VPS
         ↓
4. Pull code
         ↓
5. Exécution deploy.sh
         ↓
6. Backup MongoDB
         ↓
7. Build images
         ↓
8. Déploiement rolling (backend → frontend → vitrine)
         ↓
9. Health checks
         ↓
10. Nettoyage
```

## 📝 Variables d'environnement

### Backend (.env)
```env
NODE_ENV=production
MONGO_USER=admin
MONGO_PASSWORD=votre_password
MONGO_DB=isa
SESSION_SECRET=secret_32_caracteres_minimum
JWT_SECRET=jwt_secret_32_caracteres
FRONTEND_URL=https://edu.isa-ambato.mg
VITRINE_URL=https://isa-ambato.mg
```

### Frontend (Frontend-isa/.env)
```env
VITE_API_URL=https://api.isa-ambato.mg
```

### Vitrine (vitrine-isa/.env)
```env
NUXT_PUBLIC_API_URL=https://api.isa-ambato.mg
```

## 🛠️ Commandes utiles

```bash
# Voir les logs
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Arrêter et supprimer volumes (⚠️ supprime données)
docker-compose down -v

# Entrer dans un conteneur
docker exec -it isa-backend sh

# Voir les stats
docker stats

# Nettoyer
docker system prune -a
```

## 🔐 Configuration CORS Backend

Dans `backend-isa/index.js`, ajouter:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://edu.isa-ambato.mg',
    'https://isa-ambato.mg',
    'http://localhost:5173',  // Dev frontend
    'http://localhost:3000',  // Dev vitrine
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

## 📊 Health checks

### Backend
```bash
curl https://api.isa-ambato.mg/health
```

### Frontend
```bash
curl https://edu.isa-ambato.mg
```

### Vitrine
```bash
curl https://isa-ambato.mg
```

## 🐛 Dépannage

### Services ne démarrent pas
```bash
docker-compose logs backend
docker-compose restart
```

### Certificats SSL expirés
```bash
certbot renew
docker-compose restart nginx
```

### MongoDB connection failed
```bash
# Vérifier MongoDB
docker exec isa-mongodb mongosh -u admin -p password
```

### Port déjà utilisé
```bash
# Trouver le processus
sudo lsof -i :4000
# Tuer le processus
kill -9 <PID>
```

## 📦 Fichiers créés

```
ISA/
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions CI/CD
├── backend-isa/
│   └── Dockerfile           # Image backend
├── Frontend-isa/
│   ├── Dockerfile          # Image frontend
│   ├── nginx.conf          # Config nginx frontend
│   └── .env.example
├── vitrine-isa/
│   ├── Dockerfile          # Image vitrine
│   └── .env.example
├── docker-compose.yml       # Orchestration services
├── nginx.conf              # Reverse proxy principal
├── deploy.sh               # Script déploiement zero-downtime
├── setup-vps.sh            # Installation VPS
├── .env.example            # Variables environnement
└── .gitignore              # Fichiers ignorés
```

## ✅ Checklist déploiement

- [ ] DNS configurés (api, edu, isa-ambato.mg)
- [ ] Docker installé sur VPS
- [ ] Certificats SSL générés
- [ ] Fichiers .env créés
- [ ] GitHub Secrets configurés
- [ ] Premier déploiement testé
- [ ] CORS configuré dans backend
- [ ] Health checks fonctionnent

## 🎉 C'est prêt !

Après configuration, chaque push sur `gitMain` déclenchera automatiquement un déploiement sans interruption sur votre VPS.
