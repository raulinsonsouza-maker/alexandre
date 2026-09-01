import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  mpGetOrder,
  mpOrderIsFailed,
  mpOrderIsPaid,
  mpOrderIsRefunded,
  verifyMercadoPagoSignature,
  type MpOrder,
} from "@/lib/mercadopago";
import { markOrderPaidAndEnroll, markOrderRefundedAndRevoke } from "@/lib/payment";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type WebhookBody = {
  action?: string;
  type?: string;
  data?: { id?: string };
  id?: string | number;
};

function eventKey(action: string, mpOrderId: string) {
  return `${action || "order"}:${mpOrderId}`;
}

async function findLocalOrder(mpOrder: MpOrder) {
  const external = String(mpOrder.external_reference || "").trim();
  if (external) {
    const byRef = await prisma.order.findUnique({ where: { id: external } });
    if (byRef) return byRef;
  }
  if (mpOrder.id) {
    return prisma.order.findFirst({
      where: { gateway: "mercadopago", gatewayPaymentId: mpOrder.id },
    });
  }
  return null;
}

async function applyMpOrder(mpOrder: MpOrder) {
  const local = await findLocalOrder(mpOrder);
  if (!local) {
    console.error("mercadopago webhook: pedido local não encontrado", {
      mpOrderId: mpOrder.id,
      external_reference: mpOrder.external_reference,
    });
    return;
  }

  if (mpOrderIsPaid(mpOrder)) {
    await markOrderPaidAndEnroll({
      orderId: local.id,
      gatewayPaymentId: mpOrder.id,
    });
    return;
  }

  if (mpOrderIsRefunded(mpOrder)) {
    await markOrderRefundedAndRevoke({
      orderId: local.id,
      gatewayPaymentId: mpOrder.id,
    });
    return;
  }

  if (mpOrderIsFailed(mpOrder) && local.status === "PENDING") {
    await prisma.order.update({
      where: { id: local.id },
      data: { status: "FAILED", gatewayPaymentId: mpOrder.id },
    });
  }
}

export async function POST(req: Request) {
  if (!process.env.MERCADOPAGO_WEBHOOK_SECRET || !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as WebhookBody | null;
  const dataId = String(body?.data?.id || body?.id || "");
  if (!verifyMercadoPagoSignature(req, dataId)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mpOrderId = dataId;
  if (!mpOrderId) {
    return NextResponse.json({ error: "missing data.id" }, { status: 400 });
  }

  const action = String(body?.action || body?.type || "order");
  const eventId = eventKey(action, mpOrderId);
  const existing = await prisma.webhookEvent.findUnique({
    where: { provider_eventId: { provider: "mercadopago", eventId } },
  });
  if (existing?.processedAt) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const stored =
    existing ||
    (await prisma.webhookEvent.create({
      data: { provider: "mercadopago", eventId, payload: (body || {}) as Prisma.InputJsonValue },
    }));

  try {
    const mpOrder = await mpGetOrder(mpOrderId);
    await applyMpOrder(mpOrder);
  } catch (err) {
    console.error("mercadopago webhook processing failed", err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  await prisma.webhookEvent.update({
    where: { id: stored.id },
    data: { processedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
