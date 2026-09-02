import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LandingHome, type LandingModule, type LandingBanner, type LandingPlan } from "@/components/landing/LandingHome";
import { academyCover } from "@/lib/academy-cover";

export const metadata: Metadata = {
  title: "Jornada SAP EWM Academy | Formação prática para consultores e times",
  description:
    "Formação completa em SAP EWM: planos cumulativos, módulos práticos, certificados e área do aluno. Para consultores, key users e empresas.",
};

export default async function HomePage() {
  const [modules, banners, settings, plans] = await Promise.all([
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
        _count: { select: { lessons: { where: { published: true } } } },
      },
    }),
    prisma.siteBanner.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSetting.findMany(),
    prisma.plan.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        goal: true,
        priceCents: true,
        badge: true,
        checkoutEnabled: true,
        _count: { select: { modules: true } },
      },
    }),
  ]);

  const settingMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const landingModules: LandingModule[] = modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description || "",
    category: m.category || "Geral",
    priceCents: m.priceCents,
    coverPath: academyCover(m.code, m.coverPath),
    featured: m.featured,
    featuredOrder: m.featuredOrder,
    code: m.code,
    lessonCount: m._count.lessons,
  }));

  const landingBanners: LandingBanner[] = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    imagePath: b.imagePath,
    linkUrl: b.linkUrl,
  }));

  const landingPlans: LandingPlan[] = plans.map((p) => ({
    slug: p.slug,
    name: p.name,
    goal: p.goal,
    priceCents: p.priceCents,
    badge: p.badge,
    checkoutEnabled: p.checkoutEnabled,
    moduleCount: p._count.modules,
  }));

  return (
    <LandingHome
      modules={landingModules}
      banners={landingBanners}
      plans={landingPlans}
      heroTitle={settingMap.hero_title}
      heroSubtitle={settingMap.hero_subtitle}
    />
  );
}
