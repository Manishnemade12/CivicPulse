#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/infra/docker-compose.yml"

usage() {
  cat <<'EOF'
Usage:
  scripts/stop-backend.sh

What it does:
  - Stops local Postgres started via Docker Compose (keeps data volume)

Note:
  - This does NOT stop a Spring Boot process you started in another terminal.
    Stop that with Ctrl+C in the terminal running ./mvnw spring-boot:run.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Missing required command: docker" >&2
  exit 1
fi

cd "${ROOT_DIR}"

echo "Stopping Postgres (Docker Compose)..."
docker compose -f "${COMPOSE_FILE}" down
