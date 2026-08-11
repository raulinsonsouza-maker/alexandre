import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const courses = await p.course.count();
  const modules = await p.module.count();
  const lessons = await p.lesson.count();
  console.log({ courses, modules, lessons });

  const mods = await p.module.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  for (const m of mods) {
    console.log(
      `${m.code} | ${m.title.slice(0, 45).padEnd(45)} | aulas=${String(m._count.lessons).padStart(3)} | pub=${m.published}`
    );
  }
}

main()
  .finally(() => p.$disconnect());
