import { prisma } from "@/lib/prisma";
import { LandingHome, type LandingModule, type LandingBanner } from "@/components/landing/LandingHome";

export default async function HomePage() {
  const [modules, banners, settings] = await Promise.all([
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
      },
    }),
    prisma.siteBanner.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSetting.findMany(),
  ]);

  const settingMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const landingModules: LandingModule[] = modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description || "",
    category: m.category || "Geral",
    priceCents: m.priceCents,
    coverPath: m.coverPath,
    featured: m.featured,
    featuredOrder: m.featuredOrder,
    code: m.code,
  }));

  const landingBanners: LandingBanner[] = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    imagePath: b.imagePath,
    linkUrl: b.linkUrl,
  }));

  return (
    <LandingHome
      modules={landingModules}
      banners={landingBanners}
      heroTitle={settingMap.hero_title}
      heroSubtitle={settingMap.hero_subtitle}
    />
  );
}
