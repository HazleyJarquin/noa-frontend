// Store WhatsApp from NEXT_PUBLIC_WHATSAPP_NUMBER: digits only, with country code (e.g. 50581615603).
// NEXT_PUBLIC_ because client components (menu, request forms) build the links too;
// the store's number is public anyway. Inlined at build time: redeploy after changing it.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

if (!WHATSAPP_NUMBER) {
  console.warn("Falta NEXT_PUBLIC_WHATSAPP_NUMBER en .env.local: los botones de WhatsApp no tendrán número");
}

export const getWhatsAppUrl = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
