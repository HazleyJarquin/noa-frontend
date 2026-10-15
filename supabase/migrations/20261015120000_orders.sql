-- Orders + items for the online checkout (paid with Poket PayLinks, picked up in store).
-- Only the server writes here, using the secret key: RLS is on with no policies,
-- so the publishable key can neither read nor write orders.

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  number              bigint generated always as identity unique, -- human-friendly "Pedido #1024"
  status              text not null default 'pending'
                      check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  customer_name       text not null check (length(trim(customer_name)) between 2 and 120),
  customer_phone      text not null check (length(trim(customer_phone)) between 8 and 20),
  customer_email      text,
  notes               text,
  subtotal            numeric(10, 2) not null check (subtotal >= 0),
  total               numeric(10, 2) not null check (total >= 0),
  currency            text not null default 'NIO',
  -- Poket PayLink
  paylink_id          uuid unique,
  paylink_external_id uuid unique, -- UUID in the permanent_link; webhooks send it as external_link_id
  payment_url         text,
  payment_expires_at  timestamptz,
  payment_error       text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid not null references public.products (id),
  variant_id    uuid not null references public.product_variants (id),
  name          text not null,
  variant_label text,
  unit_price    numeric(10, 2) not null check (unit_price >= 0),
  quantity      int not null check (quantity > 0),
  line_total    numeric(10, 2) not null check (line_total >= 0)
);

create index orders_status_idx on public.orders (status);
create index order_items_order_id_idx on public.order_items (order_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Marks an order as paid and takes its items out of stock, atomically and only once
-- (webhook and return page may both call it). Stock never goes below 0: if it was
-- already sold out, the payment still stands and the order must be handled manually.
create function public.mark_order_paid(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  select status into v_status from public.orders where id = p_order_id for update;

  if v_status is null then
    raise exception 'Order % not found', p_order_id;
  end if;
  if v_status = 'paid' then
    return false;
  end if;

  update public.product_variants v
  set stock = greatest(v.stock - i.quantity, 0)
  from (
    select variant_id, sum(quantity) as quantity
    from public.order_items
    where order_id = p_order_id
    group by variant_id
  ) i
  where v.id = i.variant_id;

  update public.orders
  set status = 'paid', paid_at = now(), payment_error = null
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.mark_order_paid(uuid) from public, anon, authenticated;
