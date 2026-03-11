create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  tax_id text,
  currency_code text not null default 'MXN',
  timezone text not null default 'America/Mexico_City',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text unique,
  address text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  full_name text not null,
  email text,
  role text not null check (role in ('admin', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, name)
);

create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  service_area_id uuid references public.service_areas(id) on delete set null,
  table_number text not null,
  capacity integer,
  status text not null default 'available' check (status in ('available', 'occupied', 'reserved', 'disabled')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, table_number)
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, name)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  sku text,
  name text not null,
  description text,
  product_type text not null check (product_type in ('dish', 'drink', 'combo', 'modifier', 'service')),
  price numeric(12,2) not null check (price >= 0),
  tax_rate numeric(5,2) not null default 0 check (tax_rate >= 0),
  cost_snapshot numeric(12,4),
  image_url text,
  is_active boolean not null default true,
  is_open_price boolean not null default false,
  tracks_inventory boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, name)
);

create table if not exists public.units_of_measure (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  unit_type text not null check (unit_type in ('weight', 'volume', 'count')),
  base_unit_code text,
  conversion_factor numeric(18,6)
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  sku text,
  name text not null,
  description text,
  unit_id uuid not null references public.units_of_measure(id),
  min_stock numeric(14,4) not null default 0,
  current_cost numeric(14,4) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, name)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  document_number text,
  status text not null default 'draft' check (status in ('draft', 'received', 'cancelled')),
  purchase_date timestamptz not null,
  received_at timestamptz,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  created_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id),
  quantity numeric(14,4) not null check (quantity > 0),
  unit_cost numeric(14,4) not null check (unit_cost >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  expiration_date date
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id),
  movement_type text not null check (movement_type in ('purchase', 'sale_consumption', 'adjustment_in', 'adjustment_out', 'waste', 'transfer_in', 'transfer_out', 'return_in', 'return_out')),
  reference_type text not null,
  reference_id uuid,
  quantity numeric(14,4) not null,
  unit_cost numeric(14,4),
  total_cost numeric(14,4),
  movement_at timestamptz not null default now(),
  notes text,
  created_by uuid references public.app_users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  yield_quantity numeric(14,4) not null default 1,
  yield_unit_id uuid references public.units_of_measure(id),
  instructions text,
  is_active boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id),
  quantity numeric(14,4) not null check (quantity > 0),
  waste_percent numeric(5,2) not null default 0 check (waste_percent >= 0),
  sort_order integer not null default 0,
  unique (recipe_id, ingredient_id)
);

create table if not exists public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  table_id uuid not null references public.restaurant_tables(id),
  opened_by uuid not null references public.app_users(id),
  closed_by uuid references public.app_users(id),
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  guest_count integer not null default 1,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  table_session_id uuid references public.table_sessions(id) on delete set null,
  sale_number bigint generated always as identity,
  sale_type text not null check (sale_type in ('dine_in', 'takeaway', 'delivery')),
  status text not null default 'open' check (status in ('open', 'paid', 'void', 'refunded')),
  customer_name text,
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  opened_by uuid not null references public.app_users(id),
  closed_by uuid references public.app_users(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  course text,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null,
  unit_cost_snapshot numeric(12,4),
  recipe_cost_snapshot numeric(12,4),
  kitchen_status text not null default 'pending' check (kitchen_status in ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  sent_to_kitchen_at timestamptz,
  served_at timestamptz,
  notes text,
  parent_item_id uuid references public.sale_items(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  payment_method text not null check (payment_method in ('cash', 'card', 'transfer', 'mixed', 'voucher')),
  amount numeric(12,2) not null check (amount >= 0),
  reference text,
  paid_at timestamptz not null default now(),
  received_by uuid references public.app_users(id)
);

create table if not exists public.sale_splits (
  id uuid primary key default gen_random_uuid(),
  original_sale_id uuid not null references public.sales(id) on delete cascade,
  new_sale_id uuid not null references public.sales(id) on delete cascade,
  split_type text not null,
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.cash_registers (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, name)
);

create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  cash_register_id uuid not null references public.cash_registers(id) on delete cascade,
  opened_by uuid not null references public.app_users(id),
  closed_by uuid references public.app_users(id),
  opening_amount numeric(12,2) not null default 0,
  closing_amount numeric(12,2),
  expected_amount numeric(12,2),
  difference_amount numeric(12,2),
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_session_id uuid not null references public.cash_sessions(id) on delete cascade,
  movement_type text not null check (movement_type in ('sale_income', 'cash_drop', 'expense', 'opening', 'closing_adjustment')),
  amount numeric(12,2) not null,
  reason text,
  reference_type text,
  reference_id uuid,
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  adjustment_type text not null check (adjustment_type in ('count_correction', 'waste', 'loss', 'internal_use')),
  reason text,
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.stock_adjustment_items (
  id uuid primary key default gen_random_uuid(),
  stock_adjustment_id uuid not null references public.stock_adjustments(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id),
  quantity numeric(14,4) not null,
  unit_cost numeric(14,4)
);

create index if not exists idx_branches_organization_active on public.branches (organization_id, is_active);
create index if not exists idx_products_branch_category_active on public.products (branch_id, category_id, is_active);
create index if not exists idx_ingredients_branch_active on public.ingredients (branch_id, is_active);
create index if not exists idx_purchase_order_items_order on public.purchase_order_items (purchase_order_id);
create index if not exists idx_inventory_movements_branch_ingredient_moved_at on public.inventory_movements (branch_id, ingredient_id, movement_at desc);
create index if not exists idx_inventory_movements_reference on public.inventory_movements (reference_type, reference_id);
create index if not exists idx_table_sessions_table_status on public.table_sessions (table_id, status);
create index if not exists idx_sales_branch_status_opened_at on public.sales (branch_id, status, opened_at desc);
create index if not exists idx_sale_items_sale on public.sale_items (sale_id);
create index if not exists idx_payments_sale on public.payments (sale_id);
create index if not exists idx_cash_sessions_status on public.cash_sessions (status, opened_at desc);

create or replace view public.inventory_stock_view as
select
  branch_id,
  ingredient_id,
  sum(quantity) as stock_on_hand,
  max(movement_at) as last_movement_at
from public.inventory_movements
group by branch_id, ingredient_id;

create or replace view public.recipe_cost_view as
select
  p.id as product_id,
  r.id as recipe_id,
  coalesce(sum(ri.quantity * i.current_cost * (1 + (ri.waste_percent / 100.0))), 0)::numeric(14,4) as recipe_cost,
  p.price as sale_price,
  (p.price - coalesce(sum(ri.quantity * i.current_cost * (1 + (ri.waste_percent / 100.0))), 0))::numeric(14,4) as gross_margin,
  case
    when p.price = 0 then 0
    else (((p.price - coalesce(sum(ri.quantity * i.current_cost * (1 + (ri.waste_percent / 100.0))), 0)) / p.price) * 100)::numeric(8,2)
  end as gross_margin_percent
from public.products p
left join public.recipes r on r.product_id = p.id and r.is_active = true
left join public.recipe_ingredients ri on ri.recipe_id = r.id
left join public.ingredients i on i.id = ri.ingredient_id
group by p.id, r.id, p.price;

create or replace function public.consume_sale_inventory(p_sale_id uuid)
returns void
language plpgsql
as $$
declare
  sale_branch uuid;
begin
  select branch_id into sale_branch
  from public.sales
  where id = p_sale_id;

  if sale_branch is null then
    raise exception 'Sale % not found', p_sale_id;
  end if;

  insert into public.inventory_movements (
    branch_id,
    ingredient_id,
    movement_type,
    reference_type,
    reference_id,
    quantity,
    unit_cost,
    total_cost,
    movement_at,
    notes
  )
  select
    sale_branch,
    ri.ingredient_id,
    'sale_consumption',
    'sale',
    si.sale_id,
    (si.quantity * ri.quantity * -1),
    ing.current_cost,
    (si.quantity * ri.quantity * ing.current_cost * -1),
    now(),
    concat('Automatic deduction for sale item ', si.id)
  from public.sale_items si
  join public.recipes r on r.product_id = si.product_id and r.is_active = true
  join public.recipe_ingredients ri on ri.recipe_id = r.id
  join public.ingredients ing on ing.id = ri.ingredient_id
  where si.sale_id = p_sale_id;
end;
$$;

create or replace function public.apply_purchase_inventory()
returns trigger
language plpgsql
as $$
declare
  purchase_branch uuid;
begin
  select branch_id into purchase_branch
  from public.purchase_orders
  where id = new.purchase_order_id;

  insert into public.inventory_movements (
    branch_id,
    ingredient_id,
    movement_type,
    reference_type,
    reference_id,
    quantity,
    unit_cost,
    total_cost,
    movement_at,
    notes
  )
  values (
    purchase_branch,
    new.ingredient_id,
    'purchase',
    'purchase_order',
    new.purchase_order_id,
    new.quantity,
    new.unit_cost,
    new.quantity * new.unit_cost,
    now(),
    'Auto-generated from purchase order item'
  );

  return new;
end;
$$;

drop trigger if exists trg_apply_purchase_inventory on public.purchase_order_items;
create trigger trg_apply_purchase_inventory
after insert on public.purchase_order_items
for each row execute function public.apply_purchase_inventory();

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
drop trigger if exists trg_branches_updated_at on public.branches;
create trigger trg_branches_updated_at before update on public.branches for each row execute function public.set_updated_at();
drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at before update on public.app_users for each row execute function public.set_updated_at();
drop trigger if exists trg_service_areas_updated_at on public.service_areas;
create trigger trg_service_areas_updated_at before update on public.service_areas for each row execute function public.set_updated_at();
drop trigger if exists trg_tables_updated_at on public.restaurant_tables;
create trigger trg_tables_updated_at before update on public.restaurant_tables for each row execute function public.set_updated_at();
drop trigger if exists trg_categories_updated_at on public.product_categories;
create trigger trg_categories_updated_at before update on public.product_categories for each row execute function public.set_updated_at();
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists trg_ingredients_updated_at on public.ingredients;
create trigger trg_ingredients_updated_at before update on public.ingredients for each row execute function public.set_updated_at();
drop trigger if exists trg_suppliers_updated_at on public.suppliers;
create trigger trg_suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
drop trigger if exists trg_purchase_orders_updated_at on public.purchase_orders;
create trigger trg_purchase_orders_updated_at before update on public.purchase_orders for each row execute function public.set_updated_at();
drop trigger if exists trg_recipes_updated_at on public.recipes;
create trigger trg_recipes_updated_at before update on public.recipes for each row execute function public.set_updated_at();
drop trigger if exists trg_table_sessions_updated_at on public.table_sessions;
create trigger trg_table_sessions_updated_at before update on public.table_sessions for each row execute function public.set_updated_at();
drop trigger if exists trg_sales_updated_at on public.sales;
create trigger trg_sales_updated_at before update on public.sales for each row execute function public.set_updated_at();
drop trigger if exists trg_sale_items_updated_at on public.sale_items;
create trigger trg_sale_items_updated_at before update on public.sale_items for each row execute function public.set_updated_at();
drop trigger if exists trg_cash_registers_updated_at on public.cash_registers;
create trigger trg_cash_registers_updated_at before update on public.cash_registers for each row execute function public.set_updated_at();
drop trigger if exists trg_cash_sessions_updated_at on public.cash_sessions;
create trigger trg_cash_sessions_updated_at before update on public.cash_sessions for each row execute function public.set_updated_at();