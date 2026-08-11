#!/usr/bin/env bash
# One-shot migrate + seed against the alexandre_internal network.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
set -a
# shellcheck disable=SC1091
source .env
set +a

NET="$(docker network ls --format '{{.Name}}' | grep -E '^alexandre_alexandre_internal$' || true)"
if [[ -z "$NET" ]]; then
  echo "Network alexandre_alexandre_internal not found. Deploy the stack first."
  exit 1
fi

echo "Running prisma migrate deploy..."
docker run --rm \
  --network "$NET" \
  -e DATABASE_URL \
  -e CONTENT_PATH=/content/aulas-conteudo.json \
  alexandre-web:latest \
  npx prisma migrate deploy

echo "Running prisma db seed..."
docker run --rm \
  --network "$NET" \
  -e DATABASE_URL \
  -e CONTENT_PATH=/content/aulas-conteudo.json \
  alexandre-web:latest \
  npx tsx prisma/seed.ts

echo "DB ready."
