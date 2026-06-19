#!/usr/bin/env bash
# Run the BFF test suite (unit + contract + knowledge-base integrity) and the frontend type-check/build.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== BFF: ./mvnw test =="
( cd "$DIR/bff" && ./mvnw -B test )

echo "== Frontend: type-check + build =="
( cd "$DIR/frontend" && npm install --no-fund --no-audit && npm run build )

echo "== OK =="
