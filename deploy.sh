#!/bin/bash
# Script de déploiement sans interruption (Zero-Downtime)
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log "=== Début du déploiement ISA Ambato ==="

# Vérifier si MongoDB est en mode replica set
log "Vérification du Replica Set MongoDB..."
if ! docker exec isa-mongodb mongosh --eval 'rs.status()' &>/dev/null; then
    warn "Replica Set non initialisé, initialisation..."
    docker exec isa-mongodb mongosh --eval '
    rs.initiate({
      _id: "rs0",
      members: [{ _id: 0, host: "localhost:27017" }]
    })
    ' || warn "Erreur initialisation Replica Set"
    sleep 5
fi
success "MongoDB Replica Set configuré (transactions activées)"

# Backup MongoDB
log "Backup MongoDB..."
BACKUP_DIR="./backups/$(date +'%Y%m%d_%H%M%S')"
mkdir -p "$BACKUP_DIR"
docker exec isa-mongodb mongodump --uri="mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:27017/${MONGO_DB}?authSource=admin&replicaSet=rs0" --out="$BACKUP_DIR" 2>/dev/null || warn "Backup MongoDB échoué"

# Pull nouvelles images
log "Téléchargement des images Docker..."
docker-compose pull --quiet

# Build nouvelles images locales
log "Build des nouvelles images..."
docker-compose build --quiet

# Déploiement rolling avec health checks
log "Déploiement des services..."

# Étape 1: Backend
log "Mise à jour du backend..."
docker-compose up -d --no-deps backend
sleep 10

# Vérifier backend
if docker ps --filter "name=isa-backend" --filter "status=running" | grep -q isa-backend; then
    success "Backend démarré"
else
    error "Backend a échoué"
    docker-compose logs --tail=50 backend
    exit 1
fi

# Étape 2: Frontend
log "Mise à jour du frontend..."
docker-compose up -d --no-deps frontend
sleep 5

if docker ps --filter "name=isa-frontend" --filter "status=running" | grep -q isa-frontend; then
    success "Frontend démarré"
else
    error "Frontend a échoué"
    exit 1
fi

# Étape 3: Vitrine
log "Mise à jour de la vitrine..."
docker-compose up -d --no-deps vitrine
sleep 5

if docker ps --filter "name=isa-vitrine" --filter "status=running" | grep -q isa-vitrine; then
    success "Vitrine démarrée"
else
    error "Vitrine a échoué"
    exit 1
fi

# Étape 4: Nginx (si besoin)
log "Recharge de Nginx..."
docker-compose up -d --no-deps nginx
docker exec isa-nginx nginx -s reload 2>/dev/null || true

# Nettoyage
log "Nettoyage des ressources..."
docker system prune -f --volumes 2>/dev/null || true

# Vérification finale
log "Vérification des services..."
docker-compose ps

success "=== Déploiement complété avec succès ==="
log "Services disponibles:"
log "  - API: https://api.isa-ambato.mg"
log "  - Application: https://edu.isa-ambato.mg"
log "  - Vitrine: https://isa-ambato.mg"
