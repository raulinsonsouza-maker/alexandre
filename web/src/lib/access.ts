import { prisma } from "@/lib/prisma";

async function isAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/** IDs de módulos liberados por matrículas ativas (plano, módulo ou curso legado). */
export async function getAccessibleModuleIds(userId: string): Promise<Set<string>> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "ACTIVE" },
    select: {
      courseId: true,
      moduleId: true,
      planId: true,
      plan: { select: { modules: { select: { moduleId: true } } } },
    },
  });

  const ids = new Set<string>();
  const courseIds: string[] = [];

  for (const e of enrollments) {
    if (e.moduleId) ids.add(e.moduleId);
    if (e.courseId) courseIds.push(e.courseId);
    if (e.plan?.modules) {
      for (const pm of e.plan.modules) ids.add(pm.moduleId);
    }
  }

  if (courseIds.length) {
    const mods = await prisma.module.findMany({
      where: { courseId: { in: courseIds }, published: true },
      select: { id: true },
    });
    for (const m of mods) ids.add(m.id);
  }

  return ids;
}

export async function userCanAccessModule(userId: string, moduleId: string) {
  if (await isAdmin(userId)) return true;

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, published: true },
  });
  if (!mod?.published) return false;

  const accessible = await getAccessibleModuleIds(userId);
  return accessible.has(moduleId);
}

export async function userCanAccessLesson(userId: string, lessonId: string) {
  if (await isAdmin(userId)) return true;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { id: true, published: true } } },
  });
  if (!lesson?.published || !lesson.module.published) return false;
  if (lesson.isFreePreview) return true;
  return userCanAccessModule(userId, lesson.moduleId);
}

export async function userAlreadyHasModuleAccess(userId: string, moduleId: string) {
  if (await isAdmin(userId)) return true;
  const accessible = await getAccessibleModuleIds(userId);
  return accessible.has(moduleId);
}

export type PlanAccessStatus = "owned" | "included" | "available";

/** Status de cada plano para vitrine (matrícula direta ou incluso em tier superior). */
export async function resolvePlanAccessForUser(
  userId: string,
  plans: { id: string; slug: string; sortOrder: number }[],
): Promise<Map<string, PlanAccessStatus>> {
  const result = new Map<string, PlanAccessStatus>();

  if (await isAdmin(userId)) {
    for (const p of plans) result.set(p.id, "owned");
    return result;
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "ACTIVE", planId: { not: null } },
    select: { planId: true, plan: { select: { sortOrder: true } } },
  });

  const ownedIds = new Set(
    enrollments.map((e) => e.planId).filter((id): id is string => Boolean(id)),
  );
  const maxSortOrder = Math.max(0, ...enrollments.map((e) => e.plan?.sortOrder ?? 0));

  for (const p of plans) {
    if (ownedIds.has(p.id)) {
      result.set(p.id, "owned");
    } else if (p.slug !== "corporate" && maxSortOrder > p.sortOrder) {
      result.set(p.id, "included");
    } else {
      result.set(p.id, "available");
    }
  }

  return result;
}

export async function userAlreadyHasPlanAccess(userId: string, planId: string) {
  if (await isAdmin(userId)) return true;
  const enr = await prisma.enrollment.findFirst({
    where: { userId, planId, status: "ACTIVE" },
  });
  return Boolean(enr);
}

export type AccessibleModule = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string | null;
  coverPath: string | null;
  category: string | null;
  published: boolean;
  sourceLabel: string;
  lessons: { id: string; title: string; sortOrder: number; isFreePreview: boolean }[];
  course: { title: string; slug: string };
};

export async function listAccessibleModules(userId: string): Promise<AccessibleModule[]> {
  if (await isAdmin(userId)) {
    const mods = await prisma.module.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        lessons: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, sortOrder: true, isFreePreview: true },
        },
        course: { select: { title: true, slug: true } },
      },
    });
    return mods.map((m) => ({
      ...m,
      sourceLabel: "Admin",
    }));
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      plan: { select: { id: true, name: true, modules: { select: { moduleId: true } } } },
      module: { select: { id: true } },
      course: { select: { id: true } },
    },
  });

  const sourceByModule = new Map<string, string>();
  const courseIds: string[] = [];

  for (const e of enrollments) {
    if (e.moduleId) {
      sourceByModule.set(e.moduleId, "Módulo avulso");
    }
    if (e.plan) {
      for (const pm of e.plan.modules) {
        if (!sourceByModule.has(pm.moduleId) || sourceByModule.get(pm.moduleId) === "Módulo avulso") {
          // Prefer plan label when covered by plan
          sourceByModule.set(pm.moduleId, `Plano ${e.plan.name}`);
        }
      }
    }
    if (e.courseId) courseIds.push(e.courseId);
  }

  if (courseIds.length) {
    const courseMods = await prisma.module.findMany({
      where: { courseId: { in: courseIds }, published: true },
      select: { id: true },
    });
    for (const m of courseMods) {
      if (!sourceByModule.has(m.id)) sourceByModule.set(m.id, "Curso");
    }
  }

  const moduleIds = [...sourceByModule.keys()];
  if (!moduleIds.length) return [];

  const mods = await prisma.module.findMany({
    where: { id: { in: moduleIds }, published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true, sortOrder: true, isFreePreview: true },
      },
      course: { select: { title: true, slug: true } },
    },
  });

  return mods.map((m) => ({
    ...m,
    sourceLabel: sourceByModule.get(m.id) || "Liberado",
  }));
}
