import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRO_MODULE_CODES } from "@/data/plan-modules";
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
  const allCodes =
    copy.moduleCodes === "all" ? modules.map((m) => m.code) : [...copy.moduleCodes];

  const codeSet = new Set(allCodes);
  const proSet = new Set(PRO_MODULE_CODES as readonly string[]);
  const groups =
    copy.moduleGroups?.map((g) => {
      const codes =
        g.codes.length > 0
          ? g.codes.filter((c) => codeSet.has(c))
          : allCodes.filter((c) => !proSet.has(c));
      return { title: g.title, codes };
    }) ?? [{ title: "Módulos", codes: allCodes }];

  const wa =
    (await prisma.siteSetting.findUnique({ where: { key: "whatsapp_url" } }))?.value ||
    "https://wa.me/5511974389297?text=" +
      encodeURIComponent("Olá, quero uma proposta do plano Corporate da Jornada SAP EWM.");

  const priceLabel = copy.checkoutEnabled ? formatBRL(plan.priceCents) : "Sob consulta";
  const ctaLabel = copy.ctaLabel;

  return (
    <div className="bg-[#0a0a0c] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 px-[clamp(20px,4vw,56px)] py-14 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(246,180,10,0.12),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-[720px]">
          <Link href="/planos" className="text-sm text-[#888] transition hover:text-[#f6b40a]">
            ← Todos os planos
          </Link>
          <p className="mt-8 font-[family-name:var(--font-display)] text-[12px] font-bold uppercase tracking-[0.18em] text-[#f6b40a]">
            {copy.kicker}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(28px,4.5vw,48px)] font-bold leading-[1.05] tracking-tight">
            {copy.headline}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#d4d4d4]">{copy.audience}</p>
          <p className="mt-3 text-base leading-relaxed text-[#9a9a9a]">{copy.promise}</p>

          <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-display)] text-[42px] leading-none text-[#f6b40a]">
                {priceLabel}
              </p>
              <p className="mt-2 text-sm text-[#888]">
                {plan._count.modules} módulos · acesso imediato na Academia
              </p>
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

      {/* Outcomes */}
      <section className="px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(24px,3vw,32px)] font-bold leading-tight">
            {copy.outcomesTitle}
          </h2>
          <ul className="mt-8 space-y-0 divide-y divide-white/10 border-y border-white/10">
            {copy.outcomes.map((item) => (
              <li key={item} className="flex gap-4 py-4 text-[#d4d4d4]">
                <span className="mt-0.5 shrink-0 text-[#f6b40a]" aria-hidden>
                  →
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modules */}
      <section className="border-y border-white/10 bg-[#111113] px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(24px,3vw,32px)] font-bold leading-tight">
            O que está incluso
          </h2>
          <p className="mt-3 max-w-xl text-[#9a9a9a]">{copy.modulesHint}</p>

          <div className="mt-10 space-y-10">
            {groups.map((group) => (
              <div key={group.title}>
                {groups.length > 1 && (
                  <h3 className="mb-4 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.14em] text-[#f6b40a]">
                    {group.title}
                  </h3>
                )}
                <ul className="columns-1 gap-x-12 sm:columns-2">
                  {group.codes.map((code) => (
                    <li
                      key={code}
                      className="mb-2.5 break-inside-avoid text-[15px] leading-snug text-[#cfcfcf]"
                    >
                      <span className="mr-2 text-[#f6b40a]">✓</span>
                      {titleByCode.get(code) || code}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(24px,3vw,32px)] font-bold leading-tight">
            Como funciona
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {copy.steps.map((s, i) => (
              <li key={s.title}>
                <p className="font-[family-name:var(--font-display)] text-3xl text-[#f6b40a]/50">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9a9a9a]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ + closing CTA */}
      <section className="border-t border-white/10 px-[clamp(20px,4vw,56px)] py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(24px,3vw,32px)] font-bold leading-tight">
            Perguntas frequentes
          </h2>
          <div className="mt-8 space-y-6">
            {copy.faq.map((item) => (
              <div key={item.q} className="border-b border-white/10 pb-6">
                <h3 className="font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#a8a8a8]">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="font-[family-name:var(--font-display)] text-[clamp(22px,3vw,30px)] font-bold leading-tight">
              {copy.closing}
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[#f6b40a]">
              {priceLabel}
            </p>
            <p className="mt-2 text-sm text-[#888]">
              {plan._count.modules} módulos · pagamento único
            </p>
            <div className="mt-7 flex justify-center">
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
