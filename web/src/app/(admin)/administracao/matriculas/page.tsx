import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function grantEnrollment(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId"));
  const planId = String(formData.get("planId") || "") || null;
  const moduleId = String(formData.get("moduleId") || "") || null;
  const courseId = String(formData.get("courseId") || "") || null;
  if (!planId && !moduleId && !courseId) return;

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      planId,
      moduleId,
      courseId,
      source: "manual",
      grantedBy: session.user.id,
      status: "ACTIVE",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "enrollment.grant",
    entityType: "Enrollment",
    entityId: enrollment.id,
    meta: { userId, planId, moduleId, courseId },
  });
  revalidatePath("/administracao/matriculas");
}

async function revokeEnrollment(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.enrollment.update({ where: { id }, data: { status: "REVOKED" } });
  await writeAudit({
    actorId: session.user.id,
    action: "enrollment.revoke",
    entityType: "Enrollment",
    entityId: id,
  });
  revalidatePath("/administracao/matriculas");
}

export default async function MatriculasPage() {
  await requireRole(["ADMIN"]);
  const [enrollments, users, plans, modules, courses] = await Promise.all([
    prisma.enrollment.findMany({
      include: { user: true, course: true, module: true, plan: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.plan.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.module.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.course.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Matrículas</h1>
      <p className="mt-2 text-[#A8A8AF]">Libere plano, módulo avulso ou curso (legado).</p>
      <form action={grantEnrollment} className="panel mt-6 grid gap-3 md:grid-cols-5">
        <select className="input" name="userId" required>
          <option value="">Usuário</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email}){u.role === "ADMIN" ? " · admin" : ""}
            </option>
          ))}
        </select>
        <select className="input" name="planId">
          <option value="">Plano (opcional)</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select className="input" name="moduleId">
          <option value="">Módulo (opcional)</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} — {m.title}
            </option>
          ))}
        </select>
        <select className="input" name="courseId">
          <option value="">Curso legado (opcional)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button className="btn" type="submit">
          Liberar acesso
        </button>
      </form>

      <div className="panel mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Escopo</th>
              <th>Status</th>
              <th>Origem</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id}>
                <td>
                  {e.user.name}
                  <div className="text-xs text-[#A8A8AF]">{e.user.email}</div>
                </td>
                <td>{e.plan?.name || e.module?.title || e.course?.title || "—"}</td>
                <td>{e.status}</td>
                <td>{e.source}</td>
                <td>
                  {e.status === "ACTIVE" && (
                    <form action={revokeEnrollment}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="btn-ghost px-2 py-1 text-xs" type="submit">
                        Revogar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
