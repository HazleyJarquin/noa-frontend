import "server-only";

// Poket PayLinks API (docs: "Documentación de Paylinks por Poket" v1).
// Server-only: the PAT gives full access to the merchant account.

type PoketConfig = {
  apiUrl: string;
  merchantId: string;
  terminalId: string;
  pat: string;
};

const getConfig = (): PoketConfig => {
  const config = {
    apiUrl: process.env.POKET_API_URL,
    merchantId: process.env.POKET_MERCHANT_ID,
    terminalId: process.env.POKET_TERMINAL_ID,
    pat: process.env.POKET_PAT,
  };
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de Poket en .env.local: ${missing.join(", ")}`);
  }
  return config as PoketConfig;
};

export type PaylinkStatus =
  | "Created"
  | "InProgress"
  | "Resolved"
  | "Expired"
  | "Cancelled"
  | "Failed";

export type Paylink = {
  id: string;
  status: PaylinkStatus;
  permanent_link?: string;
  payment_count?: number;
  expiration_date: string;
};

export class PoketError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const { apiUrl, merchantId, pat } = getConfig();
  const response = await fetch(`${apiUrl}/api/v1/merchants/${merchantId}/paylinks${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      // Raw PAT, no "Bearer" prefix (per the Poket docs)
      Authorization: pat,
      "Content-Type": "application/json",
      "x-platform": "api-integration-noa-libreria",
      ...init.headers,
    },
  });

  if (!response.ok) {
    // Problem Details (RFC 7807) or an API Gateway message
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? body?.message ?? body?.Message ?? response.statusText;
    throw new PoketError(`Poket ${response.status}: ${detail}`, response.status);
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
};

type CreatePaylinkInput = {
  amount: number;
  description: string;
  expiresAt: Date;
  callbackUrl?: string;
};

export const createPaylink = ({ amount, description, expiresAt, callbackUrl }: CreatePaylinkInput) =>
  request<Paylink>("", {
    method: "POST",
    body: JSON.stringify({
      amount: Math.round(amount * 100) / 100,
      currency: "NIO",
      description,
      type: "SingleUse",
      max_usages: 1,
      terminal_id: getConfig().terminalId,
      expiration_date: expiresAt.toISOString(),
      ...(callbackUrl && { callback_url: callbackUrl, callback_time: 5 }),
    }),
  });

export const getPaylink = (paylinkId: string) => request<Paylink>(`/${paylinkId}`);

export const cancelPaylink = (paylinkId: string) =>
  request<void>(`/${paylinkId}`, { method: "DELETE" });

// SingleUse links: https://pagoconpoket.com/payment/{externalLinkId}. Webhooks identify the
// payment by that UUID (external_link_id), not by the PayLink id.
export const getExternalLinkId = (permanentLink?: string) =>
  permanentLink?.match(/\/payment\/([0-9a-f-]{36})/i)?.[1] ?? null;
