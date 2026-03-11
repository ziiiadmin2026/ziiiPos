insert into public.organizations (id, name, legal_name)
values ('11111111-1111-1111-1111-111111111111', 'ZiiiPos Restaurants', 'ZiiiPos Restaurants SA de CV')
on conflict (id) do nothing;

insert into public.branches (id, organization_id, name, code, address)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Polanco', 'POL', 'Masaryk 100, CDMX')
on conflict (id) do nothing;

insert into public.units_of_measure (id, code, name, unit_type, base_unit_code, conversion_factor)
values
  ('33333333-3333-3333-3333-333333333331', 'kg', 'Kilogramo', 'weight', 'g', 1000),
  ('33333333-3333-3333-3333-333333333332', 'l', 'Litro', 'volume', 'ml', 1000),
  ('33333333-3333-3333-3333-333333333333', 'unit', 'Pieza', 'count', 'unit', 1)
on conflict (id) do nothing;