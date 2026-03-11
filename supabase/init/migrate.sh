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

# 2. Bootstrap: if schema_migrations is empty but app tables already exist,
#    the DB was previously set up by 01-run-all.sh (legacy bootstrap).
#    Stamp all current files as applied WITHOUT executing them so they are
#    never re-run on an existing database.
is_fresh=$(psql -t -A "$DB_URL" -c "
  SELECT (
    (SELECT COUNT(1) FROM public.schema_migrations) = 0
    AND EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'organizations'
    )
  );
" | tr -d '[:space:]')

if [ "$is_fresh" = "t" ]; then
  echo ""
  echo "→ DB existente detectada. Sincronizando historial sin re-ejecutar..."
  for f in $(ls "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort); do
    v=$(basename "$f" .sql)
    psql "$DB_URL" -c "INSERT INTO public.schema_migrations(version) VALUES('$v') ON CONFLICT DO NOTHING;" > /dev/null
    echo "  ✓ Registrada (sin ejecutar): $v"
  done
  for f in $(ls "${SEED_DIR}"/*.sql 2>/dev/null | sort); do
    v="seed/$(basename "$f" .sql)"
    psql "$DB_URL" -c "INSERT INTO public.schema_migrations(version) VALUES('$v') ON CONFLICT DO NOTHING;" > /dev/null
    echo "  ✓ Seed registrado (sin ejecutar): $(basename "$f" .sql)"
  done
  echo "  ✓ Historial sincronizado. Solo se ejecutaran migraciones nuevas."
fi

# 3. Apply pending migrations (sorted by filename)
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
    echo "  - Ya aplicada: ${version}"
  fi
done
[ "$found_migrations" = "0" ] && echo "  (sin archivos de migracion)"

# 4. Apply pending seeds (each seed runs exactly once)
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
    echo "  - Seed ya cargado: ${seed_name}"
  fi
done
[ "$found_seeds" = "0" ] && echo "  (sin archivos de seed)"

echo ""
echo "✓ Todas las migraciones completadas."
