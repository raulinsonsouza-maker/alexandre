/**
 * Cria/atualiza produtos Cakto para módulos avulsos (JEWM.Mxx.01).
 * - contentDeliveries: ["external"] só na criação (obrigatório)
 * - NÃO aplica tema/config de checkout (quebra o pay link)
 * - Atualiza preços no DB e IDs Cakto
 * - Webhook unificado: planos + módulos
 */
import { PrismaClient } from "@prisma/client";
import { caktoDelete, caktoGet, caktoPost, caktoPut } from "../src/lib/cakto";
import {
  formatCaktoPriceString,
  MODULE_CAKTO_PRICES,
  sellableModuleCodes,
} from "../src/data/module-cakto-prices";

const prisma = new PrismaClient();
const SITE = (process.env.APP_PUBLIC_URL || "https://alexandre.symbius.com.br").replace(/\/$/, "");
const WEBHOOK_URL = `${SITE}/api/webhooks/cakto`;

type Paginated<T> = { results?: T[] };

async function createSellableModuleProduct(spec: {
  name: string;
  description: string;
  price: string;
  salesPage: string;
}) {
  const created = (await caktoPost<Record<string, unknown>>("/products/", {
    name: spec.name,
    description: spec.description,
    price: spec.price,
    type: "unique",
    salesPage: spec.salesPage,
    emailAccessLink: `${SITE}/academia`,
    contentDeliveries: ["external"],
    guarantee: 7,
    supportWhatsapp: "+5511974389297",
    supportEmail: "contato@bestoneit.com.br",
  })) as {
    id: string;
    contentDeliveries?: string[];
    offers?: Array<{ id: string }>;
  };

  const productId = created.id;
  const offerId = created.offers?.[0]?.id;
  if (!productId || !offerId) {
    throw new Error(`Produto incompleto: ${JSON.stringify(created).slice(0, 400)}`);
  }
  if (!created.contentDeliveries?.length) {
    throw new Error(`Produto ${productId} criado sem contentDeliveries`);
  }

  return {
    productId,
    offerId,
    pay: `https://pay.cakto.com.br/${offerId}`,
  };
}

async function productIsSellable(productId: string) {
  try {
    const current = (await caktoGet<{ contentDeliveries?: string[]; status?: string }>(
      `/products/${productId}/`,
    )) || {};
    return Boolean(current.contentDeliveries?.length);
  } catch {
    return false;
  }
}

async function refreshWebhook(productIds: string[]) {
  const hooks = await caktoGet<Paginated<{ id: number | string; url?: string }>>("/webhook/");
  const hook = hooks.results?.find((w) => w.url === WEBHOOK_URL);
  if (!hook?.id) {
    console.warn("Webhook da jornada não encontrado — cadastre manualmente:", WEBHOOK_URL);
    return;
  }
  await caktoPut(`/webhook/${hook.id}/`, {
    name: "Jornada EWM — vendas",
    url: WEBHOOK_URL,
    products: productIds,
    events: ["purchase_approved", "refund", "chargeback"],
  });
  console.log(`webhook ${hook.id} atualizado com ${productIds.length} produtos`);
}

async function main() {
  // 1) Alinhar priceCents de M00–M43
  for (const row of Object.values(MODULE_CAKTO_PRICES)) {
    const updated = await prisma.module.updateMany({
      where: { code: row.code },
      data: { priceCents: row.priceCents },
    });
    if (updated.count) {
      console.log(`preço ${row.code} → ${row.priceCents}`);
    }
  }

  const sellableCodes = sellableModuleCodes();
  const modules = await prisma.module.findMany({
    where: { code: { in: sellableCodes }, published: true },
    orderBy: { sortOrder: "asc" },
  });

  const moduleProductIds: string[] = [];

  for (const mod of modules) {
    const priceRow = MODULE_CAKTO_PRICES[mod.code];
    if (!priceRow || priceRow.priceCents <= 0) continue;

    if (mod.caktoProductId && mod.caktoOfferId) {
      const ok = await productIsSellable(mod.caktoProductId);
      if (ok) {
        console.log(`OK ${mod.code} já vendável ${mod.caktoProductId}`);
        moduleProductIds.push(mod.caktoProductId);
        continue;
      }
      console.log(`RECRIAR ${mod.code} (produto sem contentDeliveries)`);
    }

    const description =
      (mod.description || mod.title).slice(0, 500) ||
      `Módulo ${mod.title} da Jornada SAP EWM.`;

    const next = await createSellableModuleProduct({
      name: priceRow.skuName,
      description,
      price: formatCaktoPriceString(priceRow.priceCents),
      salesPage: `${SITE}/modulos/${mod.slug}`,
    });

    const oldId = mod.caktoProductId;
    await prisma.module.update({
      where: { id: mod.id },
      data: {
        priceCents: priceRow.priceCents,
        caktoProductId: next.productId,
        caktoOfferId: next.offerId,
      },
    });
    moduleProductIds.push(next.productId);
    console.log(`${mod.code} → ${next.pay}`);

    if (oldId && oldId !== next.productId) {
      try {
        await caktoDelete(`/products/${oldId}/`);
        console.log(`removido produto antigo ${oldId}`);
      } catch (err) {
        console.warn(`não removeu ${oldId}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  const plans = await prisma.plan.findMany({
    where: { caktoProductId: { not: null } },
    select: { caktoProductId: true, slug: true },
  });
  const planIds = plans.map((p) => p.caktoProductId!).filter(Boolean);
  const allIds = [...new Set([...planIds, ...moduleProductIds])];
  await refreshWebhook(allIds);

  console.log(`Sync concluído: ${moduleProductIds.length} módulos + ${planIds.length} planos no webhook`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
