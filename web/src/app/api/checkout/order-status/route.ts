import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  }

  const orderId = new URL(req.url).searchParams.get("orderId")?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "orderId" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { id: true, status: true, paidAt: true },
  });
  if (!order) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    status: order.status,
    paidAt: order.paidAt,
  });
}
