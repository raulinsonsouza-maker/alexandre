import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  return (
    <div className="bg-[#0a0a0c] px-[clamp(20px,4vw,56px)] py-16 text-white">
      <article className="mx-auto max-w-[760px]">
        <Link href="/blog" className="text-sm text-[#A8A8AF] hover:text-[#f7bd31]">
          ← Blog
        </Link>
        <p className="mt-6 text-xs uppercase tracking-wide text-[#f7bd31]">
          {post.category || "Geral"}
          {post.publishedAt ? ` · ${post.publishedAt.toLocaleDateString("pt-BR")}` : ""}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(28px,4vw,44px)] font-bold leading-tight">
          {post.title}
        </h1>
        {post.excerpt && <p className="mt-4 text-lg text-[#a8a8a8]">{post.excerpt}</p>}
        {post.coverPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverPath} alt="" className="mt-8 w-full rounded-xl border border-white/10 object-cover" />
        )}
        <div className="mt-2">{renderMarkdown(post.body)}</div>
        <div className="mt-12 border-t border-white/10 pt-8">
          <Link href="/planos" className="rounded bg-[#f7bd31] px-6 py-3 text-sm font-bold text-[#0a0a0c]">
            Ver planos da Jornada
          </Link>
        </div>
      </article>
    </div>
  );
}
