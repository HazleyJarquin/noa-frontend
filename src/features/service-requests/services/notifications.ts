import "server-only";

import { Resend } from "resend";
import { escapeHtml, getCustomerWhatsAppUrl, getNotificationEmailConfig } from "@/shared/lib/email";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import {
  COLOR_MODE_LABELS,
  PAPER_SIZE_LABELS,
  SIDES_LABELS,
  STORAGE_BUCKET,
  type PrintOptions,
  type ServiceKind,
} from "../constants";

const LINK_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days

const SUBJECT_PREFIX: Record<ServiceKind, string> = {
  crafts: "🎨 Nueva manualidad",
  printing: "🖨️ Nueva impresión",
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

type StoredFile = { path: string; name: string; size: number };

// Notifies the store about a new crafts/printing request. Never throws: the request
// is already saved in Supabase even if the email fails.
export const sendServiceRequestEmail = async (requestId: string) => {
  try {
    const config = getNotificationEmailConfig();
    if (!config) {
      console.warn("[service request email] skipped: missing Resend configuration");
      return;
    }

    const supabase = createAdminClient();
    const { data: request, error } = await supabase
      .from("service_requests")
      .select("kind, customer_name, customer_phone, notes, options, files")
      .eq("id", requestId)
      .single();
    if (error) throw error;

    const kind = request.kind as ServiceKind;
    const files = request.files as StoredFile[];
    const options = request.options as Partial<PrintOptions>;
    const whatsappUrl = getCustomerWhatsAppUrl(request.customer_phone);

    // Private bucket: temporary download links
    const { data: signed, error: signError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(
        files.map((file) => file.path),
        LINK_EXPIRES_IN_SECONDS,
      );
    if (signError) throw signError;

    const fileRows = files
      .map((file, index) => {
        const url = signed?.[index]?.signedUrl;
        const label = `${escapeHtml(file.name)} <span style="color:#6b6b80">(${formatSize(file.size)})</span>`;
        return `<li style="margin:4px 0">${url ? `<a href="${url}" style="color:#4F46E5">${label}</a>` : label}</li>`;
      })
      .join("");

    const printDetails =
      kind === "printing" && options.colorMode
        ? `
        <h3 style="color:#131451;margin:20px 0 6px;font-size:15px">Opciones de impresión</h3>
        <p style="margin:0;line-height:1.7">
          ${COLOR_MODE_LABELS[options.colorMode]} ·
          ${options.copies ?? 1} ${options.copies === 1 ? "copia" : "copias"} ·
          ${options.paperSize ? PAPER_SIZE_LABELS[options.paperSize] : ""} ·
          ${options.sides ? SIDES_LABELS[options.sides] : ""}
        </p>`
        : "";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#141A35">
        <h2 style="color:#131451;margin:0 0 4px">${SUBJECT_PREFIX[kind]}</h2>
        <p style="margin:0 0 16px;color:#6b6b80">Solicitud desde la web de NOA Librería</p>

        <h3 style="color:#131451;margin:16px 0 6px;font-size:15px">Cliente</h3>
        <p style="margin:0;line-height:1.6">
          <strong>${escapeHtml(request.customer_name)}</strong><br>
          Tel: <a href="${whatsappUrl}" style="color:#4F46E5">${escapeHtml(request.customer_phone)} (WhatsApp)</a>
        </p>

        ${request.notes ? `
        <h3 style="color:#131451;margin:20px 0 6px;font-size:15px">Nota del cliente</h3>
        <p style="margin:0;white-space:pre-line">${escapeHtml(request.notes)}</p>` : ""}

        ${printDetails}

        <h3 style="color:#131451;margin:20px 0 6px;font-size:15px">Archivos</h3>
        <ul style="margin:0;padding-left:18px">${fileRows}</ul>
        <p style="margin:6px 0 0;font-size:12px;color:#6b6b80">Los links vencen en 7 días. Los archivos quedan en Supabase Storage → ${STORAGE_BUCKET}.</p>

        <p style="margin:24px 0 0">
          <a href="${whatsappUrl}" style="background:#131451;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Escribir al cliente por WhatsApp
          </a>
        </p>
      </div>`;

    const { error: sendError } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: config.to,
      subject: `${SUBJECT_PREFIX[kind]} — ${request.customer_name}`,
      html,
    });
    if (sendError) throw sendError;
  } catch (error) {
    console.error("[service request email] failed", { requestId, error });
  }
};
