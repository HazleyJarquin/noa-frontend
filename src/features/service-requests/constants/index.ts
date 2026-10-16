// Shared by the form (browser) and the server: no secrets here

export type ServiceKind = "crafts" | "printing";

export type ColorMode = "color" | "bw";
export type PaperSize = "letter" | "legal" | "oficio";
export type PrintSides = "single" | "double";

export type PrintOptions = {
  colorMode: ColorMode;
  copies: number;
  paperSize: PaperSize;
  sides: PrintSides;
};

export type ServiceCustomer = {
  name: string;
  phone: string;
  notes?: string;
};

export type UploadFileInput = { name: string; size: number; type: string };

export type PrepareUploadsResult =
  | { ok: true; requestId: string; uploads: { path: string; token: string }[] }
  | { ok: false; error: string };

export type SubmitRequestResult = { ok: true } | { ok: false; error: string };

export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // must match the bucket's file_size_limit
export const MAX_NOTES_LENGTH = 1000;
export const MAX_COPIES = 100;

export const STORAGE_BUCKET = "service-requests";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const PDF_TYPE = "application/pdf";
const OFFICE_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const ALLOWED_TYPES: Record<ServiceKind, string[]> = {
  crafts: [...IMAGE_TYPES, PDF_TYPE],
  printing: [PDF_TYPE, ...OFFICE_TYPES, ...IMAGE_TYPES],
};

export const ALLOWED_TYPES_HINT: Record<ServiceKind, string> = {
  crafts: "Fotos (JPG, PNG, HEIC) o PDF",
  printing: "PDF, Word, Excel, PowerPoint o imágenes",
};

export const SERVICE_LABELS: Record<ServiceKind, string> = {
  crafts: "Manualidad",
  printing: "Impresión",
};

export const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  color: "A color",
  bw: "Blanco y negro",
};

export const PAPER_SIZE_LABELS: Record<PaperSize, string> = {
  letter: "Carta",
  legal: "Legal",
  oficio: "Oficio",
};

export const SIDES_LABELS: Record<PrintSides, string> = {
  single: "Una cara",
  double: "Ambas caras",
};

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  colorMode: "bw",
  copies: 1,
  paperSize: "letter",
  sides: "single",
};
