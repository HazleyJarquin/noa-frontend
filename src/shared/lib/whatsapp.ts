// Store WhatsApp: 8161 5603 with Nicaragua's country code (+505), digits only for wa.me
export const WHATSAPP_NUMBER = "50581615603";

export const getWhatsAppUrl = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
