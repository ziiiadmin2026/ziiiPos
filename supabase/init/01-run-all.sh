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

psql -v ON_ERROR_STOP=1 -U "$DB_ADMIN_USER" -d postgres <<SQL
grant all privileges on database postgres to ${DB_ADMIN_USER};
grant all privileges on database postgres to supabase_auth_admin;
grant all privileges on database postgres to supabase_storage_admin;
grant all privileges on database postgres to authenticator;

grant usage, create on schema public to supabase_auth_admin;
grant usage on schema public to authenticator;

alter schema auth owner to supabase_auth_admin;
grant usage, create on schema auth to supabase_auth_admin;
grant usage on schema auth to authenticator, anon, authenticated, service_role;
grant all privileges on all tables in schema auth to supabase_auth_admin;
grant all privileges on all sequences in schema auth to supabase_auth_admin;
grant all privileges on all functions in schema auth to supabase_auth_admin;
alter default privileges for role supabase_auth_admin in schema auth grant all on tables to supabase_auth_admin;
alter default privileges for role supabase_auth_admin in schema auth grant all on sequences to supabase_auth_admin;
alter default privileges for role supabase_auth_admin in schema auth grant all on functions to supabase_auth_admin;

alter schema storage owner to supabase_storage_admin;
grant usage, create on schema storage to supabase_storage_admin;
grant usage on schema storage to authenticator, anon, authenticated, service_role;
grant all privileges on all tables in schema storage to supabase_storage_admin;
grant all privileges on all sequences in schema storage to supabase_storage_admin;
grant all privileges on all functions in schema storage to supabase_storage_admin;
alter default privileges for role supabase_storage_admin in schema storage grant all on tables to supabase_storage_admin;
alter default privileges for role supabase_storage_admin in schema storage grant all on sequences to supabase_storage_admin;
alter default privileges for role supabase_storage_admin in schema storage grant all on functions to supabase_storage_admin;

alter schema _realtime owner to ${DB_ADMIN_USER};
grant usage, create on schema _realtime to ${DB_ADMIN_USER};
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