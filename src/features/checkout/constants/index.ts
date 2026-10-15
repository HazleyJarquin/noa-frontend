export type OrderStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";

export type CheckoutItemInput = {
  variantId: string;
  quantity: number;
};

export type CheckoutCustomer = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
};

export type CheckoutResult =
  | { ok: true; paymentUrl: string; orderId: string }
  | { ok: false; error: string; unavailable?: { variantId: string; available: number }[] };

// How long the customer has to finish paying in Poket
export const PAYMENT_WINDOW_MINUTES = 30;

export const getOrderHref = (orderId: string) => `/pedido/${orderId}`;
