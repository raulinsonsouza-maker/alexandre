const DEFAULT_BASE = "https://api.cakto.com.br/public_api";

type TokenCache = { accessToken: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

function apiBase() {
  return (process.env.CAKTO_API_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

export async function caktoGetToken() {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }
  const clientId = process.env.CAKTO_CLIENT_ID;
  const clientSecret = process.env.CAKTO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET não configurados");
  }

  const res = await fetch(`${apiBase()}/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "AlexandreJornadaEWM/1.0 (+https://alexandre.symbius.com.br)",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(`Cakto auth falhou: ${res.status} ${data.error || JSON.stringify(data)}`);
  }
  const ttl = Number(data.expires_in || 36000) * 1000;
  tokenCache = { accessToken: data.access_token, expiresAt: now + ttl };
  return data.access_token;
}

async function caktoFetch(path: string, init: RequestInit = {}) {
  const token = await caktoGetToken();
  const url = path.startsWith("http") ? path : `${apiBase()}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("User-Agent", "AlexandreJornadaEWM/1.0 (+https://alexandre.symbius.com.br)");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Cakto ${init.method || "GET"} ${path} → ${res.status}: ${text.slice(0, 800)}`);
  }
  return json;
}

export function caktoGet<T = unknown>(path: string) {
  return caktoFetch(path) as Promise<T>;
}

export function caktoPost<T = unknown>(path: string, body: unknown) {
  return caktoFetch(path, { method: "POST", body: JSON.stringify(body) }) as Promise<T>;
}

export function caktoPut<T = unknown>(path: string, body: unknown) {
  return caktoFetch(path, { method: "PUT", body: JSON.stringify(body) }) as Promise<T>;
}

export function caktoDelete(path: string) {
  return caktoFetch(path, { method: "DELETE" });
}

export function payUrlForOffer(offerId: string) {
  return `https://pay.cakto.com.br/${offerId}`;
}

export type CaktoPaymentCustomer = {
  name: string;
  email: string;
  phone: string;
  fingerprint: string;
  docType?: "cpf" | "cnpj";
  docNumber?: string;
  birthDate?: string;
  ip?: string;
};

export type CaktoThreeDSecure = {
  cavv?: string;
  eci?: string;
  xid?: string;
  referenceId?: string;
  version?: string;
  dataOnly?: boolean;
};

export type CaktoPaymentResponse = {
  id: string;
  refId?: string;
  status: string;
  paymentMethod?: string;
  amount?: string;
  externalId?: string;
  checkoutUrl?: string;
  pix?: {
    qrCode?: string;
    qrCodeBase64?: string;
    expiresAt?: string;
  };
};

export type CaktoCreatePaymentBase = {
  customer: CaktoPaymentCustomer;
  items: Array<{ offerId: string; quantity?: number; offerType?: "main" }>;
  /** Coletado no browser; a API pública atual rejeita o campo no body. */
  antifraudProfilingAttemptReference?: string;
  metadata?: Record<string, unknown>;
  coupon?: string;
};

export async function caktoCreatePayment(
  payload: Record<string, unknown>,
  idempotencyKey: string,
): Promise<CaktoPaymentResponse> {
  const token = await caktoGetToken();
  const res = await fetch(`${apiBase()}/payments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
      "User-Agent": "AlexandreJornadaEWM/1.0 (+https://alexandre.symbius.com.br)",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json: CaktoPaymentResponse & { detail?: unknown; message?: string; error?: string } = {
    id: "",
    status: "error",
  };
  try {
    json = text ? JSON.parse(text) : json;
  } catch {
    throw new Error(`Cakto payments resposta inválida: ${text.slice(0, 400)}`);
  }
  if (!res.ok) {
    const msg =
      (typeof json.message === "string" && json.message) ||
      (typeof json.error === "string" && json.error) ||
      text.slice(0, 800);
    throw new Error(`Pagamento Cakto falhou (${res.status}): ${msg}`);
  }
  return json as CaktoPaymentResponse;
}

export function caktoCreatePixPayment(
  input: CaktoCreatePaymentBase & { pixExpiresIn?: number },
  idempotencyKey: string,
) {
  return caktoCreatePayment(
    {
      paymentMethod: "pix",
      customer: input.customer,
      items: input.items.map((i) => ({
        offerId: i.offerId,
        quantity: i.quantity ?? 1,
        offerType: i.offerType ?? "main",
      })),
      // API pública rejeita antifraudProfilingAttemptReference (docs ≠ OpenAPI).
      ...(input.metadata ? { metadata: input.metadata } : {}),
      ...(input.coupon ? { coupon: input.coupon } : {}),
      ...(input.pixExpiresIn ? { pixExpiresIn: input.pixExpiresIn } : {}),
    },
    idempotencyKey,
  );
}

export function caktoCreateThreeDsPayment(
  input: CaktoCreatePaymentBase & {
    cardToken: string;
    threeDSecure?: CaktoThreeDSecure;
  },
  idempotencyKey: string,
) {
  return caktoCreatePayment(
    {
      paymentMethod: "threeDs",
      customer: input.customer,
      items: input.items.map((i) => ({
        offerId: i.offerId,
        quantity: i.quantity ?? 1,
        offerType: i.offerType ?? "main",
      })),
      card: { token: input.cardToken },
      ...(input.threeDSecure ? { threeDSecure: input.threeDSecure } : {}),
      // API pública rejeita antifraudProfilingAttemptReference (docs ≠ OpenAPI).
      ...(input.metadata ? { metadata: input.metadata } : {}),
      ...(input.coupon ? { coupon: input.coupon } : {}),
    },
    idempotencyKey,
  );
}
