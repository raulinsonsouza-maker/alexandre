import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import Link from "next/link";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createPost(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim() || slugify(title);
  const published = formData.get("published") === "on";
  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: String(formData.get("excerpt") || "") || null,
      body: String(formData.get("body") || ""),
      coverPath: String(formData.get("coverPath") || "") || null,
      category: String(formData.get("category") || "") || null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "blog.create",
    entityType: "BlogPost",
    entityId: post.id,
  });
  revalidatePath("/administracao/blog");
  revalidatePath("/blog");
}

async function togglePost(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const published = formData.get("published") === "true";
  await prisma.blogPost.update({
    where: { id },
    data: {
      published: !published,
      publishedAt: !published ? new Date() : null,
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: published ? "blog.unpublish" : "blog.publish",
    entityType: "BlogPost",
    entityId: id,
  });
  revalidatePath("/administracao/blog");
  revalidatePath("/blog");
}

async function deletePost(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.blogPost.delete({ where: { id } });
  await writeAudit({
    actorId: session.user.id,
    action: "blog.delete",
    entityType: "BlogPost",
    entityId: id,
  });
  revalidatePath("/administracao/blog");
  revalidatePath("/blog");
}

export default async function AdminBlogPage() {
  await requireRole(["ADMIN"]);
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Blog</h1>
      <p className="mt-2 text-[#A8A8AF]">Artigos publicados na área pública.</p>

      <form action={createPost} className="panel mt-6 grid gap-3">
        <input className="input" name="title" placeholder="Título" required />
        <input className="input" name="slug" placeholder="slug (opcional)" />
        <input className="input" name="category" placeholder="Categoria" />
        <input className="input" name="coverPath" placeholder="Capa /media/..." />
        <input className="input" name="excerpt" placeholder="Resumo" />
        <textarea className="input min-h-[160px]" name="body" placeholder="Corpo (markdown simples)" required />
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="published" defaultChecked /> Publicar agora
        </label>
        <button className="btn" type="submit">
          Criar post
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="panel flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs text-[#A8A8AF]">
                {p.category || "Geral"} · {p.published ? "Publicado" : "Rascunho"} · /blog/{p.slug}
              </p>
              <h2 className="font-semibold text-white">{p.title}</h2>
              {p.excerpt && <p className="text-sm text-[#A8A8AF]">{p.excerpt}</p>}
            </div>
            <div className="flex gap-2">
              <Link href={`/blog/${p.slug}`} className="btn-ghost" target="_blank">
                Ver
              </Link>
              <Link href={`/administracao/blog/${p.id}`} className="btn">
                Editar
              </Link>
              <form action={togglePost}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="published" value={String(p.published)} />
                <button className="btn-ghost" type="submit">
                  {p.published ? "Despublicar" : "Publicar"}
                </button>
              </form>
              <form action={deletePost}>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn-ghost text-red-400" type="submit">
                  Excluir
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
