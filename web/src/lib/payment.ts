import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { purchaseEmailHtml, sendEmail } from "@/lib/email";
import { userAlreadyHasModuleAccess, userAlreadyHasPlanAccess } from "@/lib/access";
import { nanoid } from "nanoid";

async function applyCoupon(code: string | undefined, total: number) {
  if (!code) return { total, couponCode: undefined as string | undefined };
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (
    !coupon ||
    !coupon.active ||
    (coupon.expiresAt && coupon.expiresAt <= new Date()) ||
    (coupon.maxRedemptions && coupon.redemptionCount >= coupon.maxRedemptions)
  ) {
    return { total, couponCode: undefined as string | undefined };
  }
  let next = total;
  if (coupon.percentOff) next = Math.round(next * (1 - coupon.percentOff / 100));
  if (coupon.amountOffCents) next = Math.max(0, next - coupon.amountOffCents);
  await prisma.coupon.update({
    where: { id: coupon.id },
    data: { redemptionCount: { increment: 1 } },
  });
  return { total: next, couponCode: coupon.code };
}

export async function markOrderPaidAndEnroll(params: {
  orderId: string;
  gatewayPaymentId?: string;
  actorId?: string | null;
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true, user: true },
  });
  if (!order) throw new Error("Pedido não encontrado");
  if (order.status === "PAID") return order;

  const updated = await prisma.$transaction(async (tx) => {
    const paid = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        gatewayPaymentId: params.gatewayPaymentId || order.gatewayPaymentId,
      },
      include: { items: true, user: true },
    });

    for (const item of paid.items) {
      if (item.planId) {
        const existing = await tx.enrollment.findFirst({
          where: { userId: paid.userId, planId: item.planId, status: "ACTIVE" },
        });
        if (!existing) {
          await tx.enrollment.create({
            data: {
              userId: paid.userId,
              planId: item.planId,
              source: "checkout",
              status: "ACTIVE",
            },
          });
        }
        continue;
      }

      if (item.moduleId) {
        const existing = await tx.enrollment.findFirst({
          where: { userId: paid.userId, moduleId: item.moduleId, status: "ACTIVE" },
        });
        if (!existing) {
          await tx.enrollment.create({
            data: {
              userId: paid.userId,
              moduleId: item.moduleId,
              source: "checkout",
              status: "ACTIVE",
            },
          });
        }
        continue;
      }

      if (item.courseId) {
        const existing = await tx.enrollment.findFirst({
          where: { userId: paid.userId, courseId: item.courseId, status: "ACTIVE" },
        });
        if (!existing) {
          await tx.enrollment.create({
            data: {
              userId: paid.userId,
              courseId: item.courseId,
              source: "checkout",
              status: "ACTIVE",
            },
          });
        }
      }
    }

    return paid;
  });

  await writeAudit({
    actorId: params.actorId || null,
    action: "order.paid_enroll",
    entityType: "Order",
    entityId: order.id,
    meta: { gatewayPaymentId: params.gatewayPaymentId },
  });

  await sendEmail({
    to: updated.user.email,
    subject: "Compra aprovada — Jornada SAP EWM",
    html: purchaseEmailHtml(updated.user.name, updated.id),
  });

  return updated;
}

export async function createDemoCheckout(params: {
  userId: string;
  planSlug?: string;
  moduleSlug?: string;
  courseId?: string;
  couponCode?: string;
}) {
  if (params.planSlug) {
    const plan = await prisma.plan.findUnique({ where: { slug: params.planSlug } });
    if (!plan || !plan.published || !plan.checkoutEnabled) {
      throw new Error("Plano indisponível para checkout");
    }
    if (await userAlreadyHasPlanAccess(params.userId, plan.id)) {
      throw new Error("Você já possui este plano");
    }

    const { total, couponCode } = await applyCoupon(params.couponCode, plan.priceCents);
    const order = await prisma.order.create({
      data: {
        userId: params.userId,
        status: "PENDING",
        paymentMethod: "PIX",
        totalCents: total,
        couponCode,
        gateway: process.env.PAYMENT_PROVIDER || "demo",
        idempotencyKey: `demo_${nanoid()}`,
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
    });

    if ((process.env.PAYMENT_PROVIDER || "demo") === "demo") {
      return markOrderPaidAndEnroll({ orderId: order.id, gatewayPaymentId: `demo_${nanoid()}` });
    }
    return order;
  }

  if (params.moduleSlug) {
    const mod = await prisma.module.findUnique({ where: { slug: params.moduleSlug } });
    if (!mod || !mod.published) throw new Error("Módulo indisponível");
    if (await userAlreadyHasModuleAccess(params.userId, mod.id)) {
      throw new Error("Você já tem acesso a este módulo");
    }

    const { total, couponCode } = await applyCoupon(params.couponCode, mod.priceCents);
    const order = await prisma.order.create({
      data: {
        userId: params.userId,
        status: "PENDING",
        paymentMethod: "PIX",
        totalCents: total,
        couponCode,
        gateway: process.env.PAYMENT_PROVIDER || "demo",
        idempotencyKey: `demo_${nanoid()}`,
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
    });

    if ((process.env.PAYMENT_PROVIDER || "demo") === "demo") {
      return markOrderPaidAndEnroll({ orderId: order.id, gatewayPaymentId: `demo_${nanoid()}` });
    }
    return order;
  }

  // Legado: curso completo
  const courseId =
    params.courseId ||
    (await prisma.course.findFirst({ where: { published: true } }))?.id;
  if (!courseId) throw new Error("Curso indisponível");
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) throw new Error("Curso indisponível");

  const { total, couponCode } = await applyCoupon(params.couponCode, course.priceCents);
  const order = await prisma.order.create({
    data: {
      userId: params.userId,
      status: "PENDING",
      paymentMethod: "PIX",
      totalCents: total,
      couponCode,
      gateway: process.env.PAYMENT_PROVIDER || "demo",
      idempotencyKey: `demo_${nanoid()}`,
      items: {
        create: [
          {
            courseId: course.id,
            title: course.title,
            priceCents: course.priceCents,
            quantity: 1,
          },
        ],
      },
    },
  });

  if ((process.env.PAYMENT_PROVIDER || "demo") === "demo") {
    return markOrderPaidAndEnroll({ orderId: order.id, gatewayPaymentId: `demo_${nanoid()}` });
  }
  return order;
}
