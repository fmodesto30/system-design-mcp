#!/usr/bin/env bash
# Start the BFF (background) and the frontend dev server (foreground).
# On AV-restricted Windows, JAVA_TOOL_OPTIONS forces TCP (see docs/runbook.md).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:--Djdk.net.unixdomain.tmpdir=Z:\\nope}"

echo "== Starting BFF on :8080 =="
( cd "$DIR/bff" && ./mvnw -q spring-boot:run ) &
BFF_PID=$!
trap 'echo "stopping BFF ($BFF_PID)"; kill $BFF_PID 2>/dev/null || true' EXIT

echo "Waiting for BFF health..."
for _ in $(seq 1 40); do
  if curl -fsS http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "BFF is up."
    break
  fi
  sleep 2
done

echo "== Starting frontend on :5173 =="
( cd "$DIR/frontend" && npm install --no-fund --no-audit && npm run dev )
