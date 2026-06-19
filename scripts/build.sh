#!/usr/bin/env bash
# Package the BFF jar (runs tests) and build the frontend static bundle.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== BFF: ./mvnw clean package =="
( cd "$DIR/bff" && ./mvnw -B clean package )

echo "== Frontend: npm run build =="
( cd "$DIR/frontend" && npm install --no-fund --no-audit && npm run build )

echo "== Artifacts =="
ls -1 "$DIR"/bff/target/system-design-lab-bff-*.jar
echo "frontend bundle: $DIR/frontend/dist"
