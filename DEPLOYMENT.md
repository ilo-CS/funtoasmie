# Guide de Déploiement sur VPS

Ce document décrit comment configurer et déployer l'application FUNTOA SMIE sur un VPS via GitHub Actions.

## Prérequis

1. Un VPS avec :
   - Docker et Docker Compose installés
   - SSH configuré
   - Accès root ou utilisateur avec permissions sudo

2. Un compte GitHub avec :
   - Le repository configuré
   - GitHub Container Registry activé (ghcr.io)

## Configuration sur le VPS

### 1. Installation initiale

```bash
# Créer le répertoire de déploiement
sudo mkdir -p /opt/funtoa
cd /opt/funtoa

# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git .

# Créer le fichier .env avec vos variables d'environnement
cp .env.example .env
nano .env
```

### 2. Configuration du fichier .env

Créer un fichier `.env` à la racine du projet. Vous pouvez copier le fichier `.env.example` fourni comme modèle :

```bash
cp .env.example .env
nano .env
```

Modifier les variables selon votre configuration :

```env
# Base de données
DB_ROOT_PASSWORD=votre_mot_de_passe_root
DB_NAME=db_funtoasmie
DB_USER=raza
DB_PASSWORD=votre_mot_de_passe_db
DB_HOST=mysql
DB_PORT=3306

# Backend
NODE_ENV=production
PORT=5000
BACKEND_PORT=5000
JWT_SECRET=votre_secret_jwt_aleatoire
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
# IMPORTANT: Définir l'origine (URL) de votre frontend déployé
# Format: http://VOTRE_IP_VPS:80,http://VOTRE_IP_VPS (remplacer VOTRE_IP_VPS par l'IP de votre VPS)
# Ou avec un domaine: https://votre-domaine.com,http://votre-domaine.com
CORS_ORIGIN=http://VOTRE_IP_VPS:80,http://VOTRE_IP_VPS,http://localhost:3000
BCRYPT_ROUNDS=12

# Frontend
FRONTEND_PORT=80
# Cette variable est utilisée lors du build Docker (configurée dans les secrets GitHub)
# Format: http://VOTRE_IP_VPS:5000/api (remplacer VOTRE_IP_VPS par l'IP de votre VPS)
REACT_APP_API_URL=http://VOTRE_IP_VPS:5000/api

# MySQL
MYSQL_PORT=3306
```

### 3. Configuration des images Docker

Les images sont automatiquement construites et poussées vers GitHub Container Registry lors des pushes sur `main` ou `master`. Le fichier `docker-compose.prod.yml` utilise ces images du registre.

## Configuration GitHub Secrets

Dans les paramètres du repository GitHub, ajouter les secrets suivants :

### Secrets requis :

- `IP_SRV` : L'adresse IP de votre VPS
- `USR_SRV` : Le nom d'utilisateur SSH pour se connecter au VPS
- `SSH_PK` : La clé privée SSH pour l'authentification
- `PORT_SRV` : Le port SSH (par défaut 22, optionnel si port standard)
- `GHCR_TOKEN` : Un Personal Access Token GitHub avec les permissions `write:packages` et `read:packages` (ou utiliser `GITHUB_TOKEN` automatique)
- `REACT_APP_API_URL` : **IMPORTANT** - L'URL complète de l'API backend pour le frontend (ex: `http://VOTRE_IP_VPS:5000/api` ou `https://api.votre-domaine.com/api`). Cette URL est intégrée dans l'image Docker du frontend lors du build.

### Comment générer les secrets :

#### SSH Key
```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copier la clé publique vers le VPS
ssh-copy-id -i ~/.ssh/github_actions.pub user@vps_ip

# Copier le contenu de la clé privée pour le secret SSH_PK
cat ~/.ssh/github_actions
```

#### GitHub Personal Access Token
1. Aller sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Créer un nouveau token avec les permissions :
   - `write:packages`
   - `read:packages`
   - `delete:packages` (optionnel)

## Déploiement

Le déploiement se fait automatiquement lors d'un push sur la branche `main` ou `master`, ou manuellement via l'action GitHub Actions.

### Déploiement manuel

1. Aller dans l'onglet "Actions" du repository GitHub
2. Sélectionner "Build and Deploy to VPS"
3. Cliquer sur "Run workflow"

### Processus de déploiement

Le pipeline CI/CD comprend 3 étapes principales :

1. **Validate** : Validation que tous les fichiers nécessaires (Dockerfiles, docker-compose) existent
2. **Build and Push** : 
   - Construction des images Docker pour backend et frontend
   - **Frontend** : Utilise le secret `REACT_APP_API_URL` pour configurer l'URL de l'API dans l'image
   - Push vers GitHub Container Registry (ghcr.io)
   - Support multi-plateforme (amd64, arm64)
   - Mise en cache pour accélérer les builds suivants
3. **Deploy** : 
   - Validation des secrets GitHub requis
   - Connexion SSH au VPS
   - Vérification de l'installation de Docker et Docker Compose
   - Initialisation du dépôt Git si nécessaire
   - Mise à jour du code depuis Git
   - Authentification au registre Docker (GHCR)
   - Arrêt des conteneurs existants (sans supprimer les volumes)
   - Pull des nouvelles images
   - Démarrage des conteneurs
   - Vérification de l'état des conteneurs
   - Affichage des logs pour vérification
   - Nettoyage automatique des images non utilisées

### Configuration CORS et URL API

**Problème courant** : Erreur CORS ou l'application frontend ne peut pas communiquer avec le backend.

**Solution** :

1. **Configurer `REACT_APP_API_URL` dans les secrets GitHub** :
   - Format : `http://VOTRE_IP_VPS:5000/api` (remplacer `VOTRE_IP_VPS` par l'IP de votre VPS)
   - Cette URL sera intégrée dans l'image Docker du frontend lors du build
   - Exemple : `http://192.168.1.100:5000/api`

2. **Configurer `CORS_ORIGIN` dans le fichier `.env` sur le VPS** :
   - Format : `http://VOTRE_IP_VPS:80,http://VOTRE_IP_VPS` (remplacer par l'IP de votre VPS)
   - Ou avec un domaine : `https://votre-domaine.com,http://votre-domaine.com`
   - Vous pouvez ajouter plusieurs origines séparées par des virgules
   - Exemple : `http://192.168.1.100:80,http://192.168.1.100`

## Vérification après déploiement

```bash
# Se connecter au VPS
ssh user@vps_ip

# Vérifier l'état des conteneurs
cd /opt/funtoa
docker compose -f docker-compose.prod.yml ps

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f

# Vérifier les logs d'un service spécifique
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

## Configuration Nginx (reverse proxy, optionnel)

Si vous utilisez un reverse proxy Nginx devant votre application :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Dépannage

### Les conteneurs ne démarrent pas

1. Vérifier les logs de déploiement dans GitHub Actions
2. Se connecter au VPS et vérifier l'état :
```bash
docker compose -f docker-compose.prod.yml logs
docker compose -f docker-compose.prod.yml ps
```
3. Vérifier que le fichier `.env` existe et contient toutes les variables nécessaires
4. Vérifier que les images Docker sont accessibles dans le registre GHCR

### Problème de connexion à la base de données
```bash
docker compose -f docker-compose.prod.yml exec mysql mysql -u root -p
```

### Mettre à jour manuellement
```bash
cd /opt/funtoa
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Nettoyer les images Docker
```bash
docker system prune -a
```

## Sécurité

- ✅ Ne jamais commiter le fichier `.env`
- ✅ Utiliser des mots de passe forts pour la base de données
- ✅ Configurer un firewall (ufw, iptables)
- ✅ Utiliser HTTPS avec Let's Encrypt
- ✅ Garder Docker et le système à jour
- ✅ Limiter l'accès SSH (clés uniquement, désactiver le login root)

