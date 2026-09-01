import crypto from "node:crypto";

const MP_API = "https://api.mercadopago.com";

export type MpPaymentMethod = "pix" | "card" | "boleto";

export type MpPayerAddress = {
  zip_code: string;
  street_name: string;
  street_number: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type MpCreateOrderInput = {
  externalReference: string;
  amountCents: number;
  description: string;
  payerEmail: string;
  payerName: string;
  identificationType: "CPF" | "CNPJ";
  identificationNumber: string;
  method: MpPaymentMethod;
  card?: {
    token: string;
    paymentMethodId: string;
    paymentTypeId: string;
    installments: number;
    issuerId?: string;
  };
  address?: MpPayerAddress;
};

export type MpPixPayload = {
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl?: string;
};

export type MpBoletoPayload = {
  ticketUrl: string;
  digitableLine: string;
  barcodeContent?: string;
};

export type MpGatewayPayload = {
  mpOrderId: string;
  status: string;
  statusDetail: string;
  pix?: MpPixPayload;
  boleto?: MpBoletoPayload;
};

export type MpOrder = {
  id?: string;
  status?: string;
  status_detail?: string;
  external_reference?: string;
  total_amount?: string;
  transactions?: {
    payments?: Array<{
      id?: string;
      status?: string;
      status_detail?: string;
      amount?: string;
      payment_method?: {
        id?: string;
        type?: string;
        ticket_url?: string;
        qr_code?: string;
        qr_code_base64?: string;
        barcode_content?: string;
        digitable_line?: string;
        token?: string;
        installments?: number;
      };
    }>;
  };
  errors?: Array<{ code?: string; message?: string; details?: unknown }>;
  message?: string;
};

function accessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  if (!token) throw new Error("Mercado Pago não configurado (ACCESS_TOKEN ausente).");
  return token;
}

export function centsToAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

export function splitPersonName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  const first_name = parts[0] || "Aluno";
  const last_name = parts.slice(1).join(" ") || first_name;
  return { first_name, last_name };
}

function firstPayment(order: MpOrder) {
  return order.transactions?.payments?.[0];
}

export function extractGatewayPayload(order: MpOrder): MpGatewayPayload {
  const pay = firstPayment(order);
  const method = pay?.payment_method;
  const payload: MpGatewayPayload = {
    mpOrderId: String(order.id || ""),
    status: String(order.status || pay?.status || ""),
    statusDetail: String(order.status_detail || pay?.status_detail || ""),
  };
  if (method?.qr_code || method?.qr_code_base64) {
    payload.pix = {
      qrCode: method.qr_code || "",
      qrCodeBase64: method.qr_code_base64 || "",
      ticketUrl: method.ticket_url,
    };
  }
  if (method?.type === "ticket" || method?.digitable_line || method?.barcode_content) {
    payload.boleto = {
      ticketUrl: method.ticket_url || "",
      digitableLine: method.digitable_line || "",
      barcodeContent: method.barcode_content,
    };
  }
  return payload;
}

export function mpOrderIsPaid(order: MpOrder) {
  const status = String(order.status || "").toLowerCase();
  const detail = String(order.status_detail || "").toLowerCase();
  const pay = firstPayment(order);
  const payStatus = String(pay?.status || "").toLowerCase();
  const payDetail = String(pay?.status_detail || "").toLowerCase();
  if (status === "processed" && (detail === "accredited" || detail === "partially_accredited" || !detail)) {
    return true;
  }
  if (payStatus === "processed" && (payDetail === "accredited" || payDetail === "partially_accredited")) {
    return true;
  }
  return false;
}

export function mpOrderIsRefunded(order: MpOrder) {
  const status = String(order.status || "").toLowerCase();
  const detail = String(order.status_detail || "").toLowerCase();
  const pay = firstPayment(order);
  const payStatus = String(pay?.status || "").toLowerCase();
  const payDetail = String(pay?.status_detail || "").toLowerCase();
  const values = [status, detail, payStatus, payDetail];
  return values.some((v) =>
    ["refunded", "charged_back", "chargedback", "partially_refunded"].includes(v),
  );
}

export function mpOrderIsFailed(order: MpOrder) {
  const status = String(order.status || "").toLowerCase();
  const detail = String(order.status_detail || "").toLowerCase();
  return ["cancelled", "canceled", "expired", "failed"].includes(status) ||
    ["rejected", "cc_rejected_other_reason", "failed"].includes(detail);
}

function errorMessage(order: MpOrder, fallback: string) {
  const first = order.errors?.[0];
  if (first?.message) return first.message;
  if (order.message) return order.message;
  if (order.status_detail) return `Pagamento: ${order.status_detail}`;
  return fallback;
}

async function mpFetch(path: string, init: RequestInit & { idempotencyKey?: string } = {}) {
  const { idempotencyKey, ...rest } = init;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> | undefined),
  };
  if (idempotencyKey) headers["X-Idempotency-Key"] = idempotencyKey;

  const res = await fetch(`${MP_API}${path}`, { ...rest, headers });
  const text = await res.text();
  let json: MpOrder = {};
  try {
    json = text ? (JSON.parse(text) as MpOrder) : {};
  } catch {
    throw new Error(`Mercado Pago resposta inválida: ${text.slice(0, 400)}`);
  }
  if (!res.ok) {
    throw new Error(errorMessage(json, `Mercado Pago ${res.status}`));
  }
  return json;
}

export async function mpCreateOrder(input: MpCreateOrderInput, idempotencyKey: string) {
  const amount = centsToAmount(input.amountCents);
  const names = splitPersonName(input.payerName);
  const payer: Record<string, unknown> = {
    email: input.payerEmail,
    first_name: names.first_name,
    last_name: names.last_name,
    identification: {
      type: input.identificationType,
      number: input.identificationNumber,
    },
  };
  if (input.address) {
    payer.address = input.address;
  }

  let payment: Record<string, unknown>;
  if (input.method === "pix") {
    payment = {
      amount,
      payment_method: { id: "pix", type: "bank_transfer" },
      expiration_time: "PT24H",
    };
  } else if (input.method === "boleto") {
    payment = {
      amount,
      payment_method: { id: "boleto", type: "ticket" },
      expiration_time: "P3D",
    };
  } else {
    const card = input.card;
    if (!card?.token) throw new Error("Token do cartão ausente.");
    if (!card.paymentMethodId) throw new Error("Bandeira do cartão ausente.");
    payment = {
      amount,
      payment_method: {
        id: card.paymentMethodId,
        type: card.paymentTypeId || "credit_card",
        token: card.token,
        installments: Math.max(1, card.installments || 1),
        ...(card.issuerId ? { issuer_id: card.issuerId } : {}),
      },
    };
  }

  const body = {
    type: "online",
    processing_mode: "automatic",
    total_amount: amount,
    external_reference: input.externalReference,
    description: input.description,
    payer,
    transactions: { payments: [payment] },
  };

  const created = await mpFetch("/v1/orders", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
  if (!created.id) throw new Error("Mercado Pago não retornou o id da cobrança.");
  return created as MpOrder & { id: string };
}

export async function mpGetOrder(orderId: string) {
  const order = await mpFetch(`/v1/orders/${encodeURIComponent(orderId)}`);
  if (!order.id) order.id = orderId;
  return order;
}

export function verifyMercadoPagoSignature(req: Request, bodyDataId?: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
  if (!secret) return false;

  const xSignature = req.headers.get("x-signature") || "";
  const xRequestId = req.headers.get("x-request-id") || "";
  const url = new URL(req.url);
  let dataId =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    bodyDataId ||
    "";
  dataId = dataId.toLowerCase();

  const parts: Record<string, string> = {};
  for (const chunk of xSignature.split(",")) {
    const idx = chunk.indexOf("=");
    if (idx === -1) continue;
    parts[chunk.slice(0, idx).trim()] = chunk.slice(idx + 1).trim();
  }
  const ts = parts.ts || "";
  const v1 = parts.v1 || "";
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
