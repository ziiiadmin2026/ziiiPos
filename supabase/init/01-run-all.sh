#!/bin/sh
set -eu

DB_ADMIN_USER="${SUPABASE_DB_ADMIN_USER:-supabase_admin}"

for file in /pos-bootstrap/migrations/*.sql; do
  if [ -f "$file" ]; then
    psql -v ON_ERROR_STOP=1 -U "$DB_ADMIN_USER" -d postgres -f "$file"
  fi
done

for file in /pos-bootstrap/seed/*.sql; do
  if [ -f "$file" ]; then
    psql -v ON_ERROR_STOP=1 -U "$DB_ADMIN_USER" -d postgres -f "$file"
  fi
done