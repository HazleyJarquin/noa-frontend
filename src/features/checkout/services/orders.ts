import "server-only";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import {
  getOrderHref,
  PAYMENT_WINDOW_MINUTES,
  type CheckoutCustomer,
  type CheckoutItemInput,
  type CheckoutResult,
  type OrderStatus,
} from "../constants";
import { sendPaidOrderEmail } from "./notifications";
import { cancelPaylink, createPaylink, getExternalLinkId, getPaylink } from "./poket";

const MAX_QUANTITY_PER_LINE = 99;

// Builds the order from the database, never from the browser: prices and stock come
// from Supabase, the cart only says which variants and how many.
export const createOrderWithPayment = async (
  customer: CheckoutCustomer,
  items: CheckoutItemInput[],
): Promise<CheckoutResult> => {
  const supabase = createAdminClient();

  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) continue;
    quantities.set(
      item.variantId,
      Math.min((quantities.get(item.variantId) ?? 0) + item.quantity, MAX_QUANTITY_PER_LINE),
    );
  }
  if (quantities.size === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select(
      "id, stock, price, product:products!inner(id, name, price), product_variant_values(option_value:product_option_values(label, position))",
    )
    .in("id", [...quantities.keys()]);

  if (variantsError) throw new Error(`No se pudo validar el carrito: ${variantsError.message}`);

  const unavailable: { variantId: string; available: number }[] = [];
  for (const [variantId, quantity] of quantities) {
    const variant = variants.find((row) => row.id === variantId);
    const available = variant?.stock ?? 0;
    if (available < quantity) unavailable.push({ variantId, available });
  }
  if (unavailable.length > 0) {
    return {
      ok: false,
      error: "Algunos productos ya no tienen el stock que pediste. Ajustamos tu carrito.",
      unavailable,
    };
  }

  const lines = variants.map((variant) => {
    const quantity = quantities.get(variant.id)!;
    const unitPrice = Number(variant.price ?? variant.product.price);
    const variantLabel = variant.product_variant_values
      .map((value) => value.option_value)
      .sort((a, b) => a.position - b.position)
      .map((value) => value.label)
      .join(" · ");
    return {
      product_id: variant.product.id,
      variant_id: variant.id,
      name: variant.product.name,
      variant_label: variantLabel || null,
      unit_price: unitPrice,
      quantity,
      line_total: Math.round(unitPrice * quantity * 100) / 100,
    };
  });
  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.line_total, 0) * 100) / 100;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      customer_email: customer.email?.trim() || null,
      notes: customer.notes?.trim() || null,
      subtotal,
      // No delivery for now: total = subtotal
      total: subtotal,
    })
    .select("id, number")
    .single();

  if (orderError) throw new Error(`No se pudo crear el pedido: ${orderError.message}`);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(lines.map((line) => ({ ...line, order_id: order.id })));

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(`No se pudo guardar el pedido: ${itemsError.message}`);
  }

  // Poket only redirects to absolute https URLs; without SITE_URL the payer stays on the voucher
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  const callbackUrl = siteUrl?.startsWith("https://")
    ? `${siteUrl}${getOrderHref(order.id)}`
    : undefined;
  const expiresAt = new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000);

  try {
    const paylink = await createPaylink({
      amount: subtotal,
      description: `Pedido NOA #${order.number}`,
      expiresAt,
      callbackUrl,
    });

    await supabase
      .from("orders")
      .update({
        paylink_id: paylink.id,
        paylink_external_id: getExternalLinkId(paylink.permanent_link),
        payment_url: paylink.permanent_link ?? null,
        payment_expires_at: expiresAt.toISOString(),
      })
      .eq("id", order.id);

    if (!paylink.permanent_link) throw new Error("Poket no devolvió el enlace de pago");

    return { ok: true, paymentUrl: paylink.permanent_link, orderId: order.id };
  } catch (error) {
    await supabase
      .from("orders")
      .update({
        status: "failed",
        payment_error: error instanceof Error ? error.message : String(error),
      })
      .eq("id", order.id);
    console.error("[checkout] paylink creation failed", error);
    return {
      ok: false,
      error: "No pudimos conectar con Pocket LAFISE. Intenta de nuevo en unos minutos.",
    };
  }
};

// Source of truth is Poket's GET (webhooks aren't retried and aren't signed).
// Safe to call many times: mark_order_paid only discounts stock once.
export const syncOrderPayment = async (orderId: string): Promise<OrderStatus | null> => {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, paylink_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return null;
  if (order.status !== "pending" || !order.paylink_id) return order.status as OrderStatus;

  const paylink = await getPaylink(order.paylink_id);

  if ((paylink.payment_count ?? 0) > 0 || paylink.status === "Resolved") {
    const { data: firstTime, error } = await supabase.rpc("mark_order_paid", {
      p_order_id: order.id,
    });
    if (error) throw new Error(`No se pudo confirmar el pedido: ${error.message}`);
    // Only the call that actually marked it paid notifies the store (no duplicate emails)
    if (firstTime) await sendPaidOrderEmail(order.id);
    return "paid";
  }

  const finalStatus: Partial<Record<typeof paylink.status, OrderStatus>> = {
    Expired: "expired",
    Cancelled: "cancelled",
  };
  const expired = new Date(paylink.expiration_date).getTime() < Date.now();
  const status = finalStatus[paylink.status] ?? (expired ? "expired" : null);

  if (status) {
    await supabase.from("orders").update({ status }).eq("id", order.id).eq("status", "pending");
    if (status === "expired" && paylink.status !== "Expired") {
      // Make sure nobody can pay a link we already gave up on
      await cancelPaylink(order.paylink_id).catch(() => undefined);
    }
    return status;
  }

  // A failed attempt doesn't close a SingleUse link: the customer can retry until it expires
  return "pending";
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value);

export const findOrderIdByPaylink = async (paylinkOrExternalId: string) => {
  // The value goes into a PostgREST filter string: only accept a plain UUID
  if (!isUuid(paylinkOrExternalId)) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("id")
    .or(`paylink_external_id.eq.${paylinkOrExternalId},paylink_id.eq.${paylinkOrExternalId}`)
    .maybeSingle();
  return data?.id ?? null;
};

export const getOrderSummary = async (orderId: string) => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, number, status, customer_name, total, payment_url, payment_expires_at, created_at, order_items(name, variant_label, quantity, line_total)",
    )
    .eq("id", orderId)
    .maybeSingle();
  return data;
};
