#!/usr/bin/env bash

set -euo pipefail

PORT="${1:-4000}"

if PIDS="$(lsof -ti tcp:${PORT} 2>/dev/null || true)"; [ -n "${PIDS}" ]; then
  echo "[dev:server] Releasing occupied port ${PORT}: ${PIDS}"
  kill ${PIDS} || true
  sleep 1
fi

exec npm --prefix ./server run dev
