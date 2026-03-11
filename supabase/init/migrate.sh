#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# ZiiiPos — Migration Runner
# Runs on every `docker compose up`. Applies only pending migrations and seeds.
# Progress is tracked in public.schema_migrations so nothing runs twice.
# ─────────────────────────────────────────────────────────────────────────────
set -eu

DB_ADMIN_USER="${SUPABASE_DB_ADMIN_USER:-supabase_admin}"
MIGRATIONS_DIR="/migrations"
SEED_DIR="/seed"
DB_URL="postgresql://${DB_ADMIN_USER}:${POSTGRES_PASSWORD}@db:5432/postgres"

echo "╔══════════════════════════════════════════════╗"
echo "║       ZiiiPos — Migration Runner             ║"
echo "╚══════════════════════════════════════════════╝"

# 1. Ensure tracking table exists
echo ""
echo "→ Inicializando tabla de seguimiento..."
psql -v ON_ERROR_STOP=1 "$DB_URL" -c "
  CREATE TABLE IF NOT EXISTS public.schema_migrations (
    version    text        PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  );
"

# 2. Apply pending migrations (sorted by filename)
echo ""
echo "→ Verificando migraciones..."
found_migrations=0
for file in $(ls "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort); do
  found_migrations=1
  version=$(basename "$file" .sql)
  applied=$(psql -t -A "$DB_URL" \
    -c "SELECT COUNT(1) FROM public.schema_migrations WHERE version='${version}';" \
    | tr -d '[:space:]')

  if [ "$applied" = "0" ]; then
    echo "  ► Aplicando: ${version}"
    psql -v ON_ERROR_STOP=1 "$DB_URL" -f "$file"
    psql "$DB_URL" -c \
      "INSERT INTO public.schema_migrations (version) VALUES ('${version}') ON CONFLICT DO NOTHING;"
    echo "  ✓ Listo"
  else
    echo "  - Omitiendo (ya aplicada): ${version}"
  fi
done
[ "$found_migrations" = "0" ] && echo "  (sin archivos de migración)"

# 3. Run seeds — tracked, so each seed file runs exactly once
echo ""
echo "→ Verificando seeds..."
found_seeds=0
for file in $(ls "${SEED_DIR}"/*.sql 2>/dev/null | sort); do
  found_seeds=1
  seed_name=$(basename "$file" .sql)
  version="seed/${seed_name}"
  applied=$(psql -t -A "$DB_URL" \
    -c "SELECT COUNT(1) FROM public.schema_migrations WHERE version='${version}';" \
    | tr -d '[:space:]')

  if [ "$applied" = "0" ]; then
    echo "  ► Cargando seed: ${seed_name}"
    psql -v ON_ERROR_STOP=1 "$DB_URL" -f "$file"
    psql "$DB_URL" -c \
      "INSERT INTO public.schema_migrations (version) VALUES ('${version}') ON CONFLICT DO NOTHING;"
    echo "  ✓ Seed listo"
  else
    echo "  - Omitiendo seed (ya cargado): ${seed_name}"
  fi
done
[ "$found_seeds" = "0" ] && echo "  (sin archivos de seed)"

echo ""
echo "✓ Todas las migraciones completadas."
