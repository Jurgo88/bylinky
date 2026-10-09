-- 001_init  –  Bylinky spod Tatier: katalóg, obsah, objednávky, doprava

-- ===== ENUMY =====
create type packaging_type  as enum ('plast', 'sklo');
create type content_status  as enum ('draft', 'published');
create type order_status    as enum ('new','paid','processing','shipped','delivered','cancelled');
create type payment_method  as enum ('card','transfer','cod','cash');
create type payment_status  as enum ('pending','paid','failed','refunded');
create type carrier_type    as enum ('packeta','gls','posta','osobny');
create type shipping_kind   as enum ('pickup','home','personal');

-- ===== ADMIN =====
create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'admin'
);

create function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin') $$;

create function public.set_updated_at() returns trigger
  language plpgsql set search_path = public as
$$ begin new.updated_at = now(); return new; end $$;

-- ===== KATALÓG =====
create table categories (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  description text,
  position int not null default 0,
  is_published boolean not null default true
);

create table tags (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null
);

create table products (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  description_md text,
  composition text,
  dosage text,
  usage text,
  primary_category_id bigint references categories on delete set null,
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  old_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_categories (
  product_id bigint references products on delete cascade,
  category_id bigint references categories on delete cascade,
  position int not null default 0,
  primary key (product_id, category_id)
);

create table product_tags (
  product_id bigint references products on delete cascade,
  tag_id bigint references tags on delete cascade,
  primary key (product_id, tag_id)
);

create table product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references products on delete cascade,
  sku text unique,
  size_label text,
  packaging packaging_type,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  weight_g int,
  stock_qty int,                              -- null = sklad sa nesleduje
  is_active boolean not null default true,
  position int not null default 0
);

create table product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references products on delete cascade,
  storage_path text not null,
  alt text,
  position int not null default 0             -- 0 = hlavný obrázok
);

-- ===== OBSAH =====
create table pages (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  body_md text,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

create table articles (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  body_md text,
  cover_image_path text,
  status content_status not null default 'draft',
  published_at timestamptz
);

create table article_products (
  article_id bigint references articles on delete cascade,
  product_id bigint references products on delete cascade,
  primary key (article_id, product_id)
);

create table stores (
  id bigint generated always as identity primary key,
  name text not null,
  address text,
  city text,
  lat double precision,
  lng double precision,
  maps_url text,
  is_active boolean not null default true
);

create table settings (
  key text primary key,
  value jsonb not null
);

-- ===== OBJEDNÁVKY A DOPRAVA =====
create table shipping_methods (
  id bigint generated always as identity primary key,
  code text unique not null,
  name text not null,
  carrier carrier_type not null,
  kind shipping_kind not null,
  price numeric(10,2) not null,
  free_from numeric(10,2),
  cod_fee numeric(10,2),
  is_active boolean not null default true,
  position int not null default 0
);

create sequence order_number_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null
    default to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0'),
  status order_status not null default 'new',
  email text not null,
  phone text,
  name text not null,
  billing_address jsonb,
  shipping_address jsonb,
  shipping_method_id bigint references shipping_methods,
  pickup_point jsonb,
  subtotal numeric(10,2) not null,
  shipping_price numeric(10,2) not null default 0,
  cod_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method payment_method not null,
  payment_status payment_status not null default 'pending',
  payment_ref text,
  note text,
  created_at timestamptz not null default now()
);

create table order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders on delete cascade,
  variant_id bigint references product_variants on delete set null,
  product_name text not null,
  variant_label text,
  unit_price numeric(10,2) not null,
  qty int not null check (qty > 0)
);

create table shipments (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders on delete cascade,
  carrier carrier_type not null,
  external_id text,
  barcode text,
  tracking_url text,
  label_path text,
  status text,
  last_checked_at timestamptz
);

-- ===== TRIGGERY A INDEXY =====
create trigger products_updated before update on products
  for each row execute function public.set_updated_at();
create trigger pages_updated before update on pages
  for each row execute function public.set_updated_at();

create index on products (primary_category_id);
create index on product_categories (category_id);
create index on product_tags (tag_id);
create index on product_variants (product_id);
create index on product_images (product_id);
create index on article_products (product_id);
create index on orders (status, created_at desc);
create index on orders (shipping_method_id);
create index on order_items (order_id);
create index on order_items (variant_id);
create index on shipments (order_id);

-- ===== PRÍSTUPY (Data API nevystavuje tabuľky automaticky) =====
grant usage on schema public to anon, authenticated, service_role;

-- verejný obsah: čítanie pre všetkých (RLS ďalej filtruje publikované)
grant select on categories, tags, products, product_categories, product_tags,
  product_variants, product_images, pages, articles, article_products,
  stores, settings, shipping_methods
  to anon, authenticated;

-- prihlásený používateľ: zápis (RLS povolí len adminovi)
grant insert, update, delete on categories, tags, products, product_categories, product_tags,
  product_variants, product_images, pages, articles, article_products,
  stores, settings, shipping_methods
  to authenticated;
grant select, insert, update, delete on profiles, orders, order_items, shipments to authenticated;

-- serverové funkcie
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ===== RLS =====
do $$
declare t text;
begin
  foreach t in array array['profiles','categories','tags','products','product_categories',
    'product_tags','product_variants','product_images','pages','articles','article_products',
    'stores','settings','shipping_methods','orders','order_items','shipments']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy admin_all on public.%I for all to authenticated
                    using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy own_profile_read on profiles for select to authenticated using (user_id = auth.uid());

create policy public_read on categories         for select using (is_published);
create policy public_read on tags               for select using (true);
create policy public_read on products           for select using (is_published);
create policy public_read on product_categories for select using (true);
create policy public_read on product_tags       for select using (true);
create policy public_read on product_variants   for select using (is_active);
create policy public_read on product_images     for select using (true);
create policy public_read on pages              for select using (true);
create policy public_read on articles           for select using (status = 'published');
create policy public_read on article_products   for select using (true);
create policy public_read on stores             for select using (is_active);
create policy public_read on settings           for select using (true);
create policy public_read on shipping_methods   for select using (is_active);
-- orders / order_items / shipments: verejne nič; zapisuje serverová funkcia (service_role)

-- ===== ÚLOŽISKO NA OBRÁZKY =====
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ===== ZÁKLADNÉ DÁTA =====
insert into tags (slug, name) values
  ('novinka', 'Novinka'),
  ('ocenene', 'Ocenené'),
  ('sezonne', 'Sezónne'),
  ('top',     'TOP produkt');

insert into shipping_methods (code, name, carrier, kind, price, position) values
  ('posta',  'Slovenská pošta', 'posta',  'home',     4.00, 1),
  ('gls',    'Kuriér GLS',      'gls',    'home',     3.65, 2),
  ('osobny', 'Osobný odber',    'osobny', 'personal', 0.00, 3);
