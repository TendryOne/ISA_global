#!/bin/bash
# Script d'installation initiale sur le VPS

set -e

echo "=== Installation Docker sur VPS ISA Ambato ==="

# Mise à jour système
apt-get update && apt-get upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Installer Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Ajouter utilisateur au groupe docker
usermod -aG docker $USER

# Installer certbot pour SSL
apt-get install -y certbot

# Configurer firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "✓ Installation terminée"
echo ""
echo "Prochaines étapes:"
echo "1. Se déconnecter et reconnecter pour appliquer les permissions Docker"
echo "2. Générer les certificats SSL:"
echo "   certbot certonly --standalone -d api.isa-ambato.mg"
echo "   certbot certonly --standalone -d edu.isa-ambato.mg"
echo "   certbot certonly --standalone -d isa-ambato.mg -d www.isa-ambato.mg"
echo "3. Cloner le repository: git clone <repo-url> /home/isa"
echo "4. Créer le fichier .env: cp .env.example .env && nano .env"
echo "5. Démarrer: docker-compose up -d"
