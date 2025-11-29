#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════
# SCRIPT: Initialisation du VPS pour FUNTOA SMIE
# ═══════════════════════════════════════════════════════════════════════════════════════
# Usage: bash deploy-init.sh
# Description: Prépare le VPS pour le déploiement (Docker, dossiers, .env)
# ═══════════════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────────────────
# Fonctions utilitaires
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Vérification des prérequis
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "VÉRIFICATION DES PRÉREQUIS"

# Vérifier sudo
if [ "$EUID" -eq 0 ]; then
   print_error "Ne pas exécuter ce script en root! Utiliser: bash deploy-init.sh"
   exit 1
fi

print_info "OS détecté: $(lsb_release -ds 2>/dev/null || echo 'Unknown')"
print_info "Utilisateur: $USER"
print_info "Home: $HOME"

# ─────────────────────────────────────────────────────────────────────────────────────────
# 1. Vérifier et installer Docker
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "ÉTAPE 1: Installer Docker"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker est déjà installé: $DOCKER_VERSION"
else
    print_info "Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo bash get-docker.sh
    rm get-docker.sh
    
    # Ajouter l'utilisateur au groupe docker
    sudo usermod -aG docker $USER
    print_success "Docker installé avec succès"
    print_warning "Veuillez relancer ce script ou exécuter: newgrp docker"
    exit 0
fi

# Vérifier que l'utilisateur peut exécuter docker
if ! docker ps &> /dev/null; then
    print_warning "L'utilisateur n'a pas accès à Docker. Ajout au groupe docker..."
    sudo usermod -aG docker $USER
    print_warning "Veuillez relancer le script ou exécuter: newgrp docker"
    exit 0
fi

# ─────────────────────────────────────────────────────────────────────────────────────────
# 2. Vérifier et installer Docker Compose
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "ÉTAPE 2: Installer Docker Compose"

if command -v docker compose &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    print_success "Docker Compose est déjà installé: $COMPOSE_VERSION"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "docker-compose (legacy) est installé: $COMPOSE_VERSION"
else
    print_info "Installation de Docker Compose..."
    COMPOSE_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)"
    sudo curl -L "$COMPOSE_URL" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installé avec succès"
fi

# ─────────────────────────────────────────────────────────────────────────────────────────
# 3. Créer la structure des dossiers
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "ÉTAPE 3: Créer la structure des dossiers"

DEPLOY_DIR="/opt/funtoa"

if [ -d "$DEPLOY_DIR" ]; then
    print_warning "Répertoire $DEPLOY_DIR existe déjà"
    if [ -d "$DEPLOY_DIR/.git" ]; then
        print_info "Dépôt Git détecté. Mise à jour..."
        cd "$DEPLOY_DIR"
        git fetch origin main || true
        git pull origin main || true
    fi
else
    print_info "Création du répertoire $DEPLOY_DIR..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown $USER:$USER "$DEPLOY_DIR"
    print_success "Répertoire créé: $DEPLOY_DIR"
fi

# Créer les sous-dossiers
mkdir -p "$DEPLOY_DIR"/{frontend/nginx,backend,config,scripts}
print_success "Sous-dossiers créés"

# ─────────────────────────────────────────────────────────────────────────────────────────
# 4. Initialiser/Mettre à jour le dépôt Git
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "ÉTAPE 4: Initialiser le dépôt Git"

cd "$DEPLOY_DIR"

if [ ! -d ".git" ]; then
    print_info "Initialisation du dépôt Git..."
    git init
    git remote add origin https://github.com/ilo-CS/funtoasmie.git
    git fetch origin main
    git checkout main
    print_success "Dépôt Git initialisé"
else
    print_info "Mise à jour du dépôt existant..."
    git remote set-url origin https://github.com/ilo-CS/funtoasmie.git || git remote add origin https://github.com/ilo-CS/funtoasmie.git
    git fetch origin main
    git checkout main
    git pull origin main
    print_success "Dépôt Git mis à jour"
fi

# ─────────────────────────────────────────────────────────────────────────────────────────
# 5. Créer/Vérifier le fichier .env
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "ÉTAPE 5: Configurer le fichier .env"

if [ -f "$DEPLOY_DIR/.env" ]; then
    print_warning "Fichier .env existe déjà"
    print_info "Pour mettre à jour, éditez manuellement: $DEPLOY_DIR/.env"
else
    print_info "Création du fichier .env..."
    
    # Générer des secrets sécurisés
    JWT_SECRET=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -base64 32)
    DB_ROOT_PASSWORD=$(openssl rand -base64 32)
    
    cat > "$DEPLOY_DIR/.env" << EOF
# ═══════════════════════════════════════════════════════════════════════════════════════
# FUNTOA SMIE - Production Environment
# ═══════════════════════════════════════════════════════════════════════════════════════
# Generated: $(date)
# Server: $(hostname)
# ═══════════════════════════════════════════════════════════════════════════════════════

# ─ Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_NAME=db_funtoasmie
DB_USER=raza
DB_PASSWORD=$DB_PASSWORD
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD

# ─ Backend Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://$(hostname -I | awk '{print $1}'),https://app.funtoa-smie.com

# ─ Frontend Configuration
REACT_APP_API_URL=http://$(hostname -I | awk '{print $1}')/api

# ─ Docker Ports
BACKEND_PORT=5000
MYSQL_PORT=3306
FRONTEND_PORT=3000

# ─ Note: Généré automatiquement par deploy-init.sh
# ═══════════════════════════════════════════════════════════════════════════════════════
EOF
    
    chmod 600 "$DEPLOY_DIR/.env"
    print_success "Fichier .env créé avec secrets générés automatiquement"
    print_warning "Veuillez VÉRIFIER et MODIFIER si nécessaire: $DEPLOY_DIR/.env"
fi

# ─────────────────────────────────────────────────────────────────────────────────────────
# 6. Tester la configuration Docker
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "ÉTAPE 6: Tester la configuration Docker"

cd "$DEPLOY_DIR"

if [ -f "docker-compose.prod.yml" ]; then
    print_info "Vérification de la syntaxe docker-compose..."
    docker compose -f docker-compose.prod.yml config > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Configuration docker-compose valide"
    else
        print_error "Erreur de syntaxe dans docker-compose.prod.yml"
        exit 1
    fi
else
    print_warning "Fichier docker-compose.prod.yml non trouvé"
    print_info "Le workflow GitHub Actions le créera ou utilisera docker-compose.yml"
fi

# ─────────────────────────────────────────────────────────────────────────────────────────
# 7. Authentification GHCR (optionnel)
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "ÉTAPE 7: Configuration GHCR (optionnel)"

print_warning "Avant de continuer, assurez-vous que GHCR_TOKEN est configurable via:"
print_info "GitHub Repo → Settings → Secrets and variables → Actions → GHCR_TOKEN"
print_info ""
print_info "Pour tester manuellement:"
echo "  echo 'YOUR_GHCR_TOKEN' | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin"
echo "  docker pull ghcr.io/ilo-cs/funtoa-backend:latest"
print_info ""

# ─────────────────────────────────────────────────────────────────────────────────────────
# 8. Résumé et prochaines étapes
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header "✅ INITIALISATION COMPLÈTE"

print_success "Toutes les préparations sont terminées!"
print_info ""
print_info "📋 Prochaines étapes:"
print_info "1. Vérifier le fichier .env:"
print_info "   cat $DEPLOY_DIR/.env"
print_info ""
print_info "2. Configurer les GitHub Secrets (si pas fait):"
print_info "   Voir: docs/DEPLOY.md - Configuration GitHub Secrets"
print_info ""
print_info "3. Push sur main pour déclencher le workflow:"
print_info "   git push origin main"
print_info ""
print_info "4. Vérifier l'exécution:"
print_info "   GitHub Repo → Actions → Voir les logs"
print_info ""
print_info "5. En cas de problème, vérifier les logs:"
print_info "   cd $DEPLOY_DIR"
print_info "   docker compose logs --tail=50"
print_info ""
print_info "📚 Documentation complète: docs/DEPLOY.md"

print_info \"\"\nℹ️  Système actualisé: $(date)\"

exit 0
