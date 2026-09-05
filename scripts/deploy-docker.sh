#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/passportJs_auth}"
BRANCH="${BRANCH:-master}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-24}"
HEALTH_DELAY="${HEALTH_DELAY:-5}"
STATE_DIR="${STATE_DIR:-/var/lib/passport-auth-deploy}"
LOCK_FILE="${LOCK_FILE:-/var/lock/passport-auth-deploy.lock}"

mkdir -p "$STATE_DIR"
exec 9>"$LOCK_FILE"
flock -n 9 || { echo "Another deployment is already running."; exit 1; }

cd "$APP_DIR"

previous_sha="$(git rev-parse HEAD)"
git fetch --prune origin "$BRANCH"
new_sha="$(git rev-parse "origin/$BRANCH")"

rollback() {
  echo "Deployment failed. Rolling back to $previous_sha..."
  git reset --hard "$previous_sha" || true
  if [[ -f .env ]]; then chmod 600 .env; fi
  docker compose up -d --build --remove-orphans || true

  for i in $(seq 1 12); do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      echo "Rollback successful."
      printf '%s\n' "$previous_sha" > "$STATE_DIR/current_sha"
      return 0
    fi
    sleep 5
  done

  echo "Rollback attempted but application is still unhealthy."
  docker compose ps || true
  docker compose logs --tail=100 || true
  return 1
}

trap 'rollback' ERR

git reset --hard "$new_sha"

if [[ ! -f .env ]]; then
  echo "ERROR: $APP_DIR/.env is missing."
  exit 1
fi
chmod 600 .env

docker compose build --pull
docker compose up -d --remove-orphans

printf '%s\n' "$previous_sha" > "$STATE_DIR/previous_sha"
printf '%s\n' "$new_sha" > "$STATE_DIR/current_sha"

echo "Waiting for application health..."
for i in $(seq 1 "$HEALTH_RETRIES"); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "Deployment successful: $new_sha"
    docker compose ps
    trap - ERR
    exit 0
  fi
  echo "Health check $i/$HEALTH_RETRIES failed; retrying in ${HEALTH_DELAY}s..."
  sleep "$HEALTH_DELAY"
done

echo "Application failed health check."
docker compose ps
docker compose logs --tail=100
exit 1
