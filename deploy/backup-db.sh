#!/usr/bin/env bash
# Daily Postgres backup — run from cron on the VPS.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
set -a
# shellcheck disable=SC1091
source .env
set +a

BACKUP_DIR="$ROOT/backups"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
FILE="$BACKUP_DIR/jornada_ewm_${STAMP}.sql.gz"

NET="$(docker network ls --format '{{.Name}}' | grep -E '^alexandre_alexandre_internal$' || true)"
if [[ -z "$NET" ]]; then
  echo "Stack network not found."
  exit 1
fi

docker run --rm \
  --network "$NET" \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  postgres:17 \
  pg_dump -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$FILE"

find "$BACKUP_DIR" -name 'jornada_ewm_*.sql.gz' -mtime +14 -delete
echo "Backup: $FILE"
