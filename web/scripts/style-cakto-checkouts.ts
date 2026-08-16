import { PrismaClient } from "@prisma/client";
import { caktoGet, caktoPut } from "../src/lib/cakto";
import { applyJornadaCheckoutTheme } from "../src/lib/cakto-checkout-theme";

const prisma = new PrismaClient();
const LOGO = "https://alexandre.symbius.com.br/brand/gold-badge.png";

type Paginated<T> = { results?: T[] };

type Checkout = {
  id: string | number;
  name?: string;
  default?: boolean;
  config?: Record<string, unknown> | null;
  offers?: unknown;
};

async function styleProduct(productId: string, offerId: string) {
  try {
    await caktoPut(`/products/${productId}/`, {
      image: LOGO,
      supportWhatsapp: "5511974389297",
      salesPage: "https://alexandre.symbius.com.br/planos",
    });
    console.log(`Produto ${productId}: imagem/suporte atualizados`);
  } catch (err) {
    console.warn(`Produto ${productId}: não atualizou imagem (${err instanceof Error ? err.message : err})`);
  }

  const list = await caktoGet<Paginated<Checkout>>(`/products/${productId}/checkouts/`);
  const checkout = list.results?.find((c) => c.default) || list.results?.[0];
  if (!checkout?.id) {
    console.warn(`Sem checkout para produto ${productId}`);
    return;
  }

  const detail = await caktoGet<Checkout>(`/products/${productId}/checkouts/${checkout.id}/`);
  const config = applyJornadaCheckoutTheme(
    (detail.config || checkout.config || {}) as Record<string, unknown>,
  );

  const body: Record<string, unknown> = {
    name: detail.name || checkout.name || "Checkout Jornada EWM",
    default: true,
    config,
  };
  if (Array.isArray(detail.offers) && detail.offers.length) {
    body.offers = (detail.offers as Array<{ id?: string } | string>).map((o) =>
      typeof o === "string" ? o : String(o.id || offerId),
    );
  } else if (offerId) {
    body.offers = [offerId];
  }

  await caktoPut(`/products/${productId}/checkouts/${checkout.id}/`, body);
  console.log(`Checkout ${checkout.id} estilizado (produto ${productId})`);
}

async function main() {
  const plans = await prisma.plan.findMany({
    where: { slug: { in: ["base", "pro", "expert"] } },
  });
  for (const plan of plans) {
    if (!plan.caktoProductId) {
      console.warn(`Plano ${plan.slug} sem produto Cakto`);
      continue;
    }
    await styleProduct(plan.caktoProductId, plan.caktoOfferId || "");
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
