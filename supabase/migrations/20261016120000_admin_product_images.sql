-- Admin panel for product photos: reorder without hitting the (product_id, position) unique rule.
-- Swapping two positions makes them collide halfway; a DEFERRABLE constraint is checked
-- at the end of the transaction instead of on every row.

alter table public.product_images
  drop constraint product_images_product_id_position_key;

alter table public.product_images
  add constraint product_images_product_id_position_key
  unique (product_id, position) deferrable initially immediate;

-- Sets positions 0..n-1 following the given order (0 = cover).
-- Images of the product not in the list are left untouched.
create function public.reorder_product_images(p_product_id uuid, p_image_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  set constraints public.product_images_product_id_position_key deferred;

  update public.product_images i
  set position = o.ordinality - 1
  from unnest(p_image_ids) with ordinality as o (id, ordinality)
  where i.id = o.id
    and i.product_id = p_product_id;
end;
$$;

revoke all on function public.reorder_product_images(uuid, uuid[]) from public, anon, authenticated;
