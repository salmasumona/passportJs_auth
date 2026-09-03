#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/passportJs_auth}"
BRANCH="${BRANCH:-master}"

cd "$APP_DIR"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
npm ci --omit=dev

if [[ ! -f .env ]]; then
  echo "ERROR: $APP_DIR/.env is missing. Create it with MONGO_URI and SESSION_SECRET."
  exit 1
fi

chmod 600 .env
pm2 startOrRestart ecosystem.config.js --update-env
pm2 save
sleep 2
curl -fsS http://127.0.0.1:1800/health
printf '\nDeployment successful.\n'
