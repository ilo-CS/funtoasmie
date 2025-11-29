#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════
# SCRIPT: Dépannage et monitoring de FUNTOA SMIE
# ═══════════════════════════════════════════════════════════════════════════════════════
# Usage: bash debug.sh [command]
# Commands: status, logs, health, stats, restart, clean, help
# ═══════════════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DEPLOY_DIR=\"${DEPLOY_DIR:-/opt/funtoa}\"
COMPOSE_FILE=\"${COMPOSE_FILE:-$DEPLOY_DIR/docker-compose.prod.yml}\"

# Fallback to docker-compose.yml if prod doesn't exist
if [ ! -f \"$COMPOSE_FILE\" ]; then
    COMPOSE_FILE=\"$DEPLOY_DIR/docker-compose.yml\"
fi

# ─────────────────────────────────────────────────────────────────────────────────────────
# Fonctions
# ─────────────────────────────────────────────────────────────────────────────────────────

print_header() {
    echo -e \"\\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}\"
    echo -e \"${BLUE}║ \$1${NC}\"
    echo -e \"${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\\n\"
}

print_success() {
    echo -e \"${GREEN}✅ \$1${NC}\"
}

print_error() {
    echo -e \"${RED}❌ \$1${NC}\"
}

print_warning() {
    echo -e \"${YELLOW}⚠️ \$1${NC}\"
}

print_info() {
    echo -e \"${BLUE}ℹ️ \$1${NC}\"
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Commande: status
# ─────────────────────────────────────────────────────────────────────────────────────────

cmd_status() {
    print_header \"STATUT DES CONTENEURS\"
    
    cd \"$DEPLOY_DIR\"
    
    if [ ! -f \"$COMPOSE_FILE\" ]; then
        print_error \"Fichier docker-compose non trouvé: $COMPOSE_FILE\"
        return 1
    fi
    
    print_info \"Compose file: $COMPOSE_FILE\"
    
    docker compose -f \"$COMPOSE_FILE\" ps
    
    echo \"\"
    
    # Vérifier les arrêts anormaux
    EXITED=$(docker compose -f \"$COMPOSE_FILE\" ps --filter \"status=exited\" --format \"{{.Names}}\" 2>/dev/null | wc -l)
    
    if [ \"$EXITED\" -gt 0 ]; then
        print_error \"$EXITED conteneur(s) sont arrêtés!\"
        docker compose -f \"$COMPOSE_FILE\" ps --filter \"status=exited\"
        return 1
    else
        print_success \"Tous les conteneurs sont actifs\"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Commande: logs
# ─────────────────────────────────────────────────────────────────────────────────────────

cmd_logs() {
    print_header \"LOGS DES CONTENEURS\"
    
    cd \"$DEPLOY_DIR\"
    
    SERVICE=\"\${1:-all}\"
    
    if [ \"$SERVICE\" = \"all\" ] || [ -z \"$SERVICE\" ]; then
        print_info \"Affichage des 50 dernières lignes de tous les services...\"
        docker compose -f \"$COMPOSE_FILE\" logs --tail=50
    else
        print_info \"Affichage des logs de: $SERVICE\"
        docker compose -f \"$COMPOSE_FILE\" logs --tail=100 \"$SERVICE\"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Commande: health
# ─────────────────────────────────────────────────────────────────────────────────────────

cmd_health() {
    print_header \"VÉRIFICATION DE SANTÉ\"
    
    echo \"\"
    print_info \"🌍 Health check frontend (nginx):\"
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        print_success \"Frontend répond\"
    else
        print_error \"Frontend ne répond pas\"
    fi
    
    echo \"\"
    print_info \"📡 Health check API backend:\"
    if curl -sf http://localhost/api/health > /dev/null 2>&1; then
        print_success \"Backend API répond\"
    else
        print_warning \"Backend API ne répond pas (peut être normal)\"
    fi
    
    echo \"\"
    print_info \"💾 Health check database:\"
    cd \"$DEPLOY_DIR\"
    if docker compose -f \"$COMPOSE_FILE\" exec -T mysql mysqladmin ping -u root -p\$(grep DB_ROOT_PASSWORD .env 2>/dev/null | cut -d= -f2) > /dev/null 2>&1; then
        print_success \"Database répond\"
    else
        print_warning \"Database peut être indisponible\"
    fi
    
    echo \"\"
    print_info \"🔄 Tentative de connexion API complète:\"
    RESPONSE=\$(curl -s -w \"\\n%{http_code}\" http://localhost/api/auth/login -X POST -H \"Content-Type: application/json\" -d '{}' 2>/dev/null | tail -1)
    
    if [ \"\$RESPONSE\" -lt 500 ]; then
        print_success \"API répond (HTTP \$RESPONSE)\"
    else
        print_error \"API erreur 5xx (HTTP \$RESPONSE)\"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Commande: stats
# ─────────────────────────────────────────────────────────────────────────────────────────

cmd_stats() {
    print_header \"STATISTIQUES SYSTÈME\"
    
    echo \"\"
    print_info \"📊 Utilisation Docker:\"
    docker stats --no-stream --format \"table {{.Container}}\\t{{.MemUsage}}\\t{{.CPUPerc}}\\t{{.NetIO}}\"
    
    echo \"\"
    print_info \"💾 Utilisation disque (/opt/funtoa):\"
    du -sh \"$DEPLOY_DIR\"
    
    echo \"\"
    print_info \"🗄️  Volumes Docker:\"
    docker volume ls --filter name=funtoa
    
    echo \"\"
    print_info \"🖥️  Disque système:\"
    df -h / | grep -v Filesystem
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Commande: restart
# ─────────────────────────────────────────────────────────────────────────────────────────

cmd_restart() {
    print_header \"REDÉMARRAGE DES CONTENEURS\"
    
    cd \"$DEPLOY_DIR\"
    
    SERVICE=\"\${1:-all}\"
    
    if [ \"$SERVICE\" = \"all\" ] || [ -z \"$SERVICE\" ]; then
        print_warning \"Redémarrage de tous les conteneurs...\"
        docker compose -f \"$COMPOSE_FILE\" restart
        print_success \"Tous les conteneurs redémarrés\"
    else
        print_warning \"Redémarrage de: $SERVICE\"
        docker compose -f \"$COMPOSE_FILE\" restart \"$SERVICE\"
        print_success \"$SERVICE redémarré\"
    fi
    
    echo \"\"
    print_info \"État actuel:\"
    docker compose -f \"$COMPOSE_FILE\" ps
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Commande: clean
# ─────────────────────────────────────────────────────────────────────────────────────────

cmd_clean() {
    print_header \"NETTOYAGE\"
    
    print_warning \"Suppression des images non utilisées (données > 24h)...\"
    docker image prune -af --filter \"until=24h\"
    
    print_warning \"Suppression des conteneurs arrêtés...\"
    docker container prune -f
    
    print_warning \"Suppression des volumes orphelins...\"
    docker volume prune -f
    
    print_success \"Nettoyage terminé\"
    
    echo \"\"
    cmd_stats
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Commande: help
# ─────────────────────────────────────────────────────────────────────────────────────────

cmd_help() {
    cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║  FUNTOA SMIE - Outil de Dépannage                             ║
╚════════════════════════════════════════════════════════════════╝

USAGE: bash debug.sh [command] [options]

COMMANDES:

  status               Affiche l'état des conteneurs
  logs [service]       Affiche les logs
                       - 'all' ou rien = tous les services
                       - 'backend', 'frontend', 'mysql', 'nginx'
  
  health               Teste les health checks
                       - Frontend (/health)
                       - Backend API (/api/health)
                       - Database (MySQL)
  
  stats                Affiche les statistiques système
                       - Utilisation CPU/RAM/Disque
                       - Volumes Docker
  
  restart [service]    Redémarre les conteneurs
                       - 'all' ou rien = tous
                       - 'backend', 'frontend', 'mysql', 'nginx'
  
  clean                Nettoie les images/conteneurs non utilisés
  
  help                 Affiche cette aide

EXEMPLES:

  bash debug.sh status
  bash debug.sh logs backend
  bash debug.sh health
  bash debug.sh restart mysql
  bash debug.sh stats
  bash debug.sh clean

CONFIGURATION:

  DEPLOY_DIR:   /opt/funtoa (par défaut)
  COMPOSE_FILE: docker-compose.prod.yml ou docker-compose.yml

DÉPANNAGE COURANT:

  ❌ Nginx 502 Bad Gateway
    → bash debug.sh logs nginx
    → bash debug.sh restart backend
  
  ❌ Connection refused
    → bash debug.sh health
    → bash debug.sh logs
    → bash debug.sh stats
  
  ❌ Database locked
    → bash debug.sh restart mysql
    → Attendre 30s avant de redémarrer les autres services

EOF
}

# ─────────────────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────────────────

COMMAND=\"\${1:-help}\"

case \"$COMMAND\" in
    status)  cmd_status ;;
    logs)    cmd_logs \"\${2:-}\" ;;
    health)  cmd_health ;;
    stats)   cmd_stats ;;
    restart) cmd_restart \"\${2:-}\" ;;
    clean)   cmd_clean ;;
    help)    cmd_help ;;
    *)
        print_error \"Commande inconnue: $COMMAND\"
        echo \"\"
        cmd_help
        exit 1
        ;;
esac

exit 0
