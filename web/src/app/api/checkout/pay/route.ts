import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userAlreadyHasModuleAccess, userAlreadyHasPlanAccess } from "@/lib/access";
import {
  caktoCreatePixPayment,
  caktoCreateThreeDsPayment,
  type CaktoThreeDSecure,
} from "@/lib/cakto";
import { markOrderPaidAndEnroll } from "@/lib/payment";
import { nanoid } from "nanoid";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

type PayBody = {
  planSlug?: string;
  moduleSlug?: string;
  method?: "pix" | "card";
  cardToken?: string;
  threeDSecure?: CaktoThreeDSecure;
  antifraudRef?: string;
  customerDoc?: string;
  customerPhone?: string;
  fingerprint?: string;
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

async function ensurePendingOrder(params: {
  userId: string;
  planId?: string;
  moduleId?: string;
  title: string;
  priceCents: number;
  paymentMethod: "PIX" | "CARD";
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
  if (provider !== "cakto") {
    return NextResponse.json({ ok: false, error: "Gateway não suportado." }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as PayBody;
  const method = body.method === "card" ? "card" : body.method === "pix" ? "pix" : null;
  if (!method) {
    return NextResponse.json({ ok: false, error: "Método inválido (pix ou card)." }, { status: 400 });
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
  if (phone.length < 12) {
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
    if (await userAlreadyHasPlanAccess(user.id, plan.id)) {
      return NextResponse.json({ ok: false, error: "Você já possui este plano." }, { status: 400 });
    }
    if (!plan.caktoOfferId) {
      return NextResponse.json(
        { ok: false, error: "Plano ainda não vinculado à Cakto." },
        { status: 400 },
      );
    }
    offerId = plan.caktoOfferId;
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
    if (!mod.caktoOfferId) {
      return NextResponse.json(
        { ok: false, error: "Módulo ainda não vinculado à Cakto." },
        { status: 400 },
      );
    }
    offerId = mod.caktoOfferId;
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
    paymentMethod: method === "pix" ? "PIX" : "CARD",
  });

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
    // metadata pública só aceita utm_* e sck
    metadata: { sck: order.id },
  };

  try {
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
