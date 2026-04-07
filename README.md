# Earning Platform - MERN Stack SaaS

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB 7
- **Proxy:** Nginx
- **Deployment:** Docker + Docker Compose + GitHub Actions

---

## Quick Start (Local Development)

```bash
# 1. Clone repo
git clone git@github.com:YOUR_USERNAME/earning-platform.git
cd earning-platform

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Run with Docker
docker compose up -d --build

# 4. Open browser
# http://localhost
```

---

## Production Deployment (VPS)

### Step 1: Setup VPS
```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
apt install docker-compose-plugin -y
```

### Step 2: Clone and Configure
```bash
# Clone your PRIVATE repo
git clone git@github.com:YOUR_USERNAME/earning-platform.git /root/earning-platform
cd /root/earning-platform

# Create .env from template
cp .env.example .env
nano .env
# Fill in STRONG passwords and secrets
```

### Step 3: Deploy
```bash
docker compose up -d --build
```

### Step 4: Setup SSL (HTTPS)
```bash
apt install certbot -y
certbot certonly --standalone -d yourdomain.com
# Then update nginx config to use SSL certificates
```

---

## GitHub Actions (Auto-Deploy)

On every push to `main`, the app auto-deploys to your VPS.

### Required GitHub Secrets
Go to: **GitHub Repo > Settings > Secrets and variables > Actions**

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Your VPS IP (e.g., `31.97.119.223`) |
| `VPS_USERNAME` | `root` |
| `VPS_SSH_KEY` | Your SSH private key (full content) |
| `VPS_PORT` | `22` |

### Generate SSH Key for GitHub Actions
```bash
# On your VPS
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Copy PRIVATE key content - paste this in GitHub Secret VPS_SSH_KEY
cat ~/.ssh/github_actions
```

---

## Useful Commands

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs -f
docker compose logs backend -f

# Restart everything
docker compose restart

# Rebuild after code changes
docker compose up -d --build

# Stop everything
docker compose down

# MongoDB shell
docker exec -it ep-mongodb mongosh -u admin -p YOUR_PASSWORD

# Backup MongoDB
docker exec ep-mongodb mongodump --uri="mongodb://admin:PASSWORD@localhost:27017/earning-platform?authSource=admin" --out=/backup/$(date +%Y%m%d)
```

---

## Project Structure

```
earning-platform/
├── .github/workflows/deploy.yml   # CI/CD auto-deploy
├── client/                        # React frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── server/                        # Express backend
│   ├── Dockerfile
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── nginx/
│   └── default.conf               # Reverse proxy config
├── docker-compose.yml
├── .env.example
├── .gitignore
└── .dockerignore
```

---

## Default Admin Login
- Email: Set in `.env` as `ADMIN_EMAIL`
- Password: Set in `.env` as `ADMIN_PASSWORD`
