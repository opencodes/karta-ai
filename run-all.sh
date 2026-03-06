#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

UI_PORT=3000
WEB_PORT=4000
BACKEND_PORT=8000

PIDS=()

cleanup() {
  echo
  echo "Stopping all services..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait || true
}

trap cleanup INT TERM EXIT

echo "Starting UI on http://localhost:${UI_PORT}"
(
  cd "$ROOT_DIR/ui"
  npm run dev -- --port="$UI_PORT" --host=0.0.0.0
) &
PIDS+=("$!")

echo "Starting Web on http://localhost:${WEB_PORT}"
(
  cd "$ROOT_DIR/web"
  npm run dev -- --port="$WEB_PORT" --host=0.0.0.0
) &
PIDS+=("$!")

echo "Starting Backend on http://localhost:${BACKEND_PORT}"
(
  cd "$ROOT_DIR/backend"
  PORT="$BACKEND_PORT" npm run dev
) &
PIDS+=("$!")

echo
printf 'Services started:\n'
printf '  - UI:      http://localhost:%s\n' "$UI_PORT"
printf '  - Web:     http://localhost:%s\n' "$WEB_PORT"
printf '  - Backend: http://localhost:%s\n' "$BACKEND_PORT"
echo "Press Ctrl+C to stop all services."

wait
