#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/passportJs_auth}"
REPO_URL="${REPO_URL:-https://github.com/salmasumona/passportJs_auth.git}"
BRANCH="${BRANCH:-master}"
DEPLOY_USER="${DEPLOY_USER:-${SUDO_USER:-ubuntu}}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo: sudo bash scripts/setup-ec2-docker.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

install_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y ca-certificates curl git
    if apt-cache show docker.io >/dev/null 2>&1; then
      apt-get install -y docker.io
    fi
    if ! command -v docker >/dev/null 2>&1; then
      curl -fsSL https://get.docker.com | sh
    fi
    if ! docker compose version >/dev/null 2>&1; then
      apt-get install -y docker-compose-plugin 2>/dev/null || true
    fi
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y docker git curl
  elif command -v yum >/dev/null 2>&1; then
    yum install -y docker git curl
  else
    echo "Unsupported Linux distribution."
    exit 1
  fi
}

install_packages

systemctl enable docker
systemctl start docker

if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) COMPOSE_ARCH="x86_64" ;;
    aarch64|arm64) COMPOSE_ARCH="aarch64" ;;
    *) echo "Unsupported CPU architecture: $ARCH"; exit 1 ;;
  esac
  COMPOSE_VERSION="${COMPOSE_VERSION:-v2.39.2}"
  curl -fL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-${COMPOSE_ARCH}" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

id "$DEPLOY_USER" >/dev/null 2>&1 || true
usermod -aG docker "$DEPLOY_USER" 2>/dev/null || true

mkdir -p "$(dirname "$APP_DIR")"
if [[ ! -d "$APP_DIR/.git" ]]; then
  rm -rf "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" fetch --prune origin "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
fi

chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR"

if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env.production.example" "$APP_DIR/.env"
  chown "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  echo
  echo "Created $APP_DIR/.env"
  echo "CI/CD will overwrite it when GitHub Secrets are configured."
fi

echo
echo "Docker:"
docker --version
docker compose version
echo
echo "EC2 Docker setup complete."
echo "IMPORTANT: log out/in once so $DEPLOY_USER receives Docker group membership."
echo "The CI/CD workflow will run: docker compose up -d --build"
