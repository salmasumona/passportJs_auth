#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/passportJs_auth}"
BRANCH="${BRANCH:-master}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:1800/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-12}"
HEALTH_DELAY="${HEALTH_DELAY:-5}"
STATE_DIR="${STATE_DIR:-/var/lib/passport-auth-deploy}"
LOCK_FILE="${LOCK_FILE:-/var/lock/passport-auth-deploy.lock}"

mkdir -p "$STATE_DIR"
exec 9>"$LOCK_FILE"
flock -n 9 || { echo "Another deployment is already running."; exit 1; }

cd "$APP_DIR"

previous_sha="$(git rev-parse HEAD)"

echo "Fetching origin/$BRANCH..."
git fetch --prune origin "$BRANCH"
new_sha="$(git rev-parse "origin/$BRANCH")"

echo "Deploying $new_sha (previous: $previous_sha)"
printf '%s\n' "$previous_sha" > "$STATE_DIR/previous_sha"
printf '%s\n' "$new_sha" > "$STATE_DIR/current_sha"

rollback() {
  echo "Deployment failed. Rolling back to $previous_sha..."
  git reset --hard "$previous_sha" || true
  if [[ -f .env ]]; then chmod 600 .env; fi
  npm install --omit=dev || true
  pm2 startOrRestart ecosystem.config.js --update-env || true
  pm2 save || true
  for i in $(seq 1 6); do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      echo "Rollback successful. Application is healthy on $previous_sha."
      printf '%s\n' "$previous_sha" > "$STATE_DIR/current_sha"
      return 0
    fi
    sleep 5
  done
  echo "Rollback completed but health check is still failing."
  pm2 status || true
  pm2 logs passport-auth --lines 100 --nostream || true
  return 1
}

trap 'rollback' ERR

git reset --hard "$new_sha"

if [[ ! -f .env ]]; then
  echo "ERROR: $APP_DIR/.env is missing."
  exit 1
fi
chmod 600 .env

npm install --omit=dev
pm2 startOrRestart ecosystem.config.js --update-env
pm2 save

echo "Waiting for application health..."
for i in $(seq 1 "$HEALTH_RETRIES"); do
  if curl -fsS "$HEALTH_URL"; then
    echo
    echo "Deployment successful: $new_sha"
    trap - ERR
    exit 0
  fi
  echo "Health check attempt $i/$HEALTH_RETRIES failed; retrying in ${HEALTH_DELAY}s..."
  sleep "$HEALTH_DELAY"
done

echo "Application failed health check."
pm2 status
pm2 logs passport-auth --lines 100 --nostream
exit 1
