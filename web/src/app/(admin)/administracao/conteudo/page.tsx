import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function updateCourse(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.course.update({
    where: { id },
    data: {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "") || null,
      published: formData.get("published") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "course.update",
    entityType: "Course",
    entityId: id,
  });
  revalidatePath("/administracao/conteudo");
}

async function createModule(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const course = await prisma.course.findFirst();
  if (!course) return;
  const code = String(formData.get("code") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const slug = `${code.toLowerCase()}-${title.toLowerCase().replace(/\s+/g, "-")}`.slice(0, 80);
  const mod = await prisma.module.create({
    data: {
      courseId: course.id,
      code,
      title,
      slug,
      description: String(formData.get("description") || "") || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      priceCents: Math.round(Number(formData.get("price") || 297) * 100),
      category: String(formData.get("category") || "") || null,
      published: false,
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "module.create",
    entityType: "Module",
    entityId: mod.id,
  });
  revalidatePath("/administracao/conteudo");
}

async function togglePublish(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const published = formData.get("published") === "true";
  await prisma.module.update({ where: { id }, data: { published: !published } });
  await writeAudit({
    actorId: session.user.id,
    action: published ? "module.unpublish" : "module.publish",
    entityType: "Module",
    entityId: id,
  });
  revalidatePath("/administracao/conteudo");
}

export default async function ConteudoPage() {
  await requireRole(["ADMIN"]);
  const [course, modules] = await Promise.all([
    prisma.course.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.module.findMany({
      include: { _count: { select: { lessons: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Conteúdo</h1>
      <p className="mt-2 text-[#A8A8AF]">
        Curso container + módulos da vitrine. Preço + publicar já gera o checkout (Pix, cartão ou
        boleto). Não é preciso cadastrar o módulo em gateway externo.
      </p>

      {course && (
        <form action={updateCourse} className="panel mt-6 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={course.id} />
          <h2 className="md:col-span-2 text-lg font-semibold text-[#f7bd31]">Curso (container)</h2>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-[#A8A8AF]">Título</label>
            <input className="input" name="title" defaultValue={course.title} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-[#A8A8AF]">Descrição</label>
            <textarea className="input min-h-[72px]" name="description" defaultValue={course.description || ""} />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
            <input type="checkbox" name="published" defaultChecked={course.published} /> Publicado
          </label>
          <button className="btn" type="submit">
            Salvar curso
          </button>
        </form>
      )}

      <form action={createModule} className="panel mt-6 grid gap-3 md:grid-cols-5">
        <input className="input" name="code" placeholder="Código (ex: M15)" required />
        <input className="input" name="title" placeholder="Título" required />
        <input className="input" name="category" placeholder="Categoria" />
        <input className="input" name="price" type="number" step="0.01" placeholder="Preço" defaultValue={297} />
        <button className="btn" type="submit">
          Novo módulo
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {modules.map((m) => (
          <div key={m.id} className="panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {m.coverPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.coverPath} alt="" className="h-14 w-24 rounded object-cover" />
              ) : (
                <div className="flex h-14 w-24 items-center justify-center rounded bg-[#1a1a1e] text-xs text-[#666]">
                  sem capa
                </div>
              )}
              <div>
                <p className="text-xs text-[#A8A8AF]">
                  {m.code} · {m._count.lessons} aulas · {m.published ? "Publicado" : "Rascunho"}
                  {m.featured ? " · Destaque" : ""}
                  {m.category ? ` · ${m.category}` : ""}
                </p>
                <h2 className="text-lg font-semibold text-white">{m.title}</h2>
                <p className="text-sm text-[#f7bd31]">R$ {(m.priceCents / 100).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/administracao/conteudo/${m.id}`} className="btn">
                Editar módulo / aulas
              </Link>
              <form action={togglePublish}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="published" value={String(m.published)} />
                <button className="btn-ghost" type="submit">
                  {m.published ? "Despublicar" : "Publicar"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
