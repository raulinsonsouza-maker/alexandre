import { prisma } from "@/lib/prisma";
import { academyCover } from "@/lib/academy-cover";
import { ModulesCatalog } from "@/components/landing/ModulesCatalog";
import type { LandingModule } from "@/components/landing/LandingHome";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Módulos | Jornada SAP EWM Academy",
  description:
    "Catálogo completo dos módulos da Jornada SAP EWM: fundamentos, inbound, outbound, qualidade, produção e automação.",
};

export default async function ModulosPage() {
  const modules = await prisma.module.findMany({
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
  });

  const catalog: LandingModule[] = modules.map((m) => ({
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

  const trails = new Set(catalog.map((m) => m.category)).size;

  return (
    <div className="modules-page">
      <header className="catalog-head">
        <div>
          <span className="kicker">Vitrine</span>
          <h1>Catálogo de módulos</h1>
          <p>
            {catalog.length} módulos em {trails} trilhas, na ordem da operação: fundamentos, entrada, saída,
            processos internos e avançado. Compre avulso ou siga um plano.
          </p>
        </div>
        <Link className="button button-secondary" href="/planos">
          Ver planos
        </Link>
      </header>
      <ModulesCatalog modules={catalog} />
    </div>
  );
}
