import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userCanAccessLesson } from "@/lib/access";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lessonId = String(body.lessonId || "");
  const completed = Boolean(body.completed);
  const allowed = await userCanAccessLesson(session.user.id, lessonId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    create: {
      userId: session.user.id,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  if (completed) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
            lessons: { where: { published: true } },
          },
        },
      },
    });
    if (lesson) {
      const ids = lesson.module.lessons.map((l) => l.id);
      const done = await prisma.lessonProgress.count({
        where: { userId: session.user.id, lessonId: { in: ids }, completed: true },
      });
      if (done >= ids.length && ids.length > 0) {
        await prisma.certificate.upsert({
          where: {
            userId_moduleId: {
              userId: session.user.id,
              moduleId: lesson.moduleId,
            },
          },
          create: {
            userId: session.user.id,
            courseId: lesson.module.courseId,
            moduleId: lesson.moduleId,
            code: `CERT-${nanoid(8).toUpperCase()}`,
          },
          update: {},
        });
      }
    }
  }

  return NextResponse.json(progress);
}
