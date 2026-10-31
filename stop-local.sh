#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "Stopping backend application if it is running..."
BACKEND_PIDS=$(ps aux | grep -E "spring-boot:run|org.springframework.boot.loader.launch.JarLauncher|signalops-ai-backend" | grep -v grep | awk '{print $2}')
if [ -n "$BACKEND_PIDS" ]; then
  for pid in $BACKEND_PIDS; do
    echo "Stopping backend process $pid"
    kill "$pid" || true
  done
  sleep 2
fi

echo "Stopping PostgreSQL container..."
if docker compose -f "$BACKEND_DIR/docker-compose.yml" ps >/dev/null 2>&1; then
  docker compose -f "$BACKEND_DIR/docker-compose.yml" down
else
  echo "Docker Compose stack is not running or Docker is unavailable."
fi

echo "Checking for any remaining PostgreSQL listener on port 5432..."
PORT_PIDS=$(lsof -nP -iTCP:5432 -sTCP:LISTEN 2>/dev/null | awk 'NR>1 {print $2}' | sort -u || true)
if [ -n "$PORT_PIDS" ]; then
  for pid in $PORT_PIDS; do
    echo "Stopping local PostgreSQL process $pid"
    kill "$pid" || true
  done
fi

echo "Services stopped."
