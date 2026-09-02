import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];

  return (
    <div className="bg-[#0a0a0c] px-[clamp(20px,4vw,56px)] py-16 text-white">
      <div className="mx-auto max-w-[1100px]">
        <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f7bd31]">
          Blog
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(32px,4vw,52px)] font-bold uppercase">
          Conteúdo sobre SAP EWM
        </h1>
        <p className="mt-3 max-w-2xl text-[#a8a8a8]">
          Artigos gerenciados no painel admin. Fundamentos, processos e carreira.
        </p>

        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c} className="rounded border border-white/10 bg-[#141416] px-3 py-1 text-xs text-[#cfcfcf]">
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {posts.length === 0 && (
            <p className="text-[#A8A8AF] md:col-span-2">Nenhum artigo publicado ainda.</p>
          )}
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="rounded-xl border border-white/10 bg-[#141416] p-6 transition hover:border-[#f7bd31]/50"
            >
              <p className="text-xs uppercase tracking-wide text-[#f7bd31]">
                {p.category || "Geral"}
                {p.publishedAt
                  ? ` · ${p.publishedAt.toLocaleDateString("pt-BR")}`
                  : ""}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {p.title}
              </h2>
              {p.excerpt && <p className="mt-2 text-sm leading-relaxed text-[#a8a8a8]">{p.excerpt}</p>}
              <span className="mt-4 inline-block text-sm font-bold text-[#f7bd31]">Ler artigo →</span>
            </Link>
          ))}
        </div>

        <div id="newsletter" className="mt-14 rounded-xl border border-[#f7bd31]/25 bg-[#141416] p-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">Newsletter</h2>
          <p className="mt-2 text-sm text-[#a8a8a8]">Em breve — cadastre-se pelo contato.</p>
          <Link href="/contato" className="mt-4 inline-block rounded bg-[#f7bd31] px-6 py-2.5 text-sm font-bold text-[#0a0a0c]">
            Falar conosco
          </Link>
        </div>
      </div>
    </div>
  );
}
