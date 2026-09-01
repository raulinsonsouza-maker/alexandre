import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userAlreadyHasModuleAccess } from "@/lib/access";
import { ModuleLessons } from "@/components/landing/ModuleLessons";
import { BuyModuleButton } from "@/components/checkout/BuyPlanModal";
import { moduleCoverUrl } from "@/lib/media";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const dbModule = await prisma.module.findUnique({
    where: { slug },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          contentKey: true,
          sortOrder: true,
        },
      },
      course: { select: { id: true, title: true } },
    },
  });

  if (!dbModule || (!dbModule.published && session?.user?.role !== "ADMIN")) notFound();

  const related = await prisma.module.findMany({
    where: {
      published: true,
      category: dbModule.category,
      NOT: { id: dbModule.id },
    },
    take: 8,
    orderBy: { sortOrder: "asc" },
  });

  const lessons = dbModule.lessons.map((l, i) => ({
    n: i + 1,
    title: l.title,
    description: l.description || l.contentKey || "Conteúdo disponível na área de membros.",
  }));

  const cover = dbModule.coverPath || moduleCoverUrl(dbModule.code) || "/brand/gold-badge.png";
  const price = dbModule.priceCents;
  const hasAccess =
    session?.user ? await userAlreadyHasModuleAccess(session.user.id, dbModule.id) : false;
  const paymentProvider = process.env.PAYMENT_PROVIDER || "demo";
  const canBuyAvulso =
    price > 0 && (paymentProvider !== "cakto" || Boolean(dbModule.caktoOfferId));
  const isBonus = price <= 0;

  return (
    <div className="bg-[#0a0a0c] text-white">
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-right" style={{ backgroundImage: `url('${cover}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080a]/96 via-[#08080a]/80 to-[#08080a]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />

        <div className="relative z-[3] max-w-[720px] px-[clamp(20px,4vw,56px)] pb-[clamp(48px,7vh,92px)] pt-24">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded border border-[#f6b40a]/50 bg-[#f6b40a]/15 px-3 py-1 font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-wide text-[#f6b40a]">
              {dbModule.code}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#cfcfcf]">
              {dbModule.category || "Módulo"}
            </span>
          </div>
          <h1 className="mb-4 font-[family-name:var(--font-display)] text-[clamp(36px,5.2vw,72px)] font-bold uppercase leading-[0.95]">
            {dbModule.title}
          </h1>
          <p className="mb-3 max-w-[600px] text-[clamp(16px,1.5vw,20px)] leading-relaxed text-[#dcdcdc]">
            {dbModule.description}
          </p>
          <div className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[#9a9a9a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f6b40a]" />
            {isBonus
              ? `Bônus · ${lessons.length} aulas`
              : `Módulo avulso · ${lessons.length} aulas · ${formatBRL(price)}`}
          </div>
          <div className="flex flex-wrap gap-3">
            {hasAccess ? (
              <Link
                href="/academia"
                className="inline-flex items-center gap-2 rounded bg-[#f6b40a] px-8 py-3.5 text-base font-bold text-[#0a0a0c]"
              >
                Ir à Academia
              </Link>
            ) : isBonus ? (
              <Link
                href="/planos"
                className="inline-flex items-center gap-2 rounded bg-[#f6b40a] px-8 py-3.5 text-base font-bold text-[#0a0a0c]"
              >
                Incluído nos planos
              </Link>
            ) : (
              <BuyModuleButton
                loggedIn={Boolean(session?.user)}
                moduleSlug={dbModule.slug}
                moduleName={dbModule.title}
                checkoutEnabled={canBuyAvulso}
                label={canBuyAvulso ? "Comprar módulo" : "Ver planos"}
              />
            )}
            <Link
              href="/planos"
              className="inline-flex items-center gap-2 rounded border border-white/25 bg-white/10 px-6 py-3.5 text-base font-semibold text-white"
            >
              Ver planos
            </Link>
          </div>
          {!hasAccess && !isBonus && !canBuyAvulso && (
            <p className="mt-3 text-sm text-[#a8a8a8]">
              Compra avulsa em preparação. Enquanto isso, veja os planos da jornada.
            </p>
          )}
        </div>
      </section>

      <main className="relative z-[5] -mt-8">
        <section className="mx-auto max-w-[980px] px-[clamp(20px,4vw,56px)] pt-[clamp(40px,6vw,72px)]">
          <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f6b40a]">
            Sobre o módulo
          </span>
          <p className="mt-4 text-[17.5px] leading-relaxed text-[#cecece]">{dbModule.description}</p>
        </section>

        <section className="mx-auto max-w-[980px] px-[clamp(20px,4vw,56px)] pt-[clamp(48px,7vw,88px)]">
          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(26px,3.4vw,42px)] font-bold uppercase">
              Conteúdo do <span className="text-[#f6b40a]">módulo</span>
            </h2>
            <span className="text-sm font-semibold text-[#9a9a9a]">{lessons.length} aulas</span>
          </div>
          <ModuleLessons lessons={lessons} />
        </section>

        <section className="mx-auto max-w-[980px] px-[clamp(20px,4vw,56px)] py-[clamp(48px,7vw,88px)]">
          <div className="rounded-xl border border-[#f6b40a]/30 bg-gradient-to-br from-[#1c1706] to-[#141416] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase">
              {isBonus ? "Módulo bônus" : "Invista neste módulo"}
            </h2>
            <div className="mt-4">
              <span className="font-[family-name:var(--font-display)] text-[clamp(36px,4.4vw,52px)] text-[#f6b40a]">
                {isBonus ? "Incluso" : formatBRL(price)}
              </span>
              {!isBonus && (
                <p className="mt-2 text-sm text-[#a8a8a8]">Pagamento seguro · Pix, cartão ou boleto</p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {hasAccess ? (
                <Link href="/academia" className="rounded bg-[#f6b40a] px-7 py-3 font-bold text-[#0a0a0c]">
                  Ir à Academia
                </Link>
              ) : isBonus ? (
                <Link href="/planos" className="rounded bg-[#f6b40a] px-7 py-3 font-bold text-[#0a0a0c]">
                  Ver planos
                </Link>
              ) : (
                <BuyModuleButton
                  loggedIn={Boolean(session?.user)}
                  moduleSlug={dbModule.slug}
                  moduleName={dbModule.title}
                  checkoutEnabled={canBuyAvulso}
                  label={canBuyAvulso ? "Comprar agora" : "Ver planos"}
                />
              )}
              <Link href="/planos" className="rounded border border-white/20 px-7 py-3 font-semibold text-white">
                Ver planos
              </Link>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-white/10 px-[clamp(20px,4vw,56px)] py-12">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold uppercase">
              Mais em <span className="text-[#f6b40a]">{dbModule.category}</span>
            </h2>
            <div className="flex gap-3.5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/modulos/${r.slug}`}
                  className="relative aspect-video w-[min(300px,70vw)] shrink-0 overflow-hidden rounded-md border border-white/[0.07] bg-[#161616] transition hover:border-[#f6b40a]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.coverPath || moduleCoverUrl(r.code) || "/brand/gold-badge.png"}
                    alt={r.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                    <div className="font-[family-name:var(--font-display)] text-sm font-bold uppercase text-white">
                      {r.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
