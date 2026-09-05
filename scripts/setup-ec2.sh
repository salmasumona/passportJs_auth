#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/passportJs_auth"
REPO_URL="https://github.com/salmasumona/passportJs_auth.git"
BRANCH="master"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo: sudo bash scripts/setup-ec2.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx git curl certbot python3-certbot-nginx rsync

if ! command -v node >/dev/null 2>&1 || ! node --version | grep -q '^v20\|^v22\|^v24'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

npm install -g pm2
mkdir -p "$APP_DIR"
chown -R "${SUDO_USER:-ubuntu}:${SUDO_USER:-ubuntu}" /var/www

if [[ ! -d "$APP_DIR/.git" ]]; then
  rm -rf "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
fi

cd "$APP_DIR"
npm ci --omit=dev

mkdir -p /var/www/certbot
cp deploy/nginx/passport-auth.conf /etc/nginx/sites-available/passport-auth
ln -sf /etc/nginx/sites-available/passport-auth /etc/nginx/sites-enabled/passport-auth
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  chown "${SUDO_USER:-ubuntu}:${SUDO_USER:-ubuntu}" "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  echo "Created $APP_DIR/.env. Fill in MongoDB Atlas and SESSION_SECRET before starting the app."
fi

pm2 startup systemd -u "${SUDO_USER:-ubuntu}" --hp "/home/${SUDO_USER:-ubuntu}" | tail -n 1 || true

echo "EC2 base setup complete. Configure .env and then run scripts/deploy.sh."
