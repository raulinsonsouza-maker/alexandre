import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_SALES, PLAN_SALES_SLUGS, type PlanSalesSlug } from "@/data/plan-sales";
import { BuyPlanButton } from "@/components/checkout/BuyPlanModal";

export const dynamic = "force-dynamic";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isSlug(value: string): value is PlanSalesSlug {
  return (PLAN_SALES_SLUGS as string[]).includes(value);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) return { title: "Plano" };
  const copy = PLAN_SALES[slug];
  return { title: `${copy.headline} | Jornada SAP EWM` };
}

export default async function PlanSalesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const copy = PLAN_SALES[slug];
  const session = await auth();
  const plan = await prisma.plan.findUnique({
    where: { slug },
    include: { _count: { select: { modules: true } } },
  });
  if (!plan || !plan.published) notFound();

  const modules = await prisma.module.findMany({
    where: { published: true },
    select: { code: true, title: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
  const titleByCode = new Map(modules.map((m) => [m.code, m.title]));
  const codes =
    copy.moduleCodes === "all"
      ? modules.map((m) => m.code)
      : [...copy.moduleCodes];

  const wa =
    (await prisma.siteSetting.findUnique({ where: { key: "whatsapp_url" } }))?.value ||
    "https://wa.me/5511974389297?text=" +
      encodeURIComponent("Olá, quero uma proposta do plano Corporate da Jornada SAP EWM.");

  const priceLabel = copy.checkoutEnabled ? formatBRL(plan.priceCents) : "Sob consulta";
  const ctaLabel = copy.checkoutEnabled ? `Quero o ${plan.name} agora` : "Pedir proposta no WhatsApp";

  return (
    <div className="bg-[#0a0a0c] text-white">
      <section className="border-b border-white/10 px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[1140px]">
          <Link href="/planos" className="text-sm text-[#888] hover:text-[#f6b40a]">
            ← Voltar
          </Link>
          <p className="mt-6 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f6b40a]">
            {copy.kicker}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(32px,5vw,58px)] font-bold uppercase leading-[0.95]">
            {copy.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[#cfcfcf]">{copy.audience}</p>
          <p className="mt-4 max-w-2xl text-[#a8a8a8]">{copy.promise}</p>
          <div className="mt-8 flex flex-wrap items-end gap-6">
            <div>
              <p className="font-[family-name:var(--font-display)] text-4xl text-[#f6b40a]">{priceLabel}</p>
              <p className="text-sm text-[#888]">{plan._count.modules} módulos · acesso na Academia</p>
            </div>
            <BuyPlanButton
              loggedIn={Boolean(session?.user)}
              planSlug={slug}
              planName={plan.name}
              checkoutEnabled={copy.checkoutEnabled}
              whatsappUrl={wa}
              label={ctaLabel}
            />
          </div>
        </div>
      </section>

      <section className="px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[1140px]">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase">
            O que muda <span className="text-[#f6b40a]">na sua carreira</span>
          </h2>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {copy.outcomes.map((item) => (
              <li key={item} className="rounded-xl border border-white/10 bg-[#141416] p-5 text-[#cfcfcf]">
                <span className="mr-2 text-[#f6b40a]">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111113] px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[1140px]">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase">
            Módulos deste plano
          </h2>
          <p className="mt-3 max-w-2xl text-[#a8a8a8]">{copy.modulesHint}</p>
          <ul className="mt-8 columns-1 gap-x-10 sm:columns-2">
            {codes.map((code) => (
              <li key={code} className="mb-2 break-inside-avoid text-sm text-[#cfcfcf]">
                <span className="mr-2 text-[#f6b40a]">✓</span>
                {titleByCode.get(code) || code}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[1140px]">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase">Como você entra</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.steps.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-white/10 bg-[#141416] p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#f6b40a]">Passo {i + 1}</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold uppercase">{s.title}</h3>
                <p className="mt-2 text-sm text-[#a8a8a8]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase">Dúvidas que travam a compra</h2>
          <div className="mt-8 space-y-4">
            {copy.faq.map((item) => (
              <div key={item.q} className="rounded-xl border border-white/10 bg-[#141416] p-5">
                <h3 className="font-semibold text-[#f6b40a]">{item.q}</h3>
                <p className="mt-2 text-sm text-[#cfcfcf]">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-[#f6b40a]/40 bg-gradient-to-b from-[#1c1706] to-[#141416] p-8 text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase">{copy.headline}</p>
            <p className="mt-2 text-[#f6b40a]">{priceLabel}</p>
            <div className="mt-6 flex justify-center">
              <BuyPlanButton
                loggedIn={Boolean(session?.user)}
                planSlug={slug}
                planName={plan.name}
                checkoutEnabled={copy.checkoutEnabled}
                whatsappUrl={wa}
                label={ctaLabel}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
