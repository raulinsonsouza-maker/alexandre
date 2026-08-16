import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PlanosPage() {
  const plans = await prisma.plan.findMany({
    where: { published: true },
    include: { _count: { select: { modules: true } } },
    orderBy: { sortOrder: "asc" },
  });

  const wa =
    (await prisma.siteSetting.findUnique({ where: { key: "whatsapp_url" } }))?.value ||
    "https://wa.me/5511974389297";

  return (
    <div className="bg-[#0a0a0c] px-[clamp(20px,4vw,56px)] py-16 text-white">
      <div className="mx-auto max-w-[1140px]">
        <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f6b40a]">
          Planos
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(32px,4vw,52px)] font-bold uppercase">
          Escolha o pacote ideal
        </h1>
        <p className="mt-3 max-w-2xl text-[#a8a8a8]">
          Planos cumulativos: o Pro inclui o Base, o Expert inclui o Pro. Corporate usa o mesmo conteúdo do Expert,
          com gestão para times — sob consulta no WhatsApp. Também é possível comprar módulos avulsos na vitrine.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const bullets = Array.isArray(p.bullets) ? (p.bullets as string[]) : [];
            const href = p.checkoutEnabled ? `/checkout?plan=${p.slug}` : p.ctaUrl || wa;
            const external = !p.checkoutEnabled;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  p.badge?.toLowerCase().includes("recomend")
                    ? "border-[#f6b40a]/50 bg-gradient-to-b from-[#1c1706] to-[#141416]"
                    : "border-white/10 bg-[#141416]"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 right-4 rounded bg-[#f6b40a] px-2 py-0.5 text-[10px] font-bold uppercase text-[#0a0a0c]">
                    {p.badge}
                  </span>
                )}
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">{p.name}</h2>
                {p.goal && <p className="mt-2 text-sm text-[#a8a8a8]">{p.goal}</p>}
                <p className="mt-5 font-[family-name:var(--font-display)] text-3xl text-[#f6b40a]">
                  {p.checkoutEnabled ? formatBRL(p.priceCents) : "Sob consulta"}
                </p>
                <p className="mt-1 text-xs text-[#888]">{p._count.modules} módulos incluídos</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-[#cfcfcf]">
                  {bullets.map((b) => (
                    <li key={b}>
                      <span className="mr-2 text-[#f6b40a]">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={`mt-6 inline-flex justify-center rounded px-4 py-3 text-center text-sm font-bold ${
                    p.checkoutEnabled
                      ? "bg-[#f6b40a] text-[#0a0a0c]"
                      : "border border-dashed border-[#f6b40a]/50 text-[#f6b40a]"
                  }`}
                >
                  {p.checkoutEnabled ? `Escolher ${p.name}` : "Falar no WhatsApp"}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-white/10 bg-[#141416] p-6 text-center">
          <p className="text-[#a8a8a8]">Prefere só um tema específico?</p>
          <Link href="/#modulos" className="mt-3 inline-block font-bold text-[#f6b40a]">
            Ver módulos avulsos na vitrine →
          </Link>
        </div>
      </div>
    </div>
  );
}
