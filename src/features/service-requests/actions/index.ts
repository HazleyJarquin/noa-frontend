"use server";

import { isUuid } from "@/features/checkout/services/orders";
import {
  COLOR_MODE_LABELS,
  MAX_COPIES,
  MAX_FILES,
  MAX_NOTES_LENGTH,
  PAPER_SIZE_LABELS,
  SIDES_LABELS,
  type PrepareUploadsResult,
  type PrintOptions,
  type ServiceCustomer,
  type ServiceKind,
  type SubmitRequestResult,
  type UploadFileInput,
} from "../constants";
import { prepareUploads, submitRequest } from "../services/requests";

const PHONE_PATTERN = /^[+\d][\d\s-]{7,19}$/;
const isServiceKind = (value: unknown): value is ServiceKind =>
  value === "crafts" || value === "printing";

// Server Actions are public endpoints: validate everything that comes from the browser

export const prepareServiceRequestUploads = async (
  kind: ServiceKind,
  files: UploadFileInput[],
): Promise<PrepareUploadsResult> => {
  if (!isServiceKind(kind)) return { ok: false, error: "Solicitud inválida." };
  if (!Array.isArray(files) || files.length > MAX_FILES) {
    return { ok: false, error: `Puedes subir hasta ${MAX_FILES} archivos.` };
  }

  const cleanFiles = files.map((file) => ({
    name: String(file?.name ?? "").slice(0, 200),
    size: Number(file?.size),
    type: String(file?.type ?? ""),
  }));
  if (cleanFiles.some((file) => !file.name || !Number.isFinite(file.size))) {
    return { ok: false, error: "Hay un archivo inválido." };
  }

  try {
    return await prepareUploads(kind, cleanFiles);
  } catch (error) {
    console.error("[service request] prepare failed", error);
    return { ok: false, error: "No pudimos preparar la subida. Intenta de nuevo." };
  }
};

type SubmitInput = {
  requestId: string;
  kind: ServiceKind;
  customer: ServiceCustomer;
  printOptions?: PrintOptions;
  // Hidden field humans never fill: if it has a value, it's a bot
  website?: string;
};

export const submitServiceRequest = async (input: SubmitInput): Promise<SubmitRequestResult> => {
  if (input?.website) return { ok: true }; // pretend success, store nothing

  if (!isServiceKind(input?.kind) || !isUuid(input?.requestId)) {
    return { ok: false, error: "Solicitud inválida." };
  }

  const name = input.customer?.name?.trim() ?? "";
  const phone = input.customer?.phone?.trim() ?? "";
  const notes = input.customer?.notes?.trim() ?? "";
  if (name.length < 2 || name.length > 120) return { ok: false, error: "Escribe tu nombre." };
  if (!PHONE_PATTERN.test(phone)) return { ok: false, error: "Escribe un teléfono válido." };
  if (notes.length > MAX_NOTES_LENGTH) {
    return { ok: false, error: `La nota puede tener hasta ${MAX_NOTES_LENGTH} caracteres.` };
  }

  let printOptions: PrintOptions | undefined;
  if (input.kind === "printing") {
    const options = input.printOptions;
    const copies = Number(options?.copies);
    if (
      !options ||
      !Object.hasOwn(COLOR_MODE_LABELS, options.colorMode) ||
      !Object.hasOwn(PAPER_SIZE_LABELS, options.paperSize) ||
      !Object.hasOwn(SIDES_LABELS, options.sides) ||
      !Number.isInteger(copies) ||
      copies < 1 ||
      copies > MAX_COPIES
    ) {
      return { ok: false, error: "Revisa las opciones de impresión." };
    }
    printOptions = {
      colorMode: options.colorMode,
      paperSize: options.paperSize,
      sides: options.sides,
      copies,
    };
  }

  try {
    return await submitRequest({
      requestId: input.requestId,
      kind: input.kind,
      customer: { name, phone, notes },
      printOptions,
    });
  } catch (error) {
    console.error("[service request] submit failed", error);
    return { ok: false, error: "No pudimos enviar tu solicitud. Intenta de nuevo." };
  }
};
