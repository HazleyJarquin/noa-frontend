import "server-only";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import {
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES,
  STORAGE_BUCKET,
  type PrepareUploadsResult,
  type PrintOptions,
  type ServiceCustomer,
  type ServiceKind,
  type SubmitRequestResult,
  type UploadFileInput,
} from "../constants";
import { sendServiceRequestEmail } from "./notifications";

// Storage keys can't have accents or odd characters: keep a readable, safe name
const toSafeFileName = (name: string) => {
  const clean = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (clean || "archivo").slice(-80);
};

const getFolder = (kind: ServiceKind, requestId: string) => `${kind}/${requestId}`;

// Step 1: validate the files and hand out one signed upload permission per file.
// The browser uploads straight to Storage, so files never go through our server.
export const prepareUploads = async (
  kind: ServiceKind,
  files: UploadFileInput[],
): Promise<PrepareUploadsResult> => {
  if (files.length === 0) return { ok: false, error: "Agrega al menos un archivo." };
  if (files.length > MAX_FILES) {
    return { ok: false, error: `Puedes subir hasta ${MAX_FILES} archivos.` };
  }
  for (const file of files) {
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return { ok: false, error: `"${file.name}" pesa más de 20 MB.` };
    }
    if (!ALLOWED_TYPES[kind].includes(file.type)) {
      return { ok: false, error: `"${file.name}" no es un tipo de archivo permitido.` };
    }
  }

  const supabase = createAdminClient();
  const requestId = crypto.randomUUID();
  const folder = getFolder(kind, requestId);

  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const path = `${folder}/${index + 1}-${toSafeFileName(file.name)}`;
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(path);
      if (error) throw new Error(`No se pudo preparar la subida: ${error.message}`);
      return { path: data.path, token: data.token };
    }),
  );

  return { ok: true, requestId, uploads };
};

type SubmitInput = {
  requestId: string;
  kind: ServiceKind;
  customer: ServiceCustomer;
  printOptions?: PrintOptions;
};

// Step 2: after the uploads, save the request and notify the store.
export const submitRequest = async ({
  requestId,
  kind,
  customer,
  printOptions,
}: SubmitInput): Promise<SubmitRequestResult> => {
  const supabase = createAdminClient();
  const folder = getFolder(kind, requestId);

  // Trust Storage, not the browser: list what was really uploaded
  const { data: stored, error: listError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folder, { limit: MAX_FILES + 1 });
  if (listError) throw new Error(`No se pudieron leer los archivos: ${listError.message}`);

  const files = (stored ?? [])
    .filter((item) => item.id) // folders have no id
    .slice(0, MAX_FILES)
    .map((item) => ({
      path: `${folder}/${item.name}`,
      name: item.name.replace(/^\d+-/, ""),
      size: Number(item.metadata?.size ?? 0),
      type: String(item.metadata?.mimetype ?? ""),
    }));

  if (files.length === 0) {
    return { ok: false, error: "No recibimos tus archivos. Vuelve a intentarlo." };
  }

  const { error: insertError } = await supabase.from("service_requests").insert({
    id: requestId,
    kind,
    customer_name: customer.name,
    customer_phone: customer.phone,
    notes: customer.notes || null,
    options: kind === "printing" && printOptions ? printOptions : {},
    files,
  });

  if (insertError) {
    // Same requestId sent twice (double click): already saved, nothing else to do
    if (insertError.code === "23505") return { ok: true };
    throw new Error(`No se pudo guardar la solicitud: ${insertError.message}`);
  }

  await sendServiceRequestEmail(requestId);
  return { ok: true };
};
