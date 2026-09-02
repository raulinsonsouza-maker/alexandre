import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function toggleActive(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.user.update({ where: { id }, data: { active: !active } });
  await writeAudit({
    actorId: session.user.id,
    action: active ? "user.deactivate" : "user.activate",
    entityType: "User",
    entityId: id,
  });
  revalidatePath("/administracao/usuarios");
}

async function resetPassword(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const temp = "Trocar@123";
  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(temp, 12), mustResetPassword: true },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "user.reset_password",
    entityType: "User",
    entityId: id,
  });
  redirect("/administracao/usuarios?reset=1");
}

async function updateUser(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const role = String(formData.get("role") || "STUDENT") === "ADMIN" ? "ADMIN" : "STUDENT";
  await prisma.user.update({
    where: { id },
    data: {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      role,
      phone: String(formData.get("phone") || "") || null,
      company: String(formData.get("company") || "") || null,
      active: formData.get("active") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "user.update",
    entityType: "User",
    entityId: id,
    meta: { role },
  });
  revalidatePath("/administracao/usuarios");
}

async function createUser(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "STUDENT") === "ADMIN" ? "ADMIN" : "STUDENT";
  const password = String(formData.get("password") || "Aluno@123");
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      passwordHash: await bcrypt.hash(password, 12),
      emailVerified: new Date(),
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "user.create",
    entityType: "User",
    entityId: user.id,
    meta: { role },
  });
  revalidatePath("/administracao/usuarios");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; reset?: string; edit?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const sp = await searchParams;
  const q = sp.q?.trim();
  const editId = sp.edit;
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const editing = editId ? users.find((u) => u.id === editId) : null;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Usuários</h1>
      {sp.reset && <p className="mt-2 text-sm text-[#f7bd31]">Senha temporária: Trocar@123</p>}

      <form className="mt-6 flex gap-2" action="/administracao/usuarios" method="get">
        <input className="input max-w-sm" name="q" defaultValue={q} placeholder="Buscar nome ou e-mail" />
        <button className="btn" type="submit">
          Buscar
        </button>
      </form>

      <form action={createUser} className="panel mt-6 grid gap-3 md:grid-cols-4">
        <input className="input" name="name" placeholder="Nome" required />
        <input className="input" name="email" type="email" placeholder="E-mail" required />
        <select className="input" name="role" defaultValue="STUDENT">
          <option value="STUDENT">Aluno</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button className="btn" type="submit">
          Criar usuário
        </button>
      </form>

      {editing && (
        <form action={updateUser} className="panel mt-6 grid gap-3 md:grid-cols-2">
          <h2 className="text-lg font-semibold text-white md:col-span-2">Editar: {editing.email}</h2>
          <input type="hidden" name="id" value={editing.id} />
          <input className="input" name="name" defaultValue={editing.name} required />
          <input className="input" name="email" type="email" defaultValue={editing.email} required />
          <input className="input" name="phone" defaultValue={editing.phone || ""} placeholder="Telefone" />
          <input className="input" name="company" defaultValue={editing.company || ""} placeholder="Empresa" />
          <select className="input" name="role" defaultValue={editing.role}>
            <option value="STUDENT">Aluno</option>
            <option value="ADMIN">Admin</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
            <input type="checkbox" name="active" defaultChecked={editing.active} /> Ativo
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button className="btn" type="submit">
              Salvar alterações
            </button>
            <a className="btn-ghost" href="/administracao/usuarios">
              Cancelar
            </a>
          </div>
        </form>
      )}

      <div className="panel mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.active ? "Ativo" : "Inativo"}</td>
                <td className="space-x-2">
                  <a className="btn-ghost px-2 py-1 text-xs" href={`/administracao/usuarios?edit=${u.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
                    Editar
                  </a>
                  <form action={toggleActive} className="inline">
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="active" value={String(u.active)} />
                    <button className="btn-ghost px-2 py-1 text-xs" type="submit">
                      {u.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                  <form action={resetPassword} className="inline">
                    <input type="hidden" name="id" value={u.id} />
                    <button className="btn-ghost px-2 py-1 text-xs" type="submit">
                      Reset senha
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
