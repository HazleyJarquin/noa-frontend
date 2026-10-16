import "server-only";

import { Resend } from "resend";
import { formatCordobas } from "@/shared/lib/currency";
import { escapeHtml, getCustomerWhatsAppUrl, getNotificationEmailConfig } from "@/shared/lib/email";
import { createAdminClient } from "@/shared/lib/supabase/admin";

// Notifies the store that an order was paid. Never throws: a failed email must not
// affect the payment confirmation.
export const sendPaidOrderEmail = async (orderId: string) => {
  try {
    const config = getNotificationEmailConfig();
    if (!config) {
      console.warn("[order email] skipped: missing RESEND_API_KEY / ORDER_NOTIFICATION_EMAIL / ORDER_EMAIL_FROM");
      return;
    }
    const { apiKey, from, to } = config;

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "number, customer_name, customer_phone, customer_email, notes, total, paid_at, order_items(name, variant_label, quantity, line_total)",
      )
      .eq("id", orderId)
      .single();
    if (error) throw error;

    const total = formatCordobas(Number(order.total));
    const whatsappUrl = getCustomerWhatsAppUrl(order.customer_phone);

    const rows = order.order_items
      .map(
        (item) => `
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #EEEEF1">
              ${item.quantity} × ${escapeHtml(item.name)}
              ${item.variant_label ? `<br><span style="color:#6b6b80;font-size:12px">${escapeHtml(item.variant_label)}</span>` : ""}
            </td>
            <td style="padding:6px 0;border-bottom:1px solid #EEEEF1;text-align:right;white-space:nowrap">
              ${formatCordobas(Number(item.line_total))}
            </td>
          </tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#141A35">
        <h2 style="color:#131451;margin:0 0 4px">Pedido #${order.number} pagado</h2>
        <p style="margin:0 0 16px;color:#6b6b80">Pagado con Pocket LAFISE · Retiro en tienda</p>

        <h3 style="color:#131451;margin:16px 0 6px;font-size:15px">Cliente</h3>
        <p style="margin:0;line-height:1.6">
          <strong>${escapeHtml(order.customer_name)}</strong><br>
          Tel: <a href="${whatsappUrl}" style="color:#4F46E5">${escapeHtml(order.customer_phone)} (WhatsApp)</a><br>
          ${order.customer_email ? `Correo: ${escapeHtml(order.customer_email)}<br>` : ""}
          ${order.notes ? `Notas: ${escapeHtml(order.notes)}` : ""}
        </p>

        <h3 style="color:#131451;margin:20px 0 6px;font-size:15px">Productos</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows}
          <tr>
            <td style="padding:10px 0;font-weight:bold">Total</td>
            <td style="padding:10px 0;font-weight:bold;text-align:right;color:#131451">${total}</td>
          </tr>
        </table>

        <p style="margin:20px 0 0">
          <a href="${whatsappUrl}" style="background:#131451;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Avisar al cliente por WhatsApp
          </a>
        </p>
      </div>`;

    const { error: sendError } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject: `💰 Pedido #${order.number} pagado — ${total}`,
      html,
    });
    if (sendError) throw sendError;
  } catch (error) {
    console.error("[order email] failed", { orderId, error });
  }
};
