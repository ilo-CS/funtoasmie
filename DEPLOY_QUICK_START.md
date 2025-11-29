# 🚀 FUNTOA SMIE - Pipeline CI/CD avec Docker & VPS

## 📚 Vue d'ensemble

Vous avez un **pipeline CI/CD complet** avec GitHub Actions qui :
1. ✅ Valide le code
2. ✅ Lance les tests (Jest)
3. ✅ Build les images Docker
4. ✅ Push sur GitHub Container Registry (GHCR)
5. ✅ Déploie automatiquement sur votre VPS

---

## 📦 Fichiers créés/modifiés

| Fichier | Description |
|---------|-------------|
| **`.env.example`** | Template des variables d'environnement de production |
| **`.github/workflows/deploy.yml`** | Workflow GitHub Actions (CI/CD complet) |
| **`frontend/nginx/default.conf`** | ✨ Config nginx corrigée (serveur statique + reverse proxy) |
| **`docs/DEPLOY.md`** | 📖 Guide complet du déploiement |
| **`scripts/deploy-init.sh`** | 🔧 Script d'initialisation du VPS |
| **`scripts/debug.sh`** | 🐛 Script de dépannage et monitoring |

---

## ⚡ Quick Start (5 minutes)

### Étape 1️⃣: Configurer les GitHub Secrets

**URL**: `https://github.com/ilo-CS/funtoasmie/settings/secrets/actions`

Ajouter ces secrets :

```
IP_SRV = 37.59.118.164
USR_SRV = deploy (ou votre utilisateur SSH)
SSH_PK = (contenu de votre clé SSH privée)
PORT_SRV = 22
GHCR_TOKEN = (GitHub PAT avec read:packages)
REACT_APP_API_URL = http://37.59.118.164/api
```

> **Comment générer SSH_PK et GHCR_TOKEN ?** → Voir `docs/DEPLOY.md`

### Étape 2️⃣: Préparer le VPS

```bash
# SSH au VPS
ssh deploy@37.59.118.164

# Cloner et initialiser
git clone https://github.com/ilo-CS/funtoasmie.git /opt/funtoa
cd /opt/funtoa

# Exécuter le script d'initialisation
bash scripts/deploy-init.sh
```

### Étape 3️⃣: Déclencher le déploiement

```bash
# Push sur main pour déclencher le workflow automatiquement
git push origin main

# Ou manually via GitHub:
# Repo → Actions → "Build and Deploy to VPS" → Run workflow
```

### Étape 4️⃣: Vérifier le déploiement

```bash
# SSH au VPS
ssh deploy@37.59.118.164
cd /opt/funtoa

# Voir l'état
bash scripts/debug.sh status

# Voir les logs
bash scripts/debug.sh logs

# Health checks
bash scripts/debug.sh health
```

---

## 🔍 Fichiers clés expliqués

### 1. `.env.example` → Variables de production

```bash
# Copier localement pour tester
cp .env.example .env

# Sur le VPS, le script deploy-init.sh génère .env automatiquement
# avec des secrets sécurisés (openssl)
```

### 2. `deploy.yml` → Workflow GitHub Actions

**Phases du workflow** :

```
┌─────────────┐
│  VALIDATE   │  ✓ Dockerfile existe
└──────┬──────┘
       ↓
┌─────────────────────────┐
│  TEST-BACKEND           │  ✓ Jest + Coverage
│  TEST-FRONTEND          │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  BUILD-AND-PUSH         │  ✓ Build & push GHCR
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  DEPLOY (SSH)           │  ✓ SSH → VPS → docker-compose up
└─────────────────────────┘
```

### 3. `nginx/default.conf` → Config web (corrigée ✨)

**Avant** ❌: Proxy nginx → frontend container (inefficace)  
**Maintenant** ✅: Nginx sert directement les fichiers React statiques

```nginx
location / {
    root /usr/share/nginx/html;  # ← Frontend React compilé
    try_files $uri $uri/ /index.html;  # ← Support React Router
}

location /api/ {
    proxy_pass http://backend:5000/api/;  # ← Reverse proxy API
}
```

### 4. `docs/DEPLOY.md` → Guide complet

Document de 400+ lignes avec:
- Architecture détaillée
- Setup step-by-step du VPS
- Configuration GitHub Secrets
- Troubleshooting courant
- Commandes de monitoring

**À lire absolument avant de déployer !**

### 5. `scripts/deploy-init.sh` → Setup automatisé

Le script fait :
- ✅ Install Docker & Docker Compose
- ✅ Crée `/opt/funtoa` avec structure
- ✅ Initialise le dépôt Git
- ✅ Génère `.env` avec secrets sécurisés
- ✅ Teste la config docker-compose

**Usage** :
```bash
bash scripts/deploy-init.sh
```

### 6. `scripts/debug.sh` → Outil de dépannage

Commandes rapides pour le VPS :

```bash
bash scripts/debug.sh status    # État des conteneurs
bash scripts/debug.sh logs      # Logs en direct
bash scripts/debug.sh health    # Health checks
bash scripts/debug.sh stats     # CPU/RAM/Disque
bash scripts/debug.sh restart   # Redémarrer
bash scripts/debug.sh clean     # Nettoyer les images
```

---

## 📊 Architecture complète

```
┌────────────────────────────────────────────────────────────────┐
│  GitHub (ilo-CS/funtoasmie)                                    │
├────────────────────────────────────────────────────────────────┤
│  Trigger: push main → Actions → deploy.yml workflow            │
└──────────────────────┬─────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    ┌────────┐  ┌────────┐  ┌──────────────┐
    │ Validate │ │ Test    │  │ Build & Push │
    │Dockerfiles│ │ Jest   │  │ to GHCR      │
    └────────┘  └────────┘  └──────────────┘
                                    │
                                    ↓
                    (ghcr.io/ilo-cs/funtoa-*)
                                    │
                                    ↓
        ┌───────────────────────────────────┐
        │ SSH Deployment (appleboy action)  │
        └───────────────────────────────────┘
                        │
                        ↓
    ┌─────────────────────────────────────────┐
    │  VPS (37.59.118.164)                   │
    ├─────────────────────────────────────────┤
    │  /opt/funtoa/                          │
    │  ├─ docker-compose.prod.yml            │
    │  ├─ .env (généré)                      │
    │  └─ frontend/nginx/default.conf        │
    │                                         │
    │  ┌─────────────────────────────────┐   │
    │  │  Docker Compose Stack           │   │
    │  ├─────────────────────────────────┤   │
    │  │  🟢 nginx:1.27 (port 80)       │   │
    │  │  🔵 backend:latest (port 5000) │   │
    │  │  🟡 mysql:10.4 (port 3306)    │   │
    │  │  🟢 frontend:latest (port 80)  │   │
    │  └─────────────────────────────────┘   │
    └─────────────────────────────────────────┘
                        ↓
                ✅ Application live!
```

---

## 🔐 Sécurité

### Secrets sensibles

- ✅ `JWT_SECRET` : Généré avec `openssl rand -hex 32`
- ✅ `DB_PASSWORD` : Généré avec `openssl rand -base64 32`
- ✅ `SSH_PK` : Clé privée SSH (jamais commitée)
- ✅ `.env` : Fichier local, dans `.gitignore`

### Recommandations

1. **Ne JAMAIS commiter `.env`** → Dans `.gitignore` ✅
2. **Rotez les secrets** tous les 3 mois
3. **Utilisez HTTPS en production** (ajouter Let's Encrypt)
4. **Limiter les accès SSH** (fail2ban, whitelist IP)

---

## 🧪 Test local avant production

```bash
# Tester localement (sans VPS)
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up

# Vérifier
curl http://localhost/health
curl http://localhost/api/auth/login -X POST
```

---

## 📞 Dépannage courant

### ❌ Erreur: "Nginx 502 Bad Gateway"
```bash
ssh deploy@37.59.118.164
cd /opt/funtoa
bash scripts/debug.sh logs nginx
bash scripts/debug.sh restart backend
```

### ❌ Erreur: "Cannot pull image from GHCR"
- Vérifier `GHCR_TOKEN` dans GitHub Secrets
- Vérifier le token n'a pas expiré
- Relancer le workflow

### ❌ Erreur: "Database connection refused"
```bash
cd /opt/funtoa
bash scripts/debug.sh restart mysql
sleep 10
bash scripts/debug.sh health
```

**Pour l'aide complète → voir `docs/DEPLOY.md`**

---

## ✅ Checklist avant production

- [ ] Secrets GitHub configurés (6+ secrets)
- [ ] VPS préparé avec `deploy-init.sh`
- [ ] `.env.example` validé
- [ ] Tests locaux passent
- [ ] Premier push sur `main` déclenche le workflow
- [ ] Workflow réussit (tous les jobs verts ✅)
- [ ] VPS accessible avec `bash scripts/debug.sh status`
- [ ] Health checks passent
- [ ] Frontend charge (`http://37.59.118.164`)
- [ ] API répond (`http://37.59.118.164/api/...`)

---

## 📖 Documentation complète

Pour plus de détails :
- **`docs/DEPLOY.md`** - Guide complet avec architecture, secrets, troubleshooting
- **`scripts/debug.sh help`** - Aide des commandes de dépannage
- **`.github/workflows/deploy.yml`** - Voir les étapes du workflow

---

## 🎯 Prochaines étapes

1. **Lisez `docs/DEPLOY.md`** entièrement (important!)
2. **Configurez les GitHub Secrets** (6 secrets minimum)
3. **Préparez le VPS** : `bash scripts/deploy-init.sh`
4. **Testez localement** : `docker-compose -f docker-compose.prod.yml up`
5. **Push sur main** pour déclencher le workflow
6. **Monitorer** avec `bash scripts/debug.sh`

---

**Statut**: ✅ Production Ready  
**Date**: 29/11/2025  
**Maintainers**: ilo-CS Team
