import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userAlreadyHasModuleAccess } from "@/lib/access";
import { ModuleLessons } from "@/components/landing/ModuleLessons";
import { BuyModuleButton } from "@/components/checkout/BuyPlanModal";
import { academyCover } from "@/lib/academy-cover";
import { CourseCard } from "@/components/ui/CourseCard";
import { CourseRail } from "@/components/ui/CourseRail";

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
    select: {
      id: true,
      code: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      published: true,
      priceCents: true,
      coverPath: true,
      caktoOfferId: true,
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
    select: { slug: true, title: true, code: true, coverPath: true, category: true },
  });

  const lessons = dbModule.lessons.map((l, i) => ({
    n: i + 1,
    title: l.title,
    description: l.description || l.contentKey || "Conteúdo disponível na área de membros.",
  }));

  const cover = academyCover(dbModule.code, dbModule.coverPath);
  const price = dbModule.priceCents;
  const hasAccess =
    session?.user ? await userAlreadyHasModuleAccess(session.user.id, dbModule.id) : false;
  const paymentProvider = process.env.PAYMENT_PROVIDER || "demo";
  const canBuyAvulso =
    price > 0 && (paymentProvider !== "cakto" || Boolean(dbModule.caktoOfferId));
  const isBonus = price <= 0;

  return (
    <div className="bg-[var(--background)] text-white">
      <section className="hero hero-module" aria-labelledby="module-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-media" src={cover} alt="" width={1024} height={576} />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow">
            <span>{dbModule.code}</span>
            <i /> {dbModule.category || "Módulo"}
          </div>
          <h1 id="module-title">{dbModule.title}</h1>
          <p>{dbModule.description}</p>
          <div className="hero-meta">
            <span>{isBonus ? "Bônus" : "Módulo avulso"}</span>
            <span>{lessons.length} aulas</span>
            {!isBonus ? <span>{formatBRL(price)}</span> : <span>Incluso nos planos</span>}
            <span>Português</span>
          </div>
          <div className="hero-actions">
            {hasAccess ? (
              <Link href="/academia" className="button button-primary">
                Ir à Academia
              </Link>
            ) : isBonus ? (
              <Link href="/planos" className="button button-primary">
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
            <Link href="/planos" className="button button-secondary">
              Ver planos
            </Link>
          </div>
          {!hasAccess && !isBonus && !canBuyAvulso && (
            <p>Compra avulsa em preparação. Enquanto isso, veja os planos da jornada.</p>
          )}
        </div>
      </section>

      <main className="module-page-body">
        <section className="module-page-section">
          <span className="kicker">Sobre o módulo</span>
          <p className="mt-4 text-[17.5px] leading-relaxed text-[#cecece]">{dbModule.description}</p>
        </section>

        <section className="module-page-section">
          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(26px,3.4vw,42px)] font-bold uppercase">
              Conteúdo do <span className="text-[var(--gold)]">módulo</span>
            </h2>
            <span className="text-sm font-semibold text-[#9a9a9a]">{lessons.length} aulas</span>
          </div>
          <ModuleLessons lessons={lessons} />
        </section>

        <section className="certificate-banner">
          <div>
            <span className="kicker">{isBonus ? "Módulo bônus" : "Invista neste módulo"}</span>
            <h2>{isBonus ? "Incluso nos planos da jornada" : formatBRL(price)}</h2>
            <p>{isBonus ? "Este conteúdo entra junto com os pacotes." : "Pagamento seguro · Pix, cartão ou boleto"}</p>
          </div>
          {hasAccess ? (
            <Link href="/academia" className="button button-primary">
              Ir à Academia
            </Link>
          ) : isBonus ? (
            <Link href="/planos" className="button button-primary">
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
        </section>

        {related.length > 0 && (
          <div className="catalog">
            <CourseRail title={`Mais em ${dbModule.category}`} subtitle="Continue explorando a trilha">
              {related.map((r) => (
                <CourseCard
                  key={r.slug}
                  href={`/modulos/${r.slug}`}
                  title={r.title}
                  image={academyCover(r.code, r.coverPath)}
                  label={r.category || "Módulo"}
                  details={[r.code]}
                />
              ))}
            </CourseRail>
          </div>
        )}
      </main>
    </div>
  );
}
