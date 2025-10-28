#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

pushd "$ROOT_DIR" >/dev/null
npm install
npm run -w backend prisma:generate || true
popd >/dev/null

echo "Setup complete. Use npm run dev:* scripts to start services."