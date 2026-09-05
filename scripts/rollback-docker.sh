#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/passportJs_auth}"
STATE_DIR="${STATE_DIR:-/var/lib/passport-auth-deploy}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1/health}"

cd "$APP_DIR"

if [[ ! -f "$STATE_DIR/previous_sha" ]]; then
  echo "No previous deployment SHA found."
  exit 1
fi

TARGET_SHA="$(cat "$STATE_DIR/previous_sha")"
echo "Rolling back to $TARGET_SHA..."

git fetch --prune origin master
git reset --hard "$TARGET_SHA"
docker compose up -d --build --remove-orphans

for i in $(seq 1 12); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "Rollback successful."
    docker compose ps
    exit 0
  fi
  sleep 5
done

docker compose ps
docker compose logs --tail=100
exit 1
