# 🚀 Guide Complet de Déploiement FUNTOA SMIE sur VPS

## 📋 Table des matières
1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Configuration GitHub Secrets](#configuration-github-secrets)
4. [Préparation du VPS](#préparation-du-vps)
5. [Pipeline CI/CD](#pipeline-cicd)
6. [Monitoring & Dépannage](#monitoring--dépannage)
7. [Mise à jour en Production](#mise-à-jour-en-production)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (CI/CD)                                     │
├─────────────────────────────────────────────────────────────┤
│  1️⃣  VALIDATE → Vérifier Dockerfiles                       │
│  2️⃣  TEST     → Jest (backend + frontend)                  │
│  3️⃣  BUILD    → Build images Docker & push GHCR            │
│  4️⃣  DEPLOY   → SSH vers VPS & docker-compose up          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (via SSH tunnel)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  VPS (37.59.118.164)                                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Docker Compose Stack                                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  🟢 Nginx (port 80/443)                              │   │
│  │     ├─ Serve frontend statique (React)              │   │
│  │     └─ Reverse proxy /api → backend                 │   │
│  │                                                      │   │
│  │  🔵 Backend (port 5000)                              │   │
│  │     └─ Node.js + Express API                        │   │
│  │                                                      │   │
│  │  🟡 MySQL/MariaDB (port 3306)                        │   │
│  │     └─ Base de données persistante                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Prérequis

### Côté GitHub (Repositery)
- ✅ Compte GitHub avec accès au repo `ilo-CS/funtoasmie`
- ✅ Permissions: admin sur le repo pour configurer les secrets
- ✅ Personal Access Token (PAT) avec scopes `read:packages` pour GHCR

### Côté VPS
- ✅ Serveur Linux (Ubuntu 20.04+ ou Debian 11+)
- ✅ IP: `37.59.118.164`
- ✅ SSH accès configuré (clé publique de l'utilisateur de déploiement)
- ✅ Docker installé (v20+)
- ✅ Docker Compose installé (v2+)
- ✅ Dossier `/opt/funtoa` créé et accessible

---

## Configuration GitHub Secrets

### 📝 Créer les secrets dans GitHub

**Navigation**: Repo → **Settings → Secrets and variables → Actions**

Créez les secrets suivants :

| Secret | Valeur | Exemple | Notes |
|--------|--------|---------|-------|
| `IP_SRV` | Adresse IP du VPS | `37.59.118.164` | IP publique du serveur |
| `USR_SRV` | Utilisateur SSH | `deploy` | Utilisateur non-root recommandé |
| `SSH_PK` | Clé privée SSH | (voir ci-dessous) | SSH key de l'utilisateur |
| `PORT_SRV` | Port SSH | `22` | Port SSH du serveur |
| `GHCR_TOKEN` | Personal Access Token | (voir ci-dessous) | PAT avec `read:packages` |
| `REACT_APP_API_URL` | URL API frontend | `http://37.59.118.164/api` | ⚠️ Voir note ci-dessous |
| `SMOKE_URL` | URL de test (optionnel) | `http://37.59.118.164/health` | Health check après deploy |

### 🔑 Générer la clé SSH

#### Sur votre machine locale:
```bash
# Générer une clé SSH sans passphrase (pour CI/CD)
ssh-keygen -t ed25519 -f deploy_key -N ""

# Afficher la clé privée (pour GitHub secret SSH_PK)
cat deploy_key
```

#### Sur le VPS (utilisateur deploy):
```bash
# Copier la clé publique dans authorized_keys
echo "$(cat deploy_key.pub)" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 🔐 Générer le GHCR_TOKEN

1. Aller sur: https://github.com/settings/tokens
2. Cliquer **Generate new token (classic)**
3. Scope requis: `read:packages`, `write:packages`
4. Copier le token dans le secret `GHCR_TOKEN`

### ⚠️ REACT_APP_API_URL

**Important** : Cette URL est utilisée par le frontend React pour appeler l'API.

- **LOCAL** (dev): `http://localhost:5000/api`
- **PRODUCTION** (VPS): `http://37.59.118.164/api` ou `https://api.funtoa-smie.com/api`

Le workflow la passe en `build-args` au Dockerfile du frontend.

---

## Préparation du VPS

### 1️⃣ Préparer le système

```bash
# Connexion au VPS
ssh deploy@37.59.118.164

# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Installer Docker (si pas déjà installé)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier les installations
docker --version
docker-compose --version
```

### 2️⃣ Préparer les répertoires

```bash
# Créer le dossier de déploiement
sudo mkdir -p /opt/funtoa
sudo chown $USER:$USER /opt/funtoa

# Créer les sous-dossiers
mkdir -p /opt/funtoa/{frontend,backend,config}

cd /opt/funtoa
```

### 3️⃣ Configurer le .env de production

```bash
cd /opt/funtoa

# Créer le fichier .env à partir du template
cat > .env << 'EOF'
# ═══════════════════════════════════════════════════════════════
# PRODUCTION ENVIRONMENT
# ═══════════════════════════════════════════════════════════════

# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=db_funtoasmie
DB_USER=raza
DB_PASSWORD=changez_ce_mot_de_passe_fort_32_chars
DB_ROOT_PASSWORD=changez_ce_root_password_32_chars

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=changez_cette_clé_secrète_openssl_rand_hex_32
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://37.59.118.164,https://app.funtoa-smie.com

# Frontend
REACT_APP_API_URL=http://37.59.118.164/api

# Docker ports
BACKEND_PORT=5000
MYSQL_PORT=3306
EOF

# Sécuriser le fichier
chmod 600 .env
```

### 4️⃣ Configuration initiale du Git

```bash
cd /opt/funtoa

# Initialiser le dépôt (le workflow le fera, mais on peut préparer)
git init
git remote add origin https://github.com/ilo-CS/funtoasmie.git
git fetch origin main
git checkout main

# Ou simplement cloner:
# cd /opt && git clone https://github.com/ilo-CS/funtoasmie.git funtoa
```

### 5️⃣ Test de connexion GHCR

```bash
# Se connecter au GitHub Container Registry
echo "YOUR_GHCR_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Tester un pull (exemple)
docker pull ghcr.io/ilo-cs/funtoa-backend:latest
```

---

## Pipeline CI/CD

### 🔄 Déclenchement automatique

Le workflow `deploy.yml` se déclenche automatiquement sur :
- ✅ Push sur `main` ou `master`
- ✅ Workflow dispatch (bouton "Run workflow" manuellement)

### 📊 Étapes du workflow

```
┌────────────────────────┐
│  1. VALIDATE           │  ✓ Dockerfiles existent
└────────────────────────┘
         ↓
┌────────────────────────┐
│  2. TEST-BACKEND       │  ✓ Jest + Coverage
│     TEST-FRONTEND      │  ✓ Jest + Coverage
└────────────────────────┘
         ↓
┌────────────────────────┐
│  3. BUILD-AND-PUSH     │  ✓ Build images
│                        │  ✓ Push GHCR
└────────────────────────┘
         ↓
┌────────────────────────┐
│  4. DEPLOY (SSH)       │  ✓ Git pull
│                        │  ✓ Docker login
│                        │  ✓ docker-compose up
└────────────────────────┘
```

### 🔍 Vérifier l'exécution

**GitHub Actions UI**:
1. Aller sur: Repo → **Actions**
2. Voir les workflows en cours/passés
3. Cliquer sur le run pour voir les logs détaillés

---

## Monitoring & Dépannage

### 📊 Vérifier l'état des conteneurs

```bash
# SSH au VPS
ssh deploy@37.59.118.164
cd /opt/funtoa

# Lister les conteneurs
docker compose ps

# Exemple de sortie réussie:
# NAME                 IMAGE                              STATUS        PORTS
# funtoa-mysql         mariadb:10.4                       Up 2 hours    3306/tcp
# funtoa-backend       ghcr.io/.../funtoa-backend:latest  Up 2 hours    0.0.0.0:5000->5000/tcp
# funtoa-frontend      ghcr.io/.../funtoa-frontend:latest Up 2 hours    80/tcp
# funtoa-nginx         nginx:1.27-alpine                  Up 2 hours    0.0.0.0:80->80/tcp
```

### 🔎 Logs détaillés

```bash
# Tous les logs récents
docker compose logs --tail=50

# Logs d'un service spécifique
docker compose logs backend
docker compose logs frontend
docker compose logs nginx

# Logs en temps réel (suivi)
docker compose logs -f

# Logs avec timestamps
docker compose logs -t --tail=100
```

### ✅ Health checks

```bash
# Health check du frontend
curl -I http://37.59.118.164/health

# Health check du backend (attendu 200 ou 500 avec réponse)
curl http://37.59.118.164/api/health 2>/dev/null | head -c 100

# Test reverse proxy nginx
curl -v http://37.59.118.164/ | head -20
curl -v http://37.59.118.164/api/auth/login -X POST
```

### 🐛 Dépannage courant

#### ❌ Erreur: "Cannot pull image"
```bash
# Vérifier la connexion GHCR
docker login ghcr.io
docker pull ghcr.io/ilo-cs/funtoa-backend:latest

# Vérifier le GHCR_TOKEN dans GitHub Secrets
# Re-générer si expiré: https://github.com/settings/tokens
```

#### ❌ Erreur: "Connection refused on backend"
```bash
# Vérifier que le backend est ready
docker compose logs backend | tail -20

# Attendre les health checks (30s)
docker compose ps  # Vérifier status

# Redémarrer le service
docker compose restart backend
```

#### ❌ Erreur: "Nginx 502 Bad Gateway"
```bash
# Vérifier la config nginx
docker compose logs nginx | tail -20

# Vérifier que le frontend est en listening
docker compose logs frontend | head -20

# Redémarrer la stack
docker compose down
docker compose up -d --remove-orphans
```

#### ❌ Erreur: "Database connection failed"
```bash
# Vérifier MySQL
docker compose logs mysql | tail -20

# Vérifier les credentials dans .env
cat .env | grep DB_

# Redémarrer MySQL
docker compose restart mysql
sleep 10
docker compose ps
```

### 📈 Monitoring (optionnel)

```bash
# Stats en temps réel
docker stats

# Utilisation disque
df -h /opt/funtoa

# Volumes Docker
docker volume ls

# Cleanup des images non utilisées
docker image prune -af --filter "until=24h"
```

---

## Mise à jour en Production

### 🔄 Déployer une nouvelle version

**Option 1: Via GitHub (Recommandé)**
```bash
# Faire un commit et push sur main
git add .
git commit -m "fix: nginx config"
git push origin main

# Le workflow s'exécute automatiquement
# Vérifier dans Actions → logs
```

**Option 2: Manuel (Si workflow échoue)**
```bash
ssh deploy@37.59.118.164
cd /opt/funtoa

# Récupérer les dernières modifications
git pull origin main

# Relancer le déploiement
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Vérifier
docker compose ps
docker compose logs --tail=30
```

### 🔄 Rollback (Si problème)

```bash
ssh deploy@37.59.118.164
cd /opt/funtoa

# Arrêter les conteneurs actuels
docker compose down

# Récupérer la version précédente
git log --oneline | head -5
git checkout <commit_id>

# Redémarrer
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Sécurité (Production)

### SSL/TLS avec Let's Encrypt (Optionnel mais Recommandé)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Générer le certificat
sudo certbot certonly --standalone -d app.funtoa-smie.com -d api.funtoa-smie.com

# Configurer nginx pour HTTPS
# (Voir fichier nginx/default.conf.prod-ssl dans le repo)

# Renouvellement automatique
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Variables sensibles

- **Ne JAMAIS** commiter `.env` en production
- **Ne JAMAIS** mettre de vrais secrets dans les logs
- Rotater régulièrement `JWT_SECRET` et `DB_PASSWORD`

---

## 📞 Support & Ressources

- Docs GitHub Actions: https://docs.github.com/en/actions
- Docs Docker Compose: https://docs.docker.com/compose/
- Docs Nginx: https://nginx.org/en/docs/
- Docs GHCR: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

---

**Dernière mise à jour**: 29/11/2025  
**Statut**: ✅ Production Ready
