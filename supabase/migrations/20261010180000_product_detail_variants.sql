-- Product detail: content fields, options/variants (stock per variant) and manual recommendations.
-- Every purchasable unit is a variant: products without options get a single default variant.

-- ─── Detail content on products ────────────────────────────────────────────

alter table public.products
  add column brand             text,
  add column short_description text,
  add column description       text, -- paragraphs separated by a blank line
  add column badge_label       text, -- small tag on recommendation cards, e.g. "4 Colores"
  add column highlights        jsonb not null default '[]'::jsonb, -- [{ "icon", "title", "text" }]
  add column specifications    jsonb not null default '[]'::jsonb; -- [{ "label", "value" }]

-- ─── Options (e.g. "Color de Portada") and their values ("Azul Marino") ────

create table public.product_options (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  name        text not null,
  kind        text not null default 'text' check (kind in ('text', 'color')),
  position    smallint not null default 0,
  unique (product_id, name)
);

create table public.product_option_values (
  id         uuid primary key default gen_random_uuid(),
  option_id  uuid not null references public.product_options (id) on delete cascade,
  label      text not null,
  color_hex  text check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  position   smallint not null default 0,
  unique (option_id, label)
);

-- ─── Variants: one row per sellable combination ────────────────────────────

create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  sku         text not null unique,
  price       numeric(10, 2) check (price >= 0), -- null = use products.price
  stock       int not null default 0 check (stock >= 0),
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.product_variant_values (
  variant_id       uuid not null references public.product_variants (id) on delete cascade,
  option_value_id  uuid not null references public.product_option_values (id) on delete cascade,
  primary key (variant_id, option_value_id)
);

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ─── Manual recommendations ("Útiles recomendados") ────────────────────────

create table public.product_recommendations (
  product_id              uuid not null references public.products (id) on delete cascade,
  recommended_product_id  uuid not null references public.products (id) on delete cascade,
  position                smallint not null default 0,
  primary key (product_id, recommended_product_id),
  check (product_id <> recommended_product_id)
);

create index product_options_product_id_idx         on public.product_options (product_id);
create index product_option_values_option_id_idx    on public.product_option_values (option_id);
create index product_variants_product_id_idx        on public.product_variants (product_id);
create index product_variant_values_value_idx       on public.product_variant_values (option_value_id);
create index product_recommendations_recommended_idx on public.product_recommendations (recommended_product_id);

-- ─── Security: public read-only, same as the rest of the catalog ───────────

alter table public.product_options         enable row level security;
alter table public.product_option_values   enable row level security;
alter table public.product_variants        enable row level security;
alter table public.product_variant_values  enable row level security;
alter table public.product_recommendations enable row level security;

create policy "Product options are public"         on public.product_options         for select to anon, authenticated using (true);
create policy "Product option values are public"   on public.product_option_values   for select to anon, authenticated using (true);
create policy "Product variants are public"        on public.product_variants        for select to anon, authenticated using (true);
create policy "Product variant values are public"  on public.product_variant_values  for select to anon, authenticated using (true);
create policy "Product recommendations are public" on public.product_recommendations for select to anon, authenticated using (true);

grant select on
  public.product_options,
  public.product_option_values,
  public.product_variants,
  public.product_variant_values,
  public.product_recommendations
to anon, authenticated;

-- ─── Move stock into variants ──────────────────────────────────────────────

insert into public.product_variants (product_id, sku, stock)
select id, upper(slug), stock
from public.products;

alter table public.products drop column stock;

-- ─── Seed: notebook with colors × sheet types, plus detail content ─────────

do $$
declare
  v_product uuid;
  v_color   uuid;
  v_sheet   uuid;
begin
  select id into v_product from public.products where slug = 'cuaderno-universitario-100h';

  update public.products set
    name              = 'Cuaderno Universitario 100 Hojas Loro',
    brand             = 'Loro',
    short_description = 'Marca Loro Tradicional · Espiral doble reforzado de alambre continuo',
    description       = E'El clásico cuaderno escolar y universitario Loro de pasta extradura está diseñado para soportar el ajetreo diario de las aulas y la oficina.\n\nSus 100 hojas de papel bond blanco de alto gramaje ofrecen una superficie ideal para bolígrafos de gel, tinta líquida y lápices de grafito sin traspasar la página.',
    highlights        = '[
      {"icon": "book",   "title": "100 Hojas Bond",  "text": "Papel no traslúcido de 65 g/m²"},
      {"icon": "shield", "title": "Pasta Dura Loro", "text": "Mayor protección antichoque"}
    ]'::jsonb,
    specifications    = '[
      {"label": "Marca",          "value": "Loro"},
      {"label": "Hojas",          "value": "100 hojas bond"},
      {"label": "Gramaje",        "value": "65 g/m²"},
      {"label": "Tapa",           "value": "Pasta dura"},
      {"label": "Encuadernación", "value": "Espiral doble de alambre"}
    ]'::jsonb
  where id = v_product;

  -- Replace the default variant with real combinations
  delete from public.product_variants where product_id = v_product;

  insert into public.product_options (product_id, name, kind, position)
  values (v_product, 'Color de Portada', 'color', 0)
  returning id into v_color;

  insert into public.product_options (product_id, name, kind, position)
  values (v_product, 'Tipo de Hoja', 'text', 1)
  returning id into v_sheet;

  insert into public.product_option_values (option_id, label, color_hex, position) values
    (v_color, 'Azul Marino',   '#1E293B', 0),
    (v_color, 'Rojo Escolar',  '#B91C1C', 1),
    (v_color, 'Verde Bosque',  '#15803D', 2),
    (v_color, 'Negro Clásico', '#18181B', 3),
    (v_sheet, 'Cuadriculado',  null,      0),
    (v_sheet, 'Una Línea',     null,      1),
    (v_sheet, 'Doble Línea',   null,      2);

  with combos (color, color_code, sheet, sheet_code, stock, pos) as (
    values
      ('Azul Marino',   'AZ', 'Cuadriculado', 'CD', 40,  0),
      ('Azul Marino',   'AZ', 'Una Línea',    'UL', 35,  1),
      ('Azul Marino',   'AZ', 'Doble Línea',  'DL', 12,  2),
      ('Rojo Escolar',  'RJ', 'Cuadriculado', 'CD', 18,  3),
      ('Rojo Escolar',  'RJ', 'Una Línea',    'UL', 10,  4),
      ('Rojo Escolar',  'RJ', 'Doble Línea',  'DL', 0,   5),
      ('Verde Bosque',  'VB', 'Cuadriculado', 'CD', 8,   6),
      ('Verde Bosque',  'VB', 'Una Línea',    'UL', 0,   7),
      ('Verde Bosque',  'VB', 'Doble Línea',  'DL', 5,   8),
      ('Negro Clásico', 'NG', 'Cuadriculado', 'CD', 22,  9),
      ('Negro Clásico', 'NG', 'Una Línea',    'UL', 15, 10),
      ('Negro Clásico', 'NG', 'Doble Línea',  'DL', 0,  11)
  ),
  inserted as (
    insert into public.product_variants (product_id, sku, stock, position)
    select v_product, 'LR-100-' || color_code || '-' || sheet_code, stock, pos
    from combos
    returning id, sku
  )
  insert into public.product_variant_values (variant_id, option_value_id)
  select i.id, ov.id
  from inserted i
  join combos c on i.sku = 'LR-100-' || c.color_code || '-' || c.sheet_code
  join public.product_option_values ov
    on (ov.option_id = v_color and ov.label = c.color)
    or (ov.option_id = v_sheet and ov.label = c.sheet);

  -- Recommendations for the notebook
  insert into public.product_recommendations (product_id, recommended_product_id, position)
  select v_product, p.id, r.pos
  from (values ('lapiz-mongol-2hb', 0), ('sharpie-set-4u', 1), ('prismacolor-12u', 2)) as r (slug, pos)
  join public.products p on p.slug = r.slug;
end;
$$;

update public.products set badge_label = '4 Colores'  where slug = 'sharpie-set-4u';
update public.products set badge_label = '12 Colores' where slug = 'prismacolor-12u';
