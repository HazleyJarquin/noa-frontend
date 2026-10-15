import { after } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { findOrderIdByPaylink, syncOrderPayment } from "@/features/checkout/services/orders";

// Poket PayLinks webhooks (StartPayment / FinishPayment share this URL).
// Poket doesn't sign payloads: Basic auth configured in the Poket portal, and the
// payment is always re-checked against Poket's API before marking an order as paid.

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

const isAuthorized = (request: Request) => {
  const user = process.env.POKET_WEBHOOK_USER;
  const password = process.env.POKET_WEBHOOK_PASSWORD;
  if (!user || !password) return false;

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator < 0) return false;

  return (
    safeEqual(decoded.slice(0, separator), user) &&
    safeEqual(decoded.slice(separator + 1), password)
  );
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  // StartPayment only means the payer opened the card form
  if (body?.event_type !== "FinishPayment" || typeof body.external_link_id !== "string") {
    return Response.json({ received: true });
  }

  // Poket doesn't wait for our response nor retry: answer now, verify afterwards
  after(async () => {
    try {
      const orderId = await findOrderIdByPaylink(body.external_link_id);
      if (!orderId) return;
      const status = await syncOrderPayment(orderId);
      console.info("[poket webhook] order synced", { orderId, status, poketStatus: body.status });
    } catch (error) {
      console.error("[poket webhook] sync failed", error);
    }
  });

  return Response.json({ received: true });
}
