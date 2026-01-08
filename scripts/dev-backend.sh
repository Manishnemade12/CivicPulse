#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

COMPOSE_FILE="${ROOT_DIR}/infra/docker-compose.yml"
POSTGRES_CONTAINER="civicpulse-postgres"

RESET_DB=0

usage() {
  cat <<'EOF'
Usage:
  scripts/dev-backend.sh [--reset-db]

What it does:
  - Starts local Postgres (Docker Compose)
  - Ensures Phase-01 schema + seed exist
  - Runs Spring Boot backend (foreground)

Options:
  --reset-db   Drop the local Postgres Docker volume and recreate it (ERASES local DB data)

Examples:
  ./scripts/dev-backend.sh
  ./scripts/dev-backend.sh --reset-db
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reset-db)
      RESET_DB=1
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require docker

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin not available. Install Docker Compose v2 (docker compose)." >&2
  exit 1
fi

cd "${ROOT_DIR}"

echo "[1/3] Starting Postgres (Docker)..."

docker compose -f "${COMPOSE_FILE}" up -d

wait_for_postgres() {
  local max_seconds=30
  local start
  start="$(date +%s)"

  while true; do
    if docker exec "${POSTGRES_CONTAINER}" pg_isready -U civicpulse -d civicpulse >/dev/null 2>&1; then
      return 0
    fi

    local now
    now="$(date +%s)"
    if (( now - start >= max_seconds )); then
      echo "Postgres did not become ready within ${max_seconds}s." >&2
      echo "Try: docker logs ${POSTGRES_CONTAINER} --tail=200" >&2
      return 1
    fi

    sleep 1
  done
}

wait_for_postgres

if (( RESET_DB == 1 )); then
  echo "[2/3] Resetting local DB volume (down -v)..."
  docker compose -f "${COMPOSE_FILE}" down -v
  docker compose -f "${COMPOSE_FILE}" up -d
  wait_for_postgres
else
  echo "[2/3] Checking schema..."
  HAS_USERS_TABLE="$(docker exec -i "${POSTGRES_CONTAINER}" psql -U civicpulse -d civicpulse -tAc "select to_regclass('public.users') is not null;")"
  if [[ "${HAS_USERS_TABLE}" != "t" ]]; then
    echo "Schema not found. Recreating DB volume so init scripts apply schema + seed..."
    docker compose -f "${COMPOSE_FILE}" down -v
    docker compose -f "${COMPOSE_FILE}" up -d
    wait_for_postgres
  fi
fi

echo "[3/3] Starting backend (Spring Boot)..."
cd "${ROOT_DIR}/backend/api"

# Defaults match local docker-compose
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5433}"
export DB_NAME="${DB_NAME:-civicpulse}"
export DB_USER="${DB_USER:-civicpulse}"
export DB_PASSWORD="${DB_PASSWORD:-civicpulse}"

./mvnw spring-boot:run
