import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { userCanAccessLesson } from "@/lib/access";
import { redirect } from "next/navigation";
import { LessonWorkspace } from "@/components/member/LessonWorkspace";
import { resolveLessonMedia } from "@/lib/media-player";

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
          lessons: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, title: true, sortOrder: true, durationSec: true },
          },
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
  const doneIds = progressRows.map((p) => p.lessonId);
  const moduleProgress = lessons.length ? Math.round((doneIds.length / lessons.length) * 100) : 0;

  return (
    <LessonWorkspace
      moduleTitle={lesson.module.title}
      moduleCategory={`${lesson.module.code}${lesson.module.category ? ` · ${lesson.module.category}` : ""}`}
      moduleProgress={moduleProgress}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        contentKey: lesson.contentKey,
        videoUrl: lesson.videoUrl,
        videoPath: lesson.videoPath,
        durationSec: lesson.durationSec,
        materials: lesson.materials.map((m) => ({ id: m.id, title: m.title, filePath: m.filePath })),
      }}
      lessons={lessons}
      doneIds={doneIds}
      prevId={prev?.id || null}
      nextId={next?.id || null}
      completed={completed}
      hasVideo={Boolean(resolveLessonMedia(lesson.videoUrl, lesson.videoPath))}
    />
  );
}
