#!/usr/bin/env bash

set -euo pipefail

PORT="${1:-5173}"
HOST="${2:-0.0.0.0}"

if PIDS="$(lsof -ti tcp:${PORT} 2>/dev/null || true)"; [ -n "${PIDS}" ]; then
  echo "[dev:dashboard] Releasing occupied port ${PORT}: ${PIDS}"
  kill ${PIDS} || true
  sleep 1
fi

exec vite --host "${HOST}" --port "${PORT}" --strictPort
