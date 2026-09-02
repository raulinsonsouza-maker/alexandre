import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";

async function updatePost(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const published = formData.get("published") === "on";
  await prisma.blogPost.update({
    where: { id },
    data: {
      title: String(formData.get("title") || "").trim(),
      slug: String(formData.get("slug") || "").trim(),
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
    action: "blog.update",
    entityType: "BlogPost",
    entityId: id,
  });
  revalidatePath("/administracao/blog");
  revalidatePath(`/administracao/blog/${id}`);
  revalidatePath("/blog");
}

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <Link href="/administracao/blog" className="text-sm text-[#A8A8AF] hover:text-[#f7bd31]">
        ← Blog
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-white">Editar post</h1>
      <form action={updatePost} className="panel mt-6 grid gap-3">
        <input type="hidden" name="id" value={post.id} />
        <input className="input" name="title" defaultValue={post.title} required />
        <input className="input" name="slug" defaultValue={post.slug} required />
        <input className="input" name="category" defaultValue={post.category || ""} />
        <input className="input" name="coverPath" defaultValue={post.coverPath || ""} />
        <input className="input" name="excerpt" defaultValue={post.excerpt || ""} />
        <textarea
          className="input min-h-[240px] font-mono text-sm"
          name="body"
          defaultValue={post.body}
          required
          placeholder={"## Título\n\nParágrafo com **negrito**, `código` e [links](/planos).\n\n- item 1\n- item 2"}
        />
        <p className="text-xs text-[#A8A8AF]">
          Markdown suportado: títulos (# ## ###), listas, citação (&gt;), código, negrito, links.
        </p>
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="published" defaultChecked={post.published} /> Publicado
        </label>
        <button className="btn" type="submit">
          Salvar
        </button>
      </form>
    </div>
  );
}
