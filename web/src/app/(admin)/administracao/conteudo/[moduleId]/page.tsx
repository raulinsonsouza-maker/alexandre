import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LessonUploadForm } from "@/components/admin/LessonUploadForm";
import { ModuleCoverUpload } from "@/components/admin/ModuleCoverUpload";
import Link from "next/link";

async function updateModule(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const code = String(formData.get("code") || "").trim();

  await prisma.module.update({
    where: { id },
    data: {
      title,
      slug: slug || undefined,
      code,
      description: String(formData.get("description") || "") || null,
      category: String(formData.get("category") || "") || null,
      priceCents: Math.round(Number(formData.get("price") || 0) * 100),
      sortOrder: Number(formData.get("sortOrder") || 0),
      coverPath: String(formData.get("coverPath") || "") || null,
      featured: formData.get("featured") === "on",
      featuredOrder: Number(formData.get("featuredOrder") || 0),
      published: formData.get("published") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "module.update",
    entityType: "Module",
    entityId: id,
  });
  revalidatePath(`/administracao/conteudo/${id}`);
  revalidatePath("/administracao/conteudo");
  revalidatePath("/");
  revalidatePath(`/modulos/${slug}`);
}

async function createLesson(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const moduleId = String(formData.get("moduleId"));
  const title = String(formData.get("title") || "").trim();
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      description: String(formData.get("description") || "") || null,
      contentKey: String(formData.get("contentKey") || "") || null,
      videoUrl: String(formData.get("videoUrl") || "") || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      durationSec: formData.get("durationSec")
        ? Number(formData.get("durationSec"))
        : null,
      published: false,
      isFreePreview: formData.get("isFreePreview") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "lesson.create",
    entityType: "Lesson",
    entityId: lesson.id,
  });
  revalidatePath(`/administracao/conteudo/${moduleId}`);
}

async function updateLesson(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const moduleId = String(formData.get("moduleId"));
  const clearVideo = formData.get("clearVideo") === "on";

  await prisma.lesson.update({
    where: { id },
    data: {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "") || null,
      contentKey: String(formData.get("contentKey") || "") || null,
      videoUrl: clearVideo ? null : String(formData.get("videoUrl") || "") || null,
      videoPath: clearVideo ? null : undefined,
      sortOrder: Number(formData.get("sortOrder") || 0),
      durationSec: formData.get("durationSec")
        ? Number(formData.get("durationSec"))
        : null,
      isFreePreview: formData.get("isFreePreview") === "on",
      published: formData.get("published") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "lesson.update",
    entityType: "Lesson",
    entityId: id,
  });
  revalidatePath(`/administracao/conteudo/${moduleId}`);
}

async function deleteLesson(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const moduleId = String(formData.get("moduleId"));
  await prisma.lesson.delete({ where: { id } });
  await writeAudit({
    actorId: session.user.id,
    action: "lesson.delete",
    entityType: "Lesson",
    entityId: id,
  });
  revalidatePath(`/administracao/conteudo/${moduleId}`);
}

async function deleteMaterial(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const moduleId = String(formData.get("moduleId"));
  await prisma.material.delete({ where: { id } });
  await writeAudit({
    actorId: session.user.id,
    action: "material.delete",
    entityType: "Material",
    entityId: id,
  });
  revalidatePath(`/administracao/conteudo/${moduleId}`);
}

export default async function ModuleDetailPage({ params }: { params: Promise<{ moduleId: string }> }) {
  await requireRole(["ADMIN"]);
  const { moduleId } = await params;
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { lessons: { orderBy: { sortOrder: "asc" }, include: { materials: true } } },
  });
  if (!mod) redirect("/administracao/conteudo");

  return (
    <div>
      <Link href="/administracao/conteudo" className="text-sm text-[#A8A8AF] hover:text-[#f7bd31]">
        ← Conteúdo
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-white">
        {mod.code} — {mod.title}
      </h1>
      <p className="mt-1 text-sm text-[#A8A8AF]">
        Edite capa, título, preço e todas as aulas (texto, link de vídeo, upload).
      </p>

      <form action={updateModule} className="panel mt-6 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="id" value={mod.id} />
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Código</label>
          <input className="input" name="code" defaultValue={mod.code} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Slug (URL)</label>
          <input className="input" name="slug" defaultValue={mod.slug} required />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-[#A8A8AF]">Título</label>
          <input className="input" name="title" defaultValue={mod.title} required />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-[#A8A8AF]">Descrição</label>
          <textarea className="input min-h-[80px]" name="description" defaultValue={mod.description || ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Categoria</label>
          <input className="input" name="category" defaultValue={mod.category || ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">
            Preço (R$) — checkout usa este valor ao publicar
          </label>
          <input
            className="input"
            name="price"
            type="number"
            step="0.01"
            defaultValue={(mod.priceCents / 100).toFixed(2)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Ordem</label>
          <input className="input" name="sortOrder" type="number" defaultValue={mod.sortOrder} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Ordem destaque</label>
          <input className="input" name="featuredOrder" type="number" defaultValue={mod.featuredOrder} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-[#A8A8AF]">Caminho da capa (ou use upload abaixo)</label>
          <input className="input" name="coverPath" defaultValue={mod.coverPath || ""} placeholder="/media/... ou /uploads/..." />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="featured" defaultChecked={mod.featured} /> Destaque na home
        </label>
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="published" defaultChecked={mod.published} /> Publicado
        </label>
        <button className="btn md:col-span-2" type="submit">
          Salvar módulo
        </button>
      </form>

      <div className="panel mt-4">
        <h2 className="mb-2 text-lg font-semibold text-white">Capa</h2>
        <ModuleCoverUpload moduleId={mod.id} currentCover={mod.coverPath} />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-white">Aulas ({mod.lessons.length})</h2>

      <form action={createLesson} className="panel mt-4 space-y-3">
        <h3 className="font-semibold text-[#f7bd31]">Nova aula</h3>
        <input type="hidden" name="moduleId" value={mod.id} />
        <input className="input" name="title" placeholder="Título da aula" required />
        <textarea className="input min-h-20" name="description" placeholder="Descrição" />
        <textarea className="input min-h-24" name="contentKey" placeholder="Conteúdo textual" />
        <input className="input" name="videoUrl" type="url" placeholder="Link do vídeo (opcional)" />
        <div className="flex flex-wrap items-center gap-4">
          <input
            className="input max-w-[100px]"
            name="sortOrder"
            type="number"
            defaultValue={mod.lessons.length}
            title="Ordem"
          />
          <input className="input max-w-[120px]" name="durationSec" type="number" placeholder="Duração (s)" />
          <label className="text-sm text-[#A8A8AF]">
            <input type="checkbox" name="isFreePreview" className="mr-2" /> Prévia gratuita
          </label>
          <button className="btn" type="submit">
            Criar aula
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-6">
        {mod.lessons.map((l) => (
          <div key={l.id} className="panel space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-white">
                #{l.sortOrder} {l.title}
              </h3>
              <p className="text-xs text-[#A8A8AF]">
                {l.published ? "Publicada" : "Rascunho"}
                {l.videoPath || l.videoUrl ? " · vídeo ok" : " · sem vídeo"}
                {l.isFreePreview ? " · prévia" : ""}
              </p>
            </div>

            <form action={updateLesson} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="moduleId" value={mod.id} />
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-[#A8A8AF]">Título</label>
                <input className="input" name="title" defaultValue={l.title} required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-[#A8A8AF]">Descrição</label>
                <textarea className="input min-h-16" name="description" defaultValue={l.description || ""} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-[#A8A8AF]">Conteúdo textual</label>
                <textarea className="input min-h-28" name="contentKey" defaultValue={l.contentKey || ""} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-[#A8A8AF]">Link do vídeo</label>
                <input className="input" name="videoUrl" type="url" defaultValue={l.videoUrl || ""} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A8A8AF]">Ordem</label>
                <input className="input" name="sortOrder" type="number" defaultValue={l.sortOrder} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#A8A8AF]">Duração (segundos)</label>
                <input className="input" name="durationSec" type="number" defaultValue={l.durationSec ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
                <input type="checkbox" name="isFreePreview" defaultChecked={l.isFreePreview} /> Prévia gratuita
              </label>
              <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
                <input type="checkbox" name="published" defaultChecked={l.published} /> Publicada
              </label>
              <label className="flex items-center gap-2 text-sm text-red-300/80 md:col-span-2">
                <input type="checkbox" name="clearVideo" /> Limpar vídeo (URL e arquivo)
              </label>
              <button className="btn md:col-span-2" type="submit">
                Salvar aula
              </button>
            </form>

            <LessonUploadForm
              lessonId={l.id}
              moduleId={mod.id}
              currentVideoUrl={l.videoUrl}
              currentVideoPath={l.videoPath}
            />

            {l.materials.length > 0 && (
              <ul className="space-y-2 text-sm text-[#A8A8AF]">
                {l.materials.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Material: {m.title} ({m.filePath})
                    </span>
                    <form action={deleteMaterial}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="moduleId" value={mod.id} />
                      <button className="btn-ghost px-2 py-1 text-xs text-red-400" type="submit">
                        Excluir material
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <form action={deleteLesson} className="border-t border-white/10 pt-3">
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="moduleId" value={mod.id} />
              <button
                className="btn-ghost text-sm text-red-400"
                type="submit"
              >
                Excluir aula
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
