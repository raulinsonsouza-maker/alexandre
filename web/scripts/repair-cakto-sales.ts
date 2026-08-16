import { PrismaClient } from "@prisma/client";
import { caktoGet, caktoPut } from "../src/lib/cakto";

const prisma = new PrismaClient();
const ACCESS = "https://alexandre.symbius.com.br/academia";
const SALES = "https://alexandre.symbius.com.br/planos";
const LOGO = "https://alexandre.symbius.com.br/brand/gold-badge.png";

function catId(category: unknown): string | undefined {
  if (!category) return undefined;
  if (typeof category === "string") return category;
  if (typeof category === "object" && category && "id" in category) {
    return String((category as { id: string }).id);
  }
  return undefined;
}

async function repair(productId: string, offerId: string, plan: { name: string; priceCents: number }) {
  const product = (await caktoGet<Record<string, unknown>>(`/products/${productId}/`)) || {};
  const offer = offerId
    ? ((await caktoGet<Record<string, unknown>>(`/offers/${offerId}/`)) || {})
    : {};

  console.log(
    JSON.stringify({
      plan: plan.name,
      productStatus: product.status,
      offerStatus: offer.status,
      deliveries: product.contentDeliveries,
      category: product.category,
      offerId: offer.id || offerId,
    }),
  );

  const productBody: Record<string, unknown> = {
    name: product.name || `Jornada SAP EWM — ${plan.name}`,
    description: product.description || plan.name,
    price: product.price ?? (plan.priceCents / 100).toFixed(2),
    type: product.type || "unique",
    status: "active",
    image: LOGO,
    guarantee: product.guarantee ?? 7,
    salesPage: SALES,
    emailAccessLink: ACCESS,
    contentDeliveries: ["external"],
    supportWhatsapp: "+5511974389297",
    supportEmail: "contato@bestoneit.com.br",
  };
  const category = catId(product.category);
  if (category) productBody.category = category;

  await caktoPut(`/products/${productId}/`, productBody);
  console.log(`produto ${productId} reativado (entrega externa)`);

  if (offerId) {
    await caktoPut(`/offers/${offerId}/`, {
      name: offer.name || String(product.name || plan.name),
      price: offer.price ?? plan.priceCents / 100,
      status: "active",
      type: "unique",
      intervalType: "lifetime",
      interval: 1,
      units: 1,
    });
    console.log(`oferta ${offerId} ativa`);
  }
}

async function main() {
  const plans = await prisma.plan.findMany({
    where: { slug: { in: ["base", "pro", "expert"] } },
  });
  for (const plan of plans) {
    if (!plan.caktoProductId) continue;
    await repair(plan.caktoProductId, plan.caktoOfferId || "", {
      name: plan.name,
      priceCents: plan.priceCents,
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
