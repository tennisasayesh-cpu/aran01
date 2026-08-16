-- ARAN OS ERP DATABASE
-- این فایل را در بخش SQL Editor پروژه Supabase اجرا کنید.

create extension if not exists "pgcrypto";

create type public.asset_kind as enum (
  'tennis', 'beach_tennis', 'padel', 'lodging',
  'game', 'gym', 'restaurant_table', 'other'
);

create type public.booking_status as enum (
  'draft', 'confirmed', 'checked_in', 'completed', 'cancelled'
);

create type public.restaurant_order_status as enum (
  'open', 'preparing', 'served', 'paid', 'cancelled'
);

create type public.stock_movement_type as enum (
  'in', 'out', 'waste', 'adjustment', 'transfer'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  full_name text not null default 'کاربر سازمانی',
  role text not null default 'operator' check (role in ('owner', 'admin', 'manager', 'reception', 'restaurant', 'warehouse', 'accountant')),
  created_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  kind public.asset_kind not null,
  capacity integer not null default 1,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  national_id text,
  membership_level text default 'normal',
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete restrict,
  member_id uuid references public.members(id) on delete set null,
  customer_name text not null,
  phone text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.booking_status not null default 'draft',
  total_amount numeric(14, 0) not null default 0,
  paid_amount numeric(14, 0) not null default 0,
  source text not null default 'reception',
  notes text,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index bookings_org_date_idx on public.bookings(organization_id, start_at);
create index bookings_asset_date_idx on public.bookings(asset_id, start_at, end_at);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  phone text,
  contact_name text,
  payment_terms text,
  created_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  sku text,
  unit text not null default 'عدد',
  current_stock numeric(14, 2) not null default 0,
  reorder_point numeric(14, 2) not null default 0,
  average_cost numeric(14, 0) not null default 0,
  is_perishable boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.stock_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  location_type text not null default 'warehouse' check (location_type in ('dry', 'cold', 'freezer', 'prep', 'kitchen', 'bar', 'warehouse')),
  created_at timestamptz not null default now()
);

create table public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  location_id uuid references public.stock_locations(id) on delete set null,
  movement_type public.stock_movement_type not null,
  quantity numeric(14, 2) not null check (quantity > 0),
  unit_cost numeric(14, 0) default 0,
  note text,
  reference_type text,
  reference_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index stock_transactions_item_idx on public.stock_transactions(item_id, created_at desc);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  order_number text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'received', 'cancelled')),
  total_amount numeric(14, 0) not null default 0,
  ordered_at timestamptz not null default now(),
  received_at timestamptz,
  notes text,
  unique (organization_id, order_number)
);

create table public.purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity numeric(14, 2) not null,
  unit_price numeric(14, 0) not null default 0
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text not null default 'عمومی',
  selling_price numeric(14, 0) not null default 0,
  is_active boolean not null default true,
  kitchen_station text default 'آشپزخانه فرنگی',
  created_at timestamptz not null default now()
);

create table public.restaurant_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  order_number text not null,
  table_name text not null,
  customer_name text,
  status public.restaurant_order_status not null default 'open',
  total_amount numeric(14, 0) not null default 0,
  discount_amount numeric(14, 0) not null default 0,
  paid_amount numeric(14, 0) not null default 0,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (organization_id, order_number)
);

create table public.restaurant_order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  restaurant_order_id uuid not null references public.restaurant_orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(14, 0) not null default 0,
  kitchen_station text,
  status text not null default 'new' check (status in ('new', 'preparing', 'ready', 'served', 'cancelled'))
);

create table public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  opened_by uuid references public.profiles(id) on delete set null,
  opening_balance numeric(14, 0) not null default 0,
  closing_balance numeric(14, 0),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

-- تابع امن برای ثبت گردش انبار و به‌روزرسانی موجودی.
create or replace function public.record_stock_movement(
  p_organization_id uuid,
  p_item_id uuid,
  p_type text,
  p_quantity numeric,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sign integer;
begin
  if p_type not in ('in', 'out', 'waste', 'adjustment', 'transfer') then
    raise exception 'نوع گردش نامعتبر است';
  end if;

  if p_quantity <= 0 then
    raise exception 'مقدار باید بیشتر از صفر باشد';
  end if;

  v_sign := case when p_type = 'in' then 1 else -1 end;

  insert into public.stock_transactions (
    organization_id, item_id, movement_type, quantity, note, created_by
  )
  values (
    p_organization_id, p_item_id, p_type::public.stock_movement_type,
    p_quantity, p_note, auth.uid()
  );

  update public.inventory_items
  set current_stock = current_stock + (p_quantity * v_sign)
  where id = p_item_id
    and organization_id = p_organization_id;

  if not found then
    raise exception 'کالای انبار یافت نشد';
  end if;
end;
$$;

-- سیاست چندسازمانی: هر کاربر فقط داده‌های سازمان خود را مشاهده و ثبت می‌کند.
create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.members enable row level security;
alter table public.bookings enable row level security;
alter table public.suppliers enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_locations enable row level security;
alter table public.stock_transactions enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_lines enable row level security;
alter table public.menu_items enable row level security;
alter table public.restaurant_orders enable row level security;
alter table public.restaurant_order_items enable row level security;
alter table public.cash_sessions enable row level security;

create policy "organization access" on public.organizations
for select using (id = public.current_organization_id());

create policy "own profile access" on public.profiles
for all using (id = auth.uid()) with check (id = auth.uid());

create policy "assets organization access" on public.assets
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "members organization access" on public.members
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "bookings organization access" on public.bookings
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "suppliers organization access" on public.suppliers
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "inventory_items organization access" on public.inventory_items
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "stock_locations organization access" on public.stock_locations
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "stock_transactions organization access" on public.stock_transactions
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "purchase_orders organization access" on public.purchase_orders
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "purchase_order_lines organization access" on public.purchase_order_lines
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "menu_items organization access" on public.menu_items
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "restaurant_orders organization access" on public.restaurant_orders
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "restaurant_order_items organization access" on public.restaurant_order_items
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "cash_sessions organization access" on public.cash_sessions
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

-- داده‌های اولیه برای مجموعه آران
insert into public.organizations (id, name, legal_name)
values ('00000000-0000-0000-0000-000000000001', 'مجموعه آران', 'مجموعه ورزشی، اقامتی و تفریحی آران')
on conflict (id) do nothing;

insert into public.assets (organization_id, name, kind, capacity)
select '00000000-0000-0000-0000-000000000001', 'زمین تنیس ' || gs, 'tennis', 4
from generate_series(1, 18) gs
on conflict do nothing;

insert into public.assets (organization_id, name, kind, capacity)
select '00000000-0000-0000-0000-000000000001', 'زمین تنیس ساحلی ' || gs, 'beach_tennis', 4
from generate_series(1, 5) gs
on conflict do nothing;

insert into public.assets (organization_id, name, kind, capacity)
select '00000000-0000-0000-0000-000000000001', 'زمین پدل ' || gs, 'padel', 4
from generate_series(1, 4) gs
on conflict do nothing;

insert into public.assets (organization_id, name, kind, capacity)
select '00000000-0000-0000-0000-000000000001', 'سوئیت سه‌نفره ' || gs, 'lodging', 3
from generate_series(1, 17) gs
on conflict do nothing;

insert into public.assets (organization_id, name, kind, capacity)
select '00000000-0000-0000-0000-000000000001', 'سوئیت چهارنفره ' || gs, 'lodging', 4
from generate_series(1, 2) gs
on conflict do nothing;

insert into public.assets (organization_id, name, kind, capacity)
select '00000000-0000-0000-0000-000000000001', 'کلبه سوئیسی ' || gs, 'lodging', 4
from generate_series(1, 6) gs
on conflict do nothing;

insert into public.assets (organization_id, name, kind, capacity, notes) values
('00000000-0000-0000-0000-000000000001', 'زمین بسکتبال', 'other', 10, 'فضای ورزشی گروهی'),
('00000000-0000-0000-0000-000000000001', 'باشگاه بدنسازی', 'gym', 50, 'ورود و عضویت'),
('00000000-0000-0000-0000-000000000001', 'گیم‌روم', 'game', 35, '۴ میز ایت، ۳ میز اسنوکر، ۸ کنسول، ۱۰ رایانه گیمینگ'),
('00000000-0000-0000-0000-000000000001', 'کتابخانه', 'other', 20, 'فضای مطالعه'),
('00000000-0000-0000-0000-000000000001', 'اتاق هوش مصنوعی', 'other', 12, 'آموزش و فعالیت هوش مصنوعی'),
('00000000-0000-0000-0000-000000000001', 'کافی‌شاپ', 'restaurant_table', 30, 'بیانکو'),
('00000000-0000-0000-0000-000000000001', 'سالن پایین بیانکو', 'restaurant_table', 80, 'فضای پذیرایی'),
('00000000-0000-0000-0000-000000000001', 'سالن بالا بیانکو', 'restaurant_table', 70, 'فضای پذیرایی'),
('00000000-0000-0000-0000-000000000001', 'تراس جلو بیانکو', 'restaurant_table', 35, 'فضای پذیرایی'),
('00000000-0000-0000-0000-000000000001', 'تراس پشت بیانکو', 'restaurant_table', 35, 'فضای پذیرایی')
on conflict do nothing;

insert into public.stock_locations (organization_id, name, location_type) values
('00000000-0000-0000-0000-000000000001', 'انبار خشک بیانکو', 'dry'),
('00000000-0000-0000-0000-000000000001', 'انبار سرد بیانکو', 'cold'),
('00000000-0000-0000-0000-000000000001', 'آماده‌سازی بیانکو', 'prep'),
('00000000-0000-0000-0000-000000000001', 'آشپزخانه سنتی', 'kitchen'),
('00000000-0000-0000-0000-000000000001', 'آشپزخانه فرنگی', 'kitchen'),
('00000000-0000-0000-0000-000000000001', 'آشپزخانه آسیایی', 'kitchen')
on conflict do nothing;

insert into public.inventory_items (organization_id, name, unit, current_stock, reorder_point, average_cost, is_perishable) values
('00000000-0000-0000-0000-000000000001', 'برنج ایرانی', 'کیلوگرم', 85, 50, 165000, false),
('00000000-0000-0000-0000-000000000001', 'مرغ تازه', 'کیلوگرم', 18, 25, 230000, true),
('00000000-0000-0000-0000-000000000001', 'گوشت گوساله', 'کیلوگرم', 12, 20, 690000, true),
('00000000-0000-0000-0000-000000000001', 'قهوه اسپرسو', 'کیلوگرم', 4, 5, 1600000, false),
('00000000-0000-0000-0000-000000000001', 'آب معدنی', 'بطری', 120, 100, 12000, false)
on conflict do nothing;
