#!/bin/sh
set -eu

DB_ADMIN_USER="${SUPABASE_DB_ADMIN_USER:-supabase_admin}"
BOOTSTRAP_MARKER="/var/lib/postgresql/data/.pos-bootstrap-complete"

psql -v ON_ERROR_STOP=1 -U "$DB_ADMIN_USER" -d postgres <<SQL
do \
\$\$
begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login password '${POSTGRES_PASSWORD}';
  else
    alter role supabase_auth_admin with login password '${POSTGRES_PASSWORD}';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'supabase_storage_admin') then
    create role supabase_storage_admin login password '${POSTGRES_PASSWORD}';
  else
    alter role supabase_storage_admin with login password '${POSTGRES_PASSWORD}';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator login password '${POSTGRES_PASSWORD}' noinherit;
  else
    alter role authenticator with login password '${POSTGRES_PASSWORD}' noinherit;
  end if;

  grant anon to authenticator;
  grant authenticated to authenticator;
  grant service_role to authenticator;
end;
\$\$;
SQL

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

touch "$BOOTSTRAP_MARKER"