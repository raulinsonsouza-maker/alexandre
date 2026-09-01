#!/usr/bin/env bash
# Bootstrap / redeploy — bestoneacademy.com.br (Easypanel + Traefik)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing $ROOT/.env — copy deploy/.env.bestone.example and fill secrets."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

NET="${TRAEFIK_NETWORK:-easypanel}"
if ! docker network ls --format '{{.Name}}' | grep -qx "$NET"; then
  echo "Traefik network '$NET' not found. Is Easypanel Traefik running?"
  exit 1
fi

mkdir -p data/media data/uploads backups

echo "Building alexandre-web:latest..."
docker build \
  --build-arg "NEXT_PUBLIC_CAKTO_CLIENT_ID=${NEXT_PUBLIC_CAKTO_CLIENT_ID:-}" \
  --build-arg "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=${NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY:-}" \
  -t alexandre-web:latest \
  -f web/Dockerfile .

echo "Deploying stack..."
docker stack deploy -c deploy/stack.yml alexandre

echo "Forcing web service update (tag :latest)..."
docker service update --force alexandre_web

echo "Waiting for web task..."
sleep 15
docker service ps alexandre_web --no-trunc | head -5

if [[ "${SKIP_MIGRATE:-}" != "1" ]]; then
  "$ROOT/deploy/migrate-seed.sh"
fi

echo "Done. Site: https://${PUBLIC_HOST:-bestoneacademy.com.br}"
