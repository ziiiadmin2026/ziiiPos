do $$
begin
	if not exists (select 1 from pg_roles where rolname = 'postgres') then
		create role postgres login superuser createdb createrole replication bypassrls;
	end if;
	if not exists (select 1 from pg_roles where rolname = 'anon') then
		create role anon nologin noinherit;
	end if;
	if not exists (select 1 from pg_roles where rolname = 'authenticated') then
		create role authenticated nologin noinherit;
	end if;
	if not exists (select 1 from pg_roles where rolname = 'service_role') then
		create role service_role nologin noinherit bypassrls;
	end if;
end;
$$;

create schema if not exists auth;
create schema if not exists storage;
create schema if not exists _realtime;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema storage to anon, authenticated, service_role;
grant usage on schema _realtime to anon, authenticated, service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;