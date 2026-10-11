-- Product gallery: up to 5 images per product (position 0 is the cover).
-- The minimum of 3 is validated by the admin Server Action when publishing,
-- because images are uploaded one at a time.

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  path        text not null, -- path inside the "products" Storage bucket
  alt         text,
  position    smallint not null check (position between 0 and 4),
  created_at  timestamptz not null default now(),
  unique (product_id, position)
);

create index product_images_product_id_idx on public.product_images (product_id);

alter table public.product_images enable row level security;

create policy "Product images are public"
  on public.product_images for select
  to anon, authenticated
  using (true);

grant select on public.product_images to anon, authenticated;

-- Images now live in product_images
alter table public.products drop column image_path;
