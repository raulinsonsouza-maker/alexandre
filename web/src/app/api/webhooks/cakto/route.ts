import { prisma } from "@/lib/prisma";
import { markOrderPaidAndEnroll, markOrderRefundedAndRevoke } from "@/lib/payment";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

type CaktoPayload = {
  secret?: string;
  event?: string;
  data?: {
    id?: string;
    status?: string;
    customer?: { email?: string; name?: string };
    product?: { id?: string; short_id?: string; name?: string };
    offer?: { id?: string; name?: string; price?: number };
  };
};

function secretsMatch(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function eventKey(event: string, orderId: string) {
  return `${event}:${orderId}`;
}

export async function POST(req: Request) {
  const expected = process.env.CAKTO_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as CaktoPayload | null;
  if (!body || !secretsMatch(String(body.secret || ""), expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const event = String(body.event || "");
  const data = body.data || {};
  const caktoOrderId = String(data.id || "");
  if (!event || !caktoOrderId) {
    return NextResponse.json({ error: "missing event" }, { status: 400 });
  }

  const eventId = eventKey(event, caktoOrderId);
  const existing = await prisma.webhookEvent.findUnique({
    where: { provider_eventId: { provider: "cakto", eventId } },
  });
  if (existing?.processedAt) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const stored =
    existing ||
    (await prisma.webhookEvent.create({
      data: { provider: "cakto", eventId, payload: body as object },
    }));

  try {
    if (event === "purchase_approved") {
      await handleApproved(data, caktoOrderId);
    } else if (event === "refund" || event === "chargeback") {
      await handleRefund(caktoOrderId);
    }
  } catch (err) {
    console.error("cakto webhook processing failed", err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  await prisma.webhookEvent.update({
    where: { id: stored.id },
    data: { processedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

async function findPlan(data: NonNullable<CaktoPayload["data"]>) {
  const productId = data.product?.id || data.product?.short_id;
  const offerId = data.offer?.id;
  if (productId) {
    const byProduct = await prisma.plan.findFirst({ where: { caktoProductId: String(productId) } });
    if (byProduct) return byProduct;
  }
  if (offerId) {
    const byOffer = await prisma.plan.findFirst({ where: { caktoOfferId: String(offerId) } });
    if (byOffer) return byOffer;
  }
  return null;
}

async function findModule(data: NonNullable<CaktoPayload["data"]>) {
  const productId = data.product?.id || data.product?.short_id;
  const offerId = data.offer?.id;
  if (productId) {
    const byProduct = await prisma.module.findFirst({ where: { caktoProductId: String(productId) } });
    if (byProduct) return byProduct;
  }
  if (offerId) {
    const byOffer = await prisma.module.findFirst({ where: { caktoOfferId: String(offerId) } });
    if (byOffer) return byOffer;
  }
  return null;
}

async function handleApproved(data: NonNullable<CaktoPayload["data"]>, caktoOrderId: string) {
  const email = String(data.customer?.email || "")
    .trim()
    .toLowerCase();

  const plan = await findPlan(data);
  const mod = plan ? null : await findModule(data);

  if (!plan && !mod) {
    console.error("cakto: produto não encontrado (plano/módulo)", {
      product: data.product,
      offer: data.offer,
    });
    return;
  }

  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user) {
    console.error("cakto: usuário não encontrado para", email, "pedido", caktoOrderId);
    return;
  }

  const alreadyPaid = await prisma.order.findFirst({
    where: { gateway: "cakto", gatewayPaymentId: caktoOrderId, status: "PAID" },
  });
  if (alreadyPaid) return;

  if (plan) {
    const pending = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
        gateway: "cakto",
        items: { some: { planId: plan.id } },
      },
      orderBy: { createdAt: "desc" },
    });

    const orderId =
      pending?.id ||
      (
        await prisma.order.create({
          data: {
            userId: user.id,
            status: "PENDING",
            paymentMethod: "PIX",
            totalCents: plan.priceCents,
            gateway: "cakto",
            gatewayPaymentId: caktoOrderId,
            items: {
              create: [
                {
                  planId: plan.id,
                  title: `Plano ${plan.name}`,
                  priceCents: plan.priceCents,
                  quantity: 1,
                },
              ],
            },
          },
        })
      ).id;

    await markOrderPaidAndEnroll({ orderId, gatewayPaymentId: caktoOrderId });
    return;
  }

  if (mod) {
    const pending = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
        gateway: "cakto",
        items: { some: { moduleId: mod.id } },
      },
      orderBy: { createdAt: "desc" },
    });

    const orderId =
      pending?.id ||
      (
        await prisma.order.create({
          data: {
            userId: user.id,
            status: "PENDING",
            paymentMethod: "PIX",
            totalCents: mod.priceCents,
            gateway: "cakto",
            gatewayPaymentId: caktoOrderId,
            items: {
              create: [
                {
                  moduleId: mod.id,
                  title: mod.title,
                  priceCents: mod.priceCents,
                  quantity: 1,
                },
              ],
            },
          },
        })
      ).id;

    await markOrderPaidAndEnroll({ orderId, gatewayPaymentId: caktoOrderId });
  }
}

async function handleRefund(caktoOrderId: string) {
  const order = await prisma.order.findFirst({
    where: { gateway: "cakto", gatewayPaymentId: caktoOrderId },
  });
  if (!order) {
    console.error("cakto: pedido para reembolso não encontrado", caktoOrderId);
    return;
  }
  await markOrderRefundedAndRevoke({ orderId: order.id, gatewayPaymentId: caktoOrderId });
}
