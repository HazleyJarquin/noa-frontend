-- Catalog: categories + products, public read-only, product images in Storage

-- ─── Tables ────────────────────────────────────────────────────────────────

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  category_id     uuid not null references public.categories (id) on delete restrict,
  price           numeric(10, 2) not null check (price >= 0),
  previous_price  numeric(10, 2) check (previous_price is null or previous_price > price),
  stock           int  not null default 0 check (stock >= 0),
  on_sale         boolean not null default false,
  is_featured     boolean not null default false,
  image_path      text, -- path inside the "products" Storage bucket, e.g. "cuaderno-universitario.jpg"
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_is_featured_idx on public.products (is_featured) where is_featured;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ─── Security: anyone can read the catalog, nobody can write through the API ─

alter table public.categories enable row level security;
alter table public.products   enable row level security;

create policy "Categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Products are public"
  on public.products for select
  to anon, authenticated
  using (true);

grant select on public.categories, public.products to anon, authenticated;

-- ─── Storage: public bucket for product photos ─────────────────────────────

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- ─── Seed data ─────────────────────────────────────────────────────────────

insert into public.categories (slug, name, sort_order) values
  ('cuadernos',   'Cuadernos',     1),
  ('escritura',   'Escritura',     2),
  ('arte-color',  'Arte & Color',  3),
  ('papeleria',   'Papelería',     4),
  ('oficina',     'Oficina',       5),
  ('tijeras-diy', 'Tijeras & DIY', 6),
  ('pegamentos',  'Pegamentos',    7),
  ('kits-lista',  'Kits Lista',    8);

insert into public.products (slug, name, category_id, price, previous_price, stock, on_sale, is_featured)
select p.slug, p.name, c.id, p.price, p.previous_price, p.stock, p.on_sale, true
from (values
  ('cuaderno-universitario-100h', 'Cuaderno Universitario 100h',     'cuadernos',  85,  95,   140, false),
  ('lapiz-mongol-2hb',            'Lápiz Mongol No. 2 HB',           'escritura',  12,  null, 500, false),
  ('prismacolor-12u',             'Caja de colores Prismacolor 12u', 'arte-color', 95,  110,  3,   true),
  ('sharpie-set-4u',              'Marcadores Sharpie Set 4u',       'arte-color', 120, null, 60,  false)
) as p (slug, name, category_slug, price, previous_price, stock, on_sale)
join public.categories c on c.slug = p.category_slug;
