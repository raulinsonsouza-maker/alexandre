import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { academyCover } from "@/lib/academy-cover";
import { getAccessibleModuleIds, resolvePlanAccessForUser } from "@/lib/access";
import { loadAcademyDashboard } from "@/lib/academy-dashboard";
import { requireSession } from "@/lib/session";
import { AcademySalesCatalog } from "@/components/member/AcademySalesCatalog";

export const metadata: Metadata = {
  title: "Catálogo | Academia",
  description: "Compre planos ou módulos avulsos e continue o que já está liberado na sua matrícula.",
};

export default async function CatalogoPage() {
  const session = await requireSession();
  const paymentProvider = process.env.PAYMENT_PROVIDER || "demo";

  const whatsappSetting = await prisma.siteSetting.findUnique({ where: { key: "whatsapp_url" } });
  const whatsappUrl =
    whatsappSetting?.value ||
    "https://wa.me/5511974389297?text=" +
      encodeURIComponent("Olá, quero uma proposta do plano Corporate da Jornada SAP EWM.");

  const [modules, plansRaw, ownedIds, dashboard] = await Promise.all([
    prisma.module.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        priceCents: true,
        coverPath: true,
        featured: true,
        featuredOrder: true,
        code: true,
        caktoOfferId: true,
        _count: { select: { lessons: { where: { published: true } } } },
      },
    }),
    prisma.plan.findMany({
      where: { published: true, slug: { not: "corporate" } },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        goal: true,
        priceCents: true,
        badge: true,
        sortOrder: true,
        checkoutEnabled: true,
        caktoOfferId: true,
        _count: { select: { modules: true } },
      },
    }),
    getAccessibleModuleIds(session.user.id),
    loadAcademyDashboard(session.user.id),
  ]);

  const planAccessMap = await resolvePlanAccessForUser(
    session.user.id,
    plansRaw.map((p) => ({ id: p.id, slug: p.slug, sortOrder: p.sortOrder })),
  );

  const resumeByModuleId = new Map(dashboard.cards.map((card) => [card.id, card.href]));
  const progressByModuleId = new Map(dashboard.cards.map((card) => [card.id, card.progress]));

  const catalog = modules.map((module) => ({
    id: module.id,
    slug: module.slug,
    title: module.title,
    description: module.description || "",
    category: module.category || "Geral",
    priceCents: module.priceCents,
    coverPath: academyCover(module.code, module.coverPath),
    featured: module.featured,
    featuredOrder: module.featuredOrder,
    code: module.code,
    lessonCount: module._count.lessons,
    owned: ownedIds.has(module.id),
    resumeHref: resumeByModuleId.get(module.id) ?? null,
    progress: progressByModuleId.get(module.id) ?? 0,
    checkoutEnabled:
      module.priceCents > 0 &&
      (paymentProvider !== "cakto" || Boolean(module.caktoOfferId)),
  }));

  const plans = plansRaw.map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    goal: plan.goal,
    priceCents: plan.priceCents,
    badge: plan.badge,
    moduleCount: plan._count.modules,
    checkoutEnabled:
      plan.checkoutEnabled &&
      (paymentProvider !== "cakto" || Boolean(plan.caktoOfferId)),
    access: planAccessMap.get(plan.id) ?? ("available" as const),
  }));

  return (
    <div className="academy-subpage academy-subpage-store">
      <header className="academy-subpage-head academy-store-head">
        <div>
          <h1>Catálogo</h1>
          <p className="academy-subpage-lead">
            Pacotes cumulativos — o Pro inclui o Base, o Expert inclui o Pro — ou módulos avulsos.
            O que já está na sua matrícula aparece como liberado.
          </p>
        </div>
      </header>

      <AcademySalesCatalog modules={catalog} plans={plans} whatsappUrl={whatsappUrl} />
    </div>
  );
}
