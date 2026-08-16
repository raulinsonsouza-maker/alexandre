import { PrismaClient } from "@prisma/client";
import { caktoDelete, caktoGet, caktoPost, caktoPut } from "../src/lib/cakto";
import { applyJornadaCheckoutTheme } from "../src/lib/cakto-checkout-theme";

const prisma = new PrismaClient();
const SITE = (process.env.APP_PUBLIC_URL || "https://alexandre.symbius.com.br").replace(/\/$/, "");
const WEBHOOK_URL = `${SITE}/api/webhooks/cakto`;
const TEST_PRODUCT = "ca402b91-c199-47dd-a0c6-be6bebedb3bb";

const PLANS = [
  {
    slug: "base",
    name: "Jornada SAP EWM — Base",
    description: "6 módulos: fundamentos, estrutura, dados mestres e Warehouse Monitor.",
    price: "397.00",
  },
  {
    slug: "pro",
    name: "Jornada SAP EWM — Pro",
    description: "28 módulos: tudo do Base + processos, HU, RF e Wave Management.",
    price: "697.00",
  },
  {
    slug: "expert",
    name: "Jornada SAP EWM — Expert",
    description: "45 módulos: tudo do Pro + integrações, automação e cenários avançados.",
    price: "1497.00",
  },
] as const;

type Paginated<T> = { results?: T[] };

async function createSellableProduct(spec: (typeof PLANS)[number]) {
  const created = (await caktoPost<Record<string, unknown>>("/products/", {
    name: spec.name,
    description: spec.description,
    price: spec.price,
    type: "unique",
    salesPage: `${SITE}/planos`,
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
    throw new Error(`Produto ${productId} criado sem entrega de conteúdo`);
  }

  const list = await caktoGet<Paginated<{ id: string | number; default?: boolean; name?: string }>>(
    `/products/${productId}/checkouts/`,
  );
  const checkout = list.results?.find((c) => c.default) || list.results?.[0];
  if (checkout?.id) {
    const detail = await caktoGet<{ name?: string; config?: Record<string, unknown>; offers?: string[] }>(
      `/products/${productId}/checkouts/${checkout.id}/`,
    );
    await caktoPut(`/products/${productId}/checkouts/${checkout.id}/`, {
      name: detail.name || checkout.name || spec.name,
      default: true,
      config: applyJornadaCheckoutTheme(detail.config || {}),
      offers: detail.offers || [offerId],
    });
  }

  return { productId, offerId, pay: `https://pay.cakto.com.br/${offerId}` };
}

async function main() {
  const productIds: string[] = [];

  for (const spec of PLANS) {
    const plan = await prisma.plan.findUnique({ where: { slug: spec.slug } });
    if (!plan) continue;
    const oldId = plan.caktoProductId;
    if (oldId) {
      const current = (await caktoGet<{ contentDeliveries?: string[] }>(`/products/${oldId}/`)) || {};
      if (current.contentDeliveries?.length) {
        console.log(`OK ${spec.slug} já vendável ${oldId}`);
        productIds.push(oldId);
        continue;
      }
    }

    const next = await createSellableProduct(spec);
    await prisma.plan.update({
      where: { id: plan.id },
      data: { caktoProductId: next.productId, caktoOfferId: next.offerId },
    });
    productIds.push(next.productId);
    console.log(`${spec.slug} recriado ${next.pay} (entrega=${next.productId})`);
    if (oldId && oldId !== next.productId) {
      try {
        await caktoDelete(`/products/${oldId}/`);
        console.log(`removido produto antigo ${oldId}`);
      } catch (err) {
        console.warn(`não removeu ${oldId}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  try {
    await caktoDelete(`/products/${TEST_PRODUCT}/`);
    console.log("produto de teste removido");
  } catch {
    console.log("produto de teste já ausente ou não removível");
  }

  const hooks = await caktoGet<Paginated<{ id: number | string; url?: string }>>("/webhook/");
  const hook = hooks.results?.find((w) => w.url === WEBHOOK_URL);
  if (hook?.id) {
    await caktoPut(`/webhook/${hook.id}/`, {
      name: "Jornada EWM — vendas",
      url: WEBHOOK_URL,
      products: productIds,
      events: ["purchase_approved", "refund", "chargeback"],
    });
    console.log(`webhook ${hook.id} atualizado com ${productIds.length} produtos`);
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
