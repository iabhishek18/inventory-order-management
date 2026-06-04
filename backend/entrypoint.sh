#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
alembic upgrade head

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Running seed script..."
  python -m scripts.seed || echo "[entrypoint] Seed failed or already applied; continuing."
fi

echo "[entrypoint] Starting application: $*"
exec "$@"
