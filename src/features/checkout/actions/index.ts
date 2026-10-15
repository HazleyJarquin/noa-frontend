"use server";

import type { CheckoutCustomer, CheckoutItemInput, CheckoutResult } from "../constants";
import { createOrderWithPayment, isUuid } from "../services/orders";

const PHONE_PATTERN = /^[+\d][\d\s-]{7,19}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server Actions are public endpoints: validate everything that comes from the browser
export const startCheckout = async (
  customer: CheckoutCustomer,
  items: CheckoutItemInput[],
): Promise<CheckoutResult> => {
  const name = customer?.name?.trim() ?? "";
  const phone = customer?.phone?.trim() ?? "";
  const email = customer?.email?.trim() ?? "";

  if (name.length < 2 || name.length > 120) return { ok: false, error: "Escribe tu nombre." };
  if (!PHONE_PATTERN.test(phone)) return { ok: false, error: "Escribe un teléfono válido." };
  if (email && !EMAIL_PATTERN.test(email)) return { ok: false, error: "El correo no es válido." };
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    return { ok: false, error: "Tu carrito está vacío." };
  }

  const cleanItems = items
    .filter((item) => isUuid(item?.variantId) && Number.isInteger(item?.quantity))
    .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));

  try {
    return await createOrderWithPayment(
      { name, phone, email, notes: customer.notes?.slice(0, 500) },
      cleanItems,
    );
  } catch (error) {
    console.error("[checkout] failed", error);
    return { ok: false, error: "No pudimos crear tu pedido. Intenta de nuevo." };
  }
};
