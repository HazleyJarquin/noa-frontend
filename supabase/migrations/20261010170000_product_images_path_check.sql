-- product_images.path must be the file path inside the bucket ("book-1.jpg"),
-- not the full public URL. Fix existing rows and block URLs from now on.

update public.product_images
set path = regexp_replace(path, '^.*/object/public/products/', '')
where path ~ '^https?://';

alter table public.product_images
  add constraint product_images_path_not_url check (path !~ '^https?://');
