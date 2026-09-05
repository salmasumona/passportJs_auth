# Automated CI/CD — Docker + NGINX + AWS EC2

## Architecture

Internet → EC2 :80 → NGINX container :80 → Node.js container :1800 → MongoDB Atlas

## What is automated?

1. GitHub push to `master`
2. GitHub Actions checks out code
3. Node.js 20 installed on the runner
4. `npm install`
5. Syntax check
6. Unit tests
7. SSH to EC2
8. EC2 automatically installs Docker + Git + Docker Compose if missing
9. Repository is updated
10. Production `.env` is generated from GitHub Secrets
11. Docker image is rebuilt
12. Containers start with Docker Compose
13. `/health` is checked
14. If deployment fails, the previous Git commit is restored and containers are rebuilt
15. NGINX is publicly exposed on port 80

## One-time EC2 setup

SSH into the EC2 instance:

```bash
cd /var/www
sudo git clone --branch master https://github.com/salmasumona/passportJs_auth.git passportJs_auth
cd passportJs_auth
sudo bash scripts/setup-ec2-docker.sh
```

Then log out and log in once.

The GitHub Actions workflow can also install Docker automatically during the first deployment.

## AWS Security Group

Allow inbound:

- TCP 22 — your IP only
- TCP 80 — `0.0.0.0/0`

Do not expose port 1800 publicly in production. The app is reachable only through the NGINX container.

## GitHub Secrets

Repository → Settings → Secrets and variables → Actions:

```text
EC2_HOST       = EC2 public IP or DNS
EC2_USER       = ubuntu (Ubuntu) or ec2-user (Amazon Linux)
EC2_SSH_KEY    = private SSH key contents
EC2_PORT       = 22
MONGO_URI      = MongoDB Atlas connection string
JWT_SECRET     = random secret, at least 32 characters
JWT_EXPIRES_IN = 1h
APP_URL        = http://YOUR_EC2_PUBLIC_IP
```

For production HTTPS, set `APP_URL` to your HTTPS domain after configuring TLS.

## First deployment

Push to `master`:

```bash
git add .
git commit -m "Add automated Docker CI/CD"
git push origin master
```

GitHub Actions will run CI first and deploy only when CI passes.

## Useful EC2 commands

```bash
cd /var/www/passportJs_auth

docker compose ps
docker compose logs -f
docker compose logs nginx --tail=100
docker compose logs app --tail=100

curl http://127.0.0.1/health
curl http://127.0.0.1:1800/health

bash scripts/rollback-docker.sh
```

## Important

The workflow stores the production secrets only in GitHub Secrets and writes them to `.env` on EC2 with mode `600`. Never commit `.env` to Git.
