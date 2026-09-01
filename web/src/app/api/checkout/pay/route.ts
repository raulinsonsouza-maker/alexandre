import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userAlreadyHasModuleAccess, userAlreadyHasPlanAccess } from "@/lib/access";
import {
  caktoCreatePixPayment,
  caktoCreateThreeDsPayment,
  type CaktoThreeDSecure,
} from "@/lib/cakto";
import {
  extractGatewayPayload,
  mpCreateOrder,
  mpOrderIsFailed,
  mpOrderIsPaid,
  type MpPayerAddress,
} from "@/lib/mercadopago";
import { markOrderPaidAndEnroll } from "@/lib/payment";
import { nanoid } from "nanoid";
import { randomUUID } from "node:crypto";
import type { PaymentMethod } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type PayMethod = "pix" | "card" | "boleto";

type PayBody = {
  planSlug?: string;
  moduleSlug?: string;
  method?: PayMethod;
  cardToken?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  issuerId?: string;
  installments?: number;
  threeDSecure?: CaktoThreeDSecure;
  antifraudRef?: string;
  customerDoc?: string;
  customerPhone?: string;
  fingerprint?: string;
  address?: {
    zipCode?: string;
    streetName?: string;
    streetNumber?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function toE164Phone(raw: string) {
  const d = digitsOnly(raw);
  if (!d) return "";
  if (d.startsWith("55") && d.length >= 12) return d;
  if (d.length >= 10 && d.length <= 11) return `55${d}`;
  return d;
}

function paymentProvider() {
  return process.env.PAYMENT_PROVIDER || "demo";
}

function toDbMethod(method: PayMethod): PaymentMethod {
  if (method === "pix") return "PIX";
  if (method === "boleto") return "BOLETO";
  return "CARD";
}

function parseMethod(raw: unknown): PayMethod | null {
  if (raw === "pix" || raw === "card" || raw === "boleto") return raw;
  return null;
}

async function ensurePendingOrder(params: {
  userId: string;
  planId?: string;
  moduleId?: string;
  title: string;
  priceCents: number;
  paymentMethod: PaymentMethod;
}) {
  const existing = await prisma.order.findFirst({
    where: {
      userId: params.userId,
      status: "PENDING",
      gateway: paymentProvider(),
      items: {
        some: params.planId
          ? { planId: params.planId }
          : { moduleId: params.moduleId },
      },
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  if (existing) {
    return prisma.order.update({
      where: { id: existing.id },
      data: { paymentMethod: params.paymentMethod, totalCents: params.priceCents },
      include: { items: true },
    });
  }

  return prisma.order.create({
    data: {
      userId: params.userId,
      status: "PENDING",
      paymentMethod: params.paymentMethod,
      totalCents: params.priceCents,
      gateway: paymentProvider(),
      idempotencyKey: `${paymentProvider()}_${nanoid()}`,
      items: {
        create: [
          {
            ...(params.planId ? { planId: params.planId } : { moduleId: params.moduleId }),
            title: params.title,
            priceCents: params.priceCents,
            quantity: 1,
          },
        ],
      },
    },
    include: { items: true },
  });
}

function parseAddress(raw: PayBody["address"]): MpPayerAddress | null {
  if (!raw) return null;
  const zip = digitsOnly(String(raw.zipCode || ""));
  const street_name = String(raw.streetName || "").trim();
  const street_number = String(raw.streetNumber || "").trim() || "N/A";
  const neighborhood = String(raw.neighborhood || "").trim();
  const city = String(raw.city || "").trim();
  const state = String(raw.state || "")
    .trim()
    .toUpperCase()
    .slice(0, 2);
  if (zip.length !== 8 || !street_name || !neighborhood || !city || state.length !== 2) {
    return null;
  }
  return { zip_code: zip, street_name, street_number, neighborhood, city, state };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ ok: false, error: "Faça login para pagar." }, { status: 401 });
  }

  const provider = paymentProvider();
  if (provider === "demo") {
    return NextResponse.json(
      { ok: false, error: "Use o fluxo demo em /checkout (liberação automática)." },
      { status: 400 },
    );
  }
  if (provider !== "cakto" && provider !== "mercadopago") {
    return NextResponse.json({ ok: false, error: "Gateway não suportado." }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as PayBody;
  const method = parseMethod(body.method);
  if (!method) {
    return NextResponse.json(
      { ok: false, error: "Método inválido (pix, cartão ou boleto)." },
      { status: 400 },
    );
  }
  if (provider === "cakto" && method === "boleto") {
    return NextResponse.json({ ok: false, error: "Boleto indisponível neste gateway." }, { status: 400 });
  }

  const planSlug = String(body.planSlug || "").trim();
  const moduleSlug = String(body.moduleSlug || "").trim();
  if (!planSlug && !moduleSlug) {
    return NextResponse.json({ ok: false, error: "Informe o plano ou módulo." }, { status: 400 });
  }

  const doc = digitsOnly(String(body.customerDoc || ""));
  if (doc.length !== 11 && doc.length !== 14) {
    return NextResponse.json({ ok: false, error: "Informe um CPF ou CNPJ válido." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "Usuário não encontrado." }, { status: 401 });
  }

  const phone = toE164Phone(String(body.customerPhone || user.phone || ""));
  if (provider === "cakto" && phone.length < 12) {
    return NextResponse.json(
      { ok: false, error: "Informe um telefone com DDD (ex.: 11999999999)." },
      { status: 400 },
    );
  }

  const fingerprint = String(body.fingerprint || "").trim() || `fp_${user.id}`;

  let offerId = "";
  let title = "";
  let priceCents = 0;
  let planId: string | undefined;
  let moduleId: string | undefined;

  if (planSlug) {
    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan || !plan.published || !plan.checkoutEnabled) {
      return NextResponse.json({ ok: false, error: "Plano indisponível." }, { status: 400 });
    }
    if (plan.priceCents <= 0) {
      return NextResponse.json({ ok: false, error: "Plano sem preço para checkout." }, { status: 400 });
    }
    if (await userAlreadyHasPlanAccess(user.id, plan.id)) {
      return NextResponse.json({ ok: false, error: "Você já possui este plano." }, { status: 400 });
    }
    if (provider === "cakto") {
      if (!plan.caktoOfferId) {
        return NextResponse.json(
          { ok: false, error: "Plano ainda não vinculado à Cakto." },
          { status: 400 },
        );
      }
      offerId = plan.caktoOfferId;
    }
    title = `Plano ${plan.name}`;
    priceCents = plan.priceCents;
    planId = plan.id;
  } else {
    const mod = await prisma.module.findUnique({ where: { slug: moduleSlug } });
    if (!mod || !mod.published) {
      return NextResponse.json({ ok: false, error: "Módulo indisponível." }, { status: 400 });
    }
    if (mod.priceCents <= 0) {
      return NextResponse.json(
        { ok: false, error: "Este módulo é bônus e não possui checkout." },
        { status: 400 },
      );
    }
    if (await userAlreadyHasModuleAccess(user.id, mod.id)) {
      return NextResponse.json({ ok: false, error: "Você já tem acesso a este módulo." }, { status: 400 });
    }
    if (provider === "cakto") {
      if (!mod.caktoOfferId) {
        return NextResponse.json(
          { ok: false, error: "Módulo ainda não vinculado à Cakto." },
          { status: 400 },
        );
      }
      offerId = mod.caktoOfferId;
    }
    title = mod.title;
    priceCents = mod.priceCents;
    moduleId = mod.id;
  }

  const order = await ensurePendingOrder({
    userId: user.id,
    planId,
    moduleId,
    title,
    priceCents,
    paymentMethod: toDbMethod(method),
  });

  try {
    if (provider === "mercadopago") {
      return await payMercadoPago({
        orderId: order.id,
        title,
        priceCents,
        method,
        userName: user.name,
        userEmail: user.email,
        doc,
        body,
      });
    }

    const customer = {
      name: user.name,
      email: user.email,
      phone,
      fingerprint,
      docType: (doc.length === 14 ? "cnpj" : "cpf") as "cpf" | "cnpj",
      docNumber: doc,
    };
    const idempotencyKey = randomUUID();
    const base = {
      customer,
      items: [{ offerId, quantity: 1, offerType: "main" as const }],
      metadata: { sck: order.id },
    };

    if (method === "pix") {
      const payment = await caktoCreatePixPayment(base, idempotencyKey);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          gatewayPaymentId: payment.id,
          paymentMethod: "PIX",
        },
      });
      return NextResponse.json({
        ok: true,
        status: payment.status,
        orderId: order.id,
        caktoOrderId: payment.id,
        pix: {
          qrCode: payment.pix?.qrCode || "",
          qrCodeBase64: payment.pix?.qrCodeBase64 || "",
          expiresAt: payment.pix?.expiresAt || null,
        },
      });
    }

    const cardToken = String(body.cardToken || "").trim();
    if (!cardToken) {
      return NextResponse.json({ ok: false, error: "Token do cartão ausente." }, { status: 400 });
    }

    const payment = await caktoCreateThreeDsPayment(
      {
        ...base,
        cardToken,
        threeDSecure: body.threeDSecure,
      },
      idempotencyKey,
    );

    await prisma.order.update({
      where: { id: order.id },
      data: {
        gatewayPaymentId: payment.id,
        paymentMethod: "CARD",
      },
    });

    const status = String(payment.status || "").toLowerCase();
    if (status === "paid" || status === "approved") {
      await markOrderPaidAndEnroll({ orderId: order.id, gatewayPaymentId: payment.id });
      return NextResponse.json({
        ok: true,
        status: "paid",
        orderId: order.id,
        caktoOrderId: payment.id,
        redirectUrl: "/academia?purchased=1",
      });
    }

    if (status === "declined" || status === "refused" || status === "failed") {
      return NextResponse.json(
        { ok: false, error: "Pagamento recusado. Tente outro cartão ou Pix.", status },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: payment.status,
      orderId: order.id,
      caktoOrderId: payment.id,
      pending: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao processar pagamento";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

async function payMercadoPago(params: {
  orderId: string;
  title: string;
  priceCents: number;
  method: PayMethod;
  userName: string;
  userEmail: string;
  doc: string;
  body: PayBody;
}) {
  const address = params.method === "boleto" ? parseAddress(params.body.address) : undefined;
  if (params.method === "boleto" && !address) {
    return NextResponse.json(
      { ok: false, error: "Preencha CEP, rua, número, bairro, cidade e UF para o boleto." },
      { status: 400 },
    );
  }

  const mpOrder = await mpCreateOrder(
    {
      externalReference: params.orderId,
      amountCents: params.priceCents,
      description: params.title,
      payerEmail: params.userEmail,
      payerName: params.userName,
      identificationType: params.doc.length === 14 ? "CNPJ" : "CPF",
      identificationNumber: params.doc,
      method: params.method,
      card:
        params.method === "card"
          ? {
              token: String(params.body.cardToken || "").trim(),
              paymentMethodId: String(params.body.paymentMethodId || "").trim(),
              paymentTypeId: String(params.body.paymentTypeId || "credit_card").trim(),
              installments: Number(params.body.installments || 1),
              issuerId: String(params.body.issuerId || "").trim() || undefined,
            }
          : undefined,
      address: address || undefined,
    },
    randomUUID(),
  );

  const payload = extractGatewayPayload(mpOrder);
  await prisma.order.update({
    where: { id: params.orderId },
    data: {
      gatewayPaymentId: mpOrder.id,
      paymentMethod: toDbMethod(params.method),
      gatewayPayload: payload as Prisma.InputJsonValue,
    },
  });

  if (mpOrderIsPaid(mpOrder)) {
    await markOrderPaidAndEnroll({ orderId: params.orderId, gatewayPaymentId: mpOrder.id });
    return NextResponse.json({
      ok: true,
      status: "paid",
      orderId: params.orderId,
      mpOrderId: mpOrder.id,
      redirectUrl: "/academia?purchased=1",
    });
  }

  if (mpOrderIsFailed(mpOrder)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Pagamento recusado. Tente outro cartão, Pix ou boleto.",
        status: mpOrder.status,
        statusDetail: mpOrder.status_detail,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    status: mpOrder.status,
    statusDetail: mpOrder.status_detail,
    orderId: params.orderId,
    mpOrderId: mpOrder.id,
    pending: true,
    pix: payload.pix || null,
    boleto: payload.boleto || null,
  });
}
