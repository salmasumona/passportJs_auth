#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/passportJs_auth}"
STATE_DIR="${STATE_DIR:-/var/lib/passport-auth-deploy}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:1800/health}"

cd "$APP_DIR"

TARGET_SHA="${1:-}"
if [[ -z "$TARGET_SHA" && -f "$STATE_DIR/previous_sha" ]]; then
  TARGET_SHA="$(cat "$STATE_DIR/previous_sha")"
fi

if [[ -z "$TARGET_SHA" ]]; then
  echo "Usage: $0 <git-sha>"
  echo "Or deploy at least once so previous_sha is recorded."
  exit 1
fi

git fetch --prune origin
if ! git cat-file -e "${TARGET_SHA}^{commit}" 2>/dev/null; then
  echo "Commit $TARGET_SHA is not available locally."
  exit 1
fi

git reset --hard "$TARGET_SHA"
npm install --omit=dev
chmod 600 .env
pm2 startOrRestart ecosystem.config.js --update-env
pm2 save

for i in $(seq 1 12); do
  if curl -fsS "$HEALTH_URL"; then
    echo
    echo "Rollback successful: $TARGET_SHA"
    printf '%s\n' "$TARGET_SHA" > "$STATE_DIR/current_sha"
    exit 0
  fi
  sleep 5
done

echo "Rollback health check failed."
pm2 status
pm2 logs passport-auth --lines 100 --nostream
exit 1
