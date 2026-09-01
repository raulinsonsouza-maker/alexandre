#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ ! -f .env ]]; then
  echo "Missing $ROOT/.env — copy deploy/.env.example and fill secrets."
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env
set +a
docker stack deploy -c deploy/stack.yml alexandre
docker service update --force alexandre_web 2>/dev/null || true
echo "Stack alexandre deployed. Check: docker service ls | grep alexandre"
