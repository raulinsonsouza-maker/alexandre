import { PrismaClient } from "@prisma/client";
import { caktoGet, caktoPost } from "../src/lib/cakto";

const prisma = new PrismaClient();

const SALES_PAGE = process.env.APP_PUBLIC_URL || "https://alexandre.symbius.com.br";
const WEBHOOK_URL = `${SALES_PAGE.replace(/\/$/, "")}/api/webhooks/cakto`;

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

type ProductCreate = {
  id?: string;
  short_id?: string;
  offers?: Array<{ id?: string; short_id?: string }>;
  defaultOffer?: { id?: string };
};

type Paginated<T> = { results?: T[] };

function pickId(obj: Record<string, unknown> | undefined): string | undefined {
  if (!obj) return undefined;
  const v = obj.id ?? obj.short_id ?? obj.pk;
  return v ? String(v) : undefined;
}

async function resolveOfferId(productId: string, created: ProductCreate): Promise<string> {
  const nested = created.offers?.[0];
  if (nested?.id) return String(nested.id);
  if (nested?.short_id) return String(nested.short_id);
  if (created.defaultOffer?.id) return String(created.defaultOffer.id);

  const checkouts = (await caktoGet<Paginated<{ id: string; default?: boolean }>>(
    `/products/${productId}/checkouts/`,
  )) as Paginated<{ id: string; default?: boolean }>;
  const checkout =
    checkouts.results?.find((c) => c.default) || checkouts.results?.[0];
  if (checkout?.id) {
    const detail = (await caktoGet<{
      offers?: Array<{ id?: string }>;
    }>(`/products/${productId}/checkouts/${checkout.id}/`)) as {
      offers?: Array<{ id?: string }>;
    };
    const offerId = detail.offers?.[0]?.id;
    if (offerId) return String(offerId);
  }

  const offers = (await caktoGet<Paginated<{ id: string; product?: { id?: string } }>>(
    `/offers/?search=${encodeURIComponent(productId)}`,
  )) as Paginated<{ id: string }>;
  if (offers.results?.[0]?.id) return String(offers.results[0].id);

  throw new Error(`Não foi possível obter oferta do produto ${productId}`);
}

async function listExistingWebhooks() {
  try {
    return await caktoGet<Paginated<{ id: number | string; url?: string }>>("/webhook/");
  } catch {
    return { results: [] as Array<{ id: number | string; url?: string }> };
  }
}

async function main() {
  const productIds: string[] = [];

  for (const spec of PLANS) {
    const plan = await prisma.plan.findUnique({ where: { slug: spec.slug } });
    if (!plan) {
      console.warn(`Plano ${spec.slug} não existe no banco — rode o seed antes.`);
      continue;
    }

    if (plan.caktoProductId && plan.caktoOfferId) {
      console.log(`OK ${spec.slug}: já vinculado produto=${plan.caktoProductId} oferta=${plan.caktoOfferId}`);
      productIds.push(plan.caktoProductId);
      continue;
    }

    const created = (await caktoPost<ProductCreate>("/products/", {
      name: spec.name,
      description: spec.description,
      price: spec.price,
      type: "unique",
      salesPage: `${SALES_PAGE.replace(/\/$/, "")}/planos`,
    })) as ProductCreate;

    const productId = pickId(created as Record<string, unknown>);
    if (!productId) {
      throw new Error(`Produto criado sem id: ${JSON.stringify(created).slice(0, 500)}`);
    }
    const offerId = await resolveOfferId(productId, created);
    await prisma.plan.update({
      where: { id: plan.id },
      data: { caktoProductId: productId, caktoOfferId: offerId },
    });
    productIds.push(productId);
    console.log(`Criado ${spec.slug}: produto=${productId} oferta=${offerId} pay=https://pay.cakto.com.br/${offerId}`);
  }

  const uniqueProducts = [...new Set(productIds)];
  if (!uniqueProducts.length) {
    throw new Error("Nenhum produto Cakto para registrar webhook");
  }

  const existing = await listExistingWebhooks();
  const already = existing.results?.find((w) => w.url === WEBHOOK_URL);
  if (already) {
    console.log(`Webhook já existe id=${already.id} url=${WEBHOOK_URL}`);
    console.log("Confirme CAKTO_WEBHOOK_SECRET no .env (secret gerado na criação do webhook).");
  } else {
    const webhook = (await caktoPost<Record<string, unknown>>("/webhook/", {
      name: "Jornada EWM — vendas",
      url: WEBHOOK_URL,
      products: uniqueProducts,
      events: ["purchase_approved", "refund", "chargeback"],
    })) as {
      id?: number;
      fields?: { secret?: string };
      secret?: string;
    };
    const secret = webhook.fields?.secret || webhook.secret;
    console.log(`Webhook criado id=${webhook.id}`);
    console.log(`CAKTO_WEBHOOK_SECRET=${secret || "(não retornado — copie no painel Cakto)"}`);
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
