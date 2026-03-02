#!/usr/bin/env bash

set -euo pipefail

PORT="${1:-3001}"
HOST="${2:-0.0.0.0}"

if PIDS="$(lsof -ti tcp:${PORT} 2>/dev/null || true)"; [ -n "${PIDS}" ]; then
  echo "[dev:calculator] Releasing occupied port ${PORT}: ${PIDS}"
  kill ${PIDS} || true
  sleep 1
fi

exec npm --prefix ./ai-calculator run dev -- --hostname "${HOST}" -p "${PORT}"
