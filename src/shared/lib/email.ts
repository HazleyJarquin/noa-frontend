// Helpers shared by the store notification emails (orders, service requests)

// Customer-typed text goes into the HTML: escape it
export const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

// wa.me needs digits only; local 8-digit numbers get Nicaragua's +505
export const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 8 ? `505${digits}` : digits;
};

export const getCustomerWhatsAppUrl = (phone: string) =>
  `https://wa.me/${toWhatsAppNumber(phone)}`;

// Store inbox(es) for notifications; null when email isn't configured
export const getNotificationEmailConfig = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  const to = process.env.ORDER_NOTIFICATION_EMAIL?.split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (!apiKey || !from || !to?.length) return null;
  return { apiKey, from, to };
};
