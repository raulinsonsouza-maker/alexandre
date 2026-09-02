import { prisma } from "@/lib/prisma";
import { listAccessibleModules } from "@/lib/access";
import { formatHoursMinutes } from "@/lib/academy";
import { requireSession } from "@/lib/session";
import { academyCover } from "@/lib/academy-cover";
import { AcademyHome } from "@/components/member/AcademyHome";

export default async function AcademiaPage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const modules = await listAccessibleModules(session.user.id);
  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, lessonId: { in: lessonIds } },
    select: { lessonId: true, completed: true, completedAt: true },
  });
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const certCount = await prisma.certificate.count({ where: { userId: session.user.id } });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekDoneIds = progress
    .filter((p) => p.completed && p.completedAt && p.completedAt >= weekAgo)
    .map((p) => p.lessonId);
  const weekLessons =
    weekDoneIds.length > 0
      ? await prisma.lesson.findMany({
          where: { id: { in: weekDoneIds } },
          select: { durationSec: true },
        })
      : [];
  const weekSec = weekLessons.reduce((sum, l) => sum + (l.durationSec || 12 * 60), 0);

  const cards = modules.map((m) => {
    const total = m.lessons.length;
    const completed = m.lessons.filter((l) => done.has(l.id)).length;
    const nextIncomplete = m.lessons.find((l) => !done.has(l.id));
    const resume = nextIncomplete || m.lessons[0];
    const progressPct = total ? Math.round((completed / total) * 100) : 0;
    return {
      id: m.id,
      title: m.title,
      category: m.category || m.course.title || "Jornada",
      cover: academyCover(m.code, m.coverPath),
      href: resume ? `/academia/aula/${resume.id}` : "/academia",
      lessons: total,
      progress: progressPct,
      description: "",
      resumeLessonTitle: resume?.title || "Começar",
      completedCount: completed,
    };
  });

  const inProgress = cards.filter((c) => c.progress > 0 && c.progress < 100);
  const notStarted = cards.filter((c) => c.progress === 0);
  const heroSource =
    inProgress[0] || notStarted[0] || cards.find((c) => c.progress === 100) || cards[0] || null;
  const heroModule = heroSource ? modules.find((m) => m.id === heroSource.id) : null;

  const totalLessons = cards.reduce((sum, c) => sum + c.lessons, 0);
  const completedLessons = cards.reduce((sum, c) => sum + c.completedCount, 0);
  const percent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const byCategory = new Map<string, typeof cards>();
  for (const card of cards) {
    const cat = card.category || "Geral";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(card);
  }

  const rails = [
    inProgress.length
      ? {
          key: "continue",
          title: "Continue assistindo",
          subtitle: "Retome exatamente de onde parou",
          items: inProgress,
        }
      : null,
    ...[...byCategory.entries()].map(([name, items]) => ({
      key: name,
      title: name,
      subtitle: `${items.length} módulo${items.length === 1 ? "" : "s"} nesta trilha`,
      items,
    })),
  ].filter(Boolean) as { key: string; title: string; subtitle: string; items: typeof cards }[];

  const incompleteCount = cards.filter((c) => c.progress < 100).length;
  const certificate =
    certCount > 0
      ? {
          kicker: "Suas conquistas",
          title: `Você já tem ${certCount} certificado${certCount === 1 ? "" : "s"}.`,
          text: "Continue a jornada e libere os próximos para o LinkedIn.",
          href: "/academia/certificados",
          cta: "Ver certificados",
        }
      : {
          kicker: "Próxima conquista",
          title:
            incompleteCount <= 1
              ? "Seu primeiro certificado está perto."
              : `Seu primeiro certificado está a ${incompleteCount} módulos.`,
          text: "Conclua as aulas de um módulo para emitir o certificado automaticamente.",
          href: "/academia/certificados",
          cta: "Ver requisitos",
        };

  return (
    <AcademyHome
      name={session.user.name}
      purchased={Boolean(sp.purchased)}
      hero={
        heroSource && heroModule
          ? {
              title: heroSource.title,
              description:
                heroModule.description || "Retome seus estudos e avance na jornada SAP EWM.",
              cover: heroSource.cover,
              category: heroSource.category,
              lessons: heroSource.lessons,
              progress: heroSource.progress,
              resumeHref: heroSource.href === "/academia" ? null : heroSource.href,
              resumeLabel:
                heroSource.progress > 0 ? `Continuar · ${heroSource.resumeLessonTitle}` : "Começar agora",
              detailsHref: heroSource.href,
              eyebrow: heroSource.progress > 0 ? "Continue assistindo" : "Comece por aqui",
            }
          : null
      }
      summary={{
        percent,
        completedLessons,
        weekLabel: weekSec > 0 ? formatHoursMinutes(weekSec) : `${weekDoneIds.length} aulas`,
        moduleCount: cards.length,
      }}
      rails={rails}
      certificate={certificate}
    />
  );
}
