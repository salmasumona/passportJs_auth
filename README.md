# Passport Auth — MongoDB Atlas + AWS EC2 + NGINX + GitHub Actions

Express + Passport Local authentication application with MongoDB Atlas, production environment variables, PM2, NGINX and GitHub Actions deployment.

## 1. Local development

Requirements: Node.js 20+.

```bash
npm install
cp .env.example .env
```

Set `MONGO_URI` to your MongoDB Atlas connection string and create a strong `SESSION_SECRET` (32+ characters).

```bash
npm run check
npm start
```

Open `http://localhost:1800`.

## 2. MongoDB Atlas

In Atlas:

1. Create a cluster.
2. Create a database user.
3. Add your development IP under Network Access.
4. Copy the Node.js `mongodb+srv://` URI.
5. Put it in `.env` as `MONGO_URI`.

The application does not print the URI or database password to logs.

## 3. AWS EC2

Recommended: Ubuntu 22.04/24.04.

Open the EC2 security group for:

- SSH 22 — your IP only
- HTTP 80 — `0.0.0.0/0`
- HTTPS 443 — `0.0.0.0/0`

SSH to EC2 and run:

```bash
sudo apt-get update
sudo apt-get install -y git
mkdir -p ~/passportJs_auth-setup
cd ~/passportJs_auth-setup
git clone https://github.com/salmasumona/passportJs_auth.git .
sudo bash scripts/setup-ec2.sh
```

Then edit:

```bash
sudo nano /var/www/passportJs_auth/.env
```

Production example:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/authPassport?retryWrites=true&w=majority
PORT=1800
APP_URL=https://YOUR_DOMAIN
SESSION_SECRET=use-a-random-secret-at-least-32-characters
NODE_ENV=production
```

Start the app:

```bash
cd /var/www/passportJs_auth
./scripts/deploy.sh
```

## 4. NGINX + HTTPS

Point your DNS A record to the EC2 Elastic IP.

Edit `/etc/nginx/sites-available/passport-auth` and replace `YOUR_DOMAIN` with your real domain. Test:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Then obtain a certificate:

```bash
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

After HTTPS is enabled, the Node app stays private on `127.0.0.1:1800` and NGINX handles public HTTP/HTTPS traffic.

## 5. GitHub Actions CI/CD

Add these repository secrets in GitHub: Settings → Secrets and variables → Actions.

- `EC2_HOST` — EC2 Elastic IP or hostname
- `EC2_USER` — usually `ubuntu`
- `EC2_SSH_KEY` — the private SSH key used for EC2
- `EC2_PORT` — optional, defaults to 22

The workflow runs on pushes to `master`:

1. Checkout
2. Node.js 20 setup
3. `npm ci`
4. Syntax check
5. SSH to EC2
6. Pull latest `master`
7. Install production dependencies
8. Restart PM2
9. Check `/health`

MongoDB credentials and the session secret are intentionally NOT stored in GitHub source code. Keep them in `/var/www/passportJs_auth/.env` on EC2.

## Architecture

```text
Internet
   |
   v
NGINX :80/:443
   |
   v
Node.js + Express + Passport
   |
   v
Mongoose
   |
   v
MongoDB Atlas
```

## Useful commands

```bash
pm2 status
pm2 logs passport-auth
pm2 restart passport-auth --update-env
curl http://127.0.0.1:1800/health
sudo nginx -t
sudo systemctl status nginx
```

## Phase 1 Improvements

This version includes:
- Security response headers without adding a runtime security dependency.
- Authentication endpoint rate limiting (30 requests per IP per 15 minutes).
- Server-side registration/login input validation and normalization.
- Structured JSON application logging.
- Node.js built-in automated tests (`npm test`).
- CI runs syntax checks and tests before deployment.
- Deployment health check retries for up to 60 seconds and prints PM2 logs when it fails.

### Phase 1 validation
Run locally:
```bash
npm ci
npm run check
npm test
```

### Production note
The in-memory rate limiter and Express session store are process-local. They are suitable for a single EC2 learning/demo server, but for multiple instances use a shared rate-limit/session store such as Redis or another persistent store.
