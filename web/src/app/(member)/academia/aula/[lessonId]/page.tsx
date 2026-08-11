import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { userCanAccessLesson } from "@/lib/access";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MarkCompleteButton } from "@/components/member/MarkCompleteButton";
import { LessonPlayer } from "@/components/member/LessonPlayer";

export default async function AulaPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const session = await requireSession();
  const { lessonId } = await params;
  const allowed = await userCanAccessLesson(session.user.id, lessonId);
  if (!allowed) redirect("/academia");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } },
        },
      },
      materials: true,
      progress: { where: { userId: session.user.id } },
    },
  });
  if (!lesson) redirect("/academia");

  const completed = lesson.progress[0]?.completed ?? false;
  const lessons = lesson.module.lessons;
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: lessons.map((l) => l.id) },
      completed: true,
    },
    select: { lessonId: true },
  });
  const doneSet = new Set(progressRows.map((p) => p.lessonId));
  const doneCount = lessons.filter((l) => doneSet.has(l.id)).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <p className="text-xs text-[#A8A8AF]">
          {lesson.module.code} · {lesson.module.title}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-white">{lesson.title}</h1>

        <div className="panel mt-6 overflow-hidden p-0">
          <LessonPlayer videoUrl={lesson.videoUrl} videoPath={lesson.videoPath} />
        </div>

        {lesson.description && <p className="mt-4 text-[#A8A8AF]">{lesson.description}</p>}
        {lesson.contentKey && (
          <div className="panel mt-4 whitespace-pre-wrap text-sm text-[#A8A8AF]">{lesson.contentKey}</div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <MarkCompleteButton lessonId={lesson.id} completed={completed} />
          {prev && (
            <Link href={`/academia/aula/${prev.id}`} className="btn-ghost">
              ← Anterior
            </Link>
          )}
          {next && (
            <Link href={`/academia/aula/${next.id}`} className="btn">
              Próxima →
            </Link>
          )}
        </div>

        {lesson.materials.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white">Materiais</h2>
            <ul className="mt-3 space-y-2">
              {lesson.materials.map((m) => (
                <li key={m.id}>
                  <a className="text-[#F1C96B]" href={`/uploads/${m.filePath}`} target="_blank">
                    {m.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="panel h-fit">
        <h2 className="text-sm font-semibold text-[#F1C96B]">Aulas do módulo</h2>
        <p className="mt-1 text-xs text-[#A8A8AF]">
          {doneCount}/{lessons.length} concluídas
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded bg-white/10">
          <div
            className="h-full rounded bg-[#F1C96B]"
            style={{ width: `${lessons.length ? (doneCount / lessons.length) * 100 : 0}%` }}
          />
        </div>
        <ul className="mt-4 max-h-[60vh] space-y-1 overflow-y-auto">
          {lessons.map((l) => {
            const isDone = doneSet.has(l.id);
            const isCurrent = l.id === lesson.id;
            return (
              <li key={l.id}>
                <Link
                  href={`/academia/aula/${l.id}`}
                  className={`flex items-start gap-2 rounded px-2 py-1.5 text-sm ${
                    isCurrent
                      ? "bg-[rgba(241,201,107,.12)] text-[#F1C96B]"
                      : "text-[#A8A8AF] hover:text-white"
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-xs">{isDone ? "✓" : "○"}</span>
                  <span>
                    {l.sortOrder + 1}. {l.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
