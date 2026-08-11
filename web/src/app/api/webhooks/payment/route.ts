import { prisma } from "@/lib/prisma";
import { markOrderPaidAndEnroll } from "@/lib/payment";
import { NextResponse } from "next/server";

/**
 * Webhook idempotente de pagamento.
 * Aceita providers demo/pagarme. Em produção, valide assinatura (PAGARME_WEBHOOK_SECRET).
 */
export async function POST(req: Request) {
  const provider = process.env.PAYMENT_PROVIDER || "demo";
  const secret = process.env.PAGARME_WEBHOOK_SECRET;
  if (provider === "pagarme" && secret) {
    const sig = req.headers.get("x-hub-signature") || req.headers.get("x-pagarme-signature");
    if (sig !== secret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload = await req.json();
  const eventId = String(payload.id || payload.event_id || payload.data?.id || "");
  const orderId = String(payload.orderId || payload.data?.orderId || payload.data?.metadata?.orderId || "");
  const status = String(payload.status || payload.data?.status || "");

  if (!eventId) return NextResponse.json({ error: "Missing event id" }, { status: 400 });

  const existing = await prisma.webhookEvent.findUnique({
    where: { provider_eventId: { provider, eventId } },
  });
  if (existing?.processedAt) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const event = existing
    ? existing
    : await prisma.webhookEvent.create({
        data: { provider, eventId, payload },
      });

  if (orderId && ["paid", "PAID", "authorized"].includes(status)) {
    await markOrderPaidAndEnroll({
      orderId,
      gatewayPaymentId: eventId,
    });
  }

  await prisma.webhookEvent.update({
    where: { id: event.id },
    data: { processedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
