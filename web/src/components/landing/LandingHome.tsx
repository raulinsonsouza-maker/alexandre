"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type LandingModule = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  priceCents: number;
  coverPath: string | null;
  featured: boolean;
  featuredOrder: number;
  code: string;
};

export type LandingBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imagePath: string | null;
  linkUrl: string | null;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ModuleCard({ item }: { item: LandingModule }) {
  const cover = item.coverPath || "/brand/gold-badge.png";
  return (
    <Link
      href={`/modulos/${item.slug}`}
      className="group relative aspect-video w-[min(310px,72vw)] shrink-0 overflow-hidden rounded-md border border-white/[0.07] bg-[#161616] text-left transition hover:z-10 hover:scale-[1.06] hover:border-[#f6b40a] hover:shadow-[0_22px_50px_rgba(0,0,0,.7)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a]/90 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition group-hover:opacity-100">
        <div className="mb-1 inline-block rounded bg-[#f6b40a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0c]">
          {item.category}
        </div>
        <div className="font-[family-name:var(--font-display)] text-[17px] font-bold uppercase leading-tight text-white">
          {item.title}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-[#bdbdbd]">{item.description}</p>
        <p className="mt-2 text-sm font-extrabold text-[#f6b40a]">{formatBRL(item.priceCents)}</p>
        <span className="mt-2 inline-block text-xs font-bold text-[#f6b40a]">Ver módulo →</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 group-hover:hidden">
        <div className="font-[family-name:var(--font-display)] text-sm font-bold uppercase text-white drop-shadow">
          {item.title}
        </div>
      </div>
    </Link>
  );
}

export function LandingHome({
  modules,
  banners,
  heroTitle,
  heroSubtitle,
}: {
  modules: LandingModule[];
  banners: LandingBanner[];
  heroTitle?: string;
  heroSubtitle?: string;
}) {
  const featuredList = useMemo(
    () =>
      [...modules]
        .filter((m) => m.featured)
        .sort((a, b) => a.featuredOrder - b.featuredOrder),
    [modules],
  );

  const defaultHero = featuredList[0] || modules[0];
  const [heroId, setHeroId] = useState(defaultHero?.id || "");
  const hero = modules.find((m) => m.id === heroId) || defaultHero;
  const banner = banners[0];

  const categories = useMemo(() => {
    const map = new Map<string, LandingModule[]>();
    for (const m of modules) {
      const cat = m.category || "Geral";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(m);
    }
    return [...map.entries()].map(([name, items]) => ({
      name,
      count: `${items.length} módulos`,
      items,
    }));
  }, [modules]);

  if (!hero) {
    return (
      <div className="px-6 py-20 text-[#A8A8AF]">
        Nenhum módulo publicado. Cadastre no admin em Conteúdo.
      </div>
    );
  }

  const cover = banner?.imagePath || hero.coverPath || "/brand/gold-badge.png";
  const title = banner?.title || hero.title;
  const description = banner?.subtitle || hero.description || heroSubtitle || "";
  const link = banner?.linkUrl || `/modulos/${hero.slug}`;
  const priceCents = hero.priceCents;
  const parcela = formatBRL(Math.round(priceCents / 5));

  return (
    <div className="bg-[#0a0a0c] text-white">
      <section id="inicio" className="relative flex min-h-[88vh] items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-right transition-opacity"
          style={{ backgroundImage: `url('${cover}')` }}
        />
        <div className="absolute inset-0 bg-[#08080a]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080a]/95 via-[#08080a]/78 to-[#08080a]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />

        <div className="relative z-[3] max-w-[680px] px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vh,104px)]">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded border border-[#f6b40a]/50 bg-[#f6b40a]/15 px-3 py-1 font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.12em] text-[#f6b40a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f6b40a] shadow-[0_0_10px_#f6b40a]" />
              Em destaque
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#cfcfcf]">{hero.category}</span>
          </div>
          {heroTitle && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#f6b40a]/90">{heroTitle}</p>
          )}
          <h1 className="mb-4 font-[family-name:var(--font-display)] text-[clamp(38px,5.4vw,76px)] font-bold uppercase leading-[0.94] tracking-tight text-white drop-shadow">
            {title}
          </h1>
          <p className="mb-4 max-w-[560px] text-[clamp(16px,1.5vw,20px)] leading-relaxed text-[#dcdcdc]">
            {description}
          </p>
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-[family-name:var(--font-display)] text-[28px] text-[#f6b40a]">
              {formatBRL(priceCents)}
            </span>
            <span className="text-[12.5px] font-semibold text-[#9a9a9a]">
              ou 5x de {parcela} · Pix com 10% off
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={link}
              className="inline-flex items-center gap-2 rounded bg-[#f6b40a] px-7 py-3 text-base font-bold text-[#0a0a0c] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(246,180,10,.4)]"
            >
              ▶ Ver módulo
            </Link>
            <Link
              href={`/checkout?module=${hero.slug}`}
              className="inline-flex items-center gap-2 rounded border border-white/25 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur"
            >
              Comprar módulo
            </Link>
          </div>
          {featuredList.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {featuredList.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHeroId(f.id)}
                  className={`rounded border px-3 py-1 text-xs ${f.id === hero.id ? "border-[#f6b40a] text-[#f6b40a]" : "border-white/20 text-[#aaa]"}`}
                >
                  {f.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-[clamp(20px,4vh,40px)] right-[clamp(20px,4vw,56px)] z-[3] flex items-center gap-2 font-[family-name:var(--font-display)] text-[13px] font-semibold tracking-[0.14em] text-[#9a9a9a]">
          <span>{modules.length} MÓDULOS</span>
          <span className="opacity-40">•</span>
          <span>{categories.length} TRILHAS</span>
        </div>
      </section>

      <main id="modulos" className="relative z-[5] -mt-11 pb-10">
        {categories.map((cat) => (
          <section key={cat.name} className="relative mb-1 py-3">
            <div className="mb-1 flex items-baseline gap-3 px-[clamp(20px,4vw,56px)]">
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(20px,2.2vw,26px)] font-bold text-white">
                {cat.name}
              </h2>
              <span className="text-xs font-bold tracking-wide text-[#f6b40a]/85">{cat.count}</span>
            </div>
            <div className="flex gap-3.5 overflow-x-auto px-[clamp(20px,4vw,56px)] py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cat.items.map((item) => (
                <ModuleCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <section className="mx-auto max-w-[1140px] px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,96px)] pt-[clamp(24px,4vw,40px)]">
        <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f6b40a]">
          Pacotes
        </span>
        <h2 className="mb-6 mt-3 font-[family-name:var(--font-display)] text-[clamp(26px,3.4vw,42px)] font-bold uppercase leading-tight">
          Escolha o <span className="text-[#f6b40a]">plano ideal</span> para você
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { tag: "Base", title: "Plano Base", desc: "6 módulos · R$ 397 — fundamentos, estrutura e Warehouse Monitor.", href: "/checkout?plan=base" },
            { tag: "Pro", title: "Plano Pro", desc: "28 módulos · R$ 697 — tudo do Base + processos, HU, RF e waves.", href: "/checkout?plan=pro", premium: true },
            { tag: "Expert", title: "Plano Expert", desc: "45 módulos · R$ 1.497 — tudo do Pro + QM, produção, TM e MFS.", href: "/checkout?plan=expert" },
          ].map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className={`relative block rounded-xl border p-6 transition hover:-translate-y-1 ${
                t.premium
                  ? "border-[#f6b40a]/50 bg-gradient-to-b from-[#1c1706] to-[#141416]"
                  : "border-white/10 bg-[#141416] hover:border-[#f6b40a]"
              }`}
            >
              {t.premium && (
                <span className="absolute -top-2.5 right-5 rounded bg-[#f6b40a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0c]">
                  Recomendado
                </span>
              )}
              <span className="mb-3 inline-block rounded bg-[#f6b40a]/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#f6b40a]">
                {t.tag}
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-[26px] font-bold uppercase text-white">{t.title}</h3>
              <p className="mt-2 mb-4 text-sm leading-relaxed text-[#a8a8a8]">{t.desc}</p>
              <span className="text-sm font-bold text-[#f6b40a]">Ver checkout →</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm text-[#A8A8AF]">
          Corporate: mesmos 45 módulos + gestão de times, sob consulta —{" "}
          <Link href="/planos" className="text-[#F1C96B]">
            fale com o comercial
          </Link>
          .
        </p>
      </section>

      <section id="sobre" className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] py-[clamp(64px,9vw,120px)]">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f6b40a]">
              Sobre a Jornada
            </span>
            <h2 className="mt-3 mb-5 font-[family-name:var(--font-display)] text-[clamp(30px,4vw,52px)] font-bold uppercase leading-tight">
              Domine o SAP EWM <span className="text-[#f6b40a]">de ponta a ponta</span>
            </h2>
            <p className="mb-4 text-[17px] leading-relaxed text-[#c8c8c8]">
              A Jornada SAP EWM Academy organiza o conhecimento em planos e módulos avulsos — da arquitetura aos
              processos inbound, outbound, produção, qualidade e automação.
            </p>
            <p className="text-[17px] leading-relaxed text-[#c8c8c8]">
              São <strong className="text-white">{modules.length} módulos</strong> para consultores, key users e
              profissionais de logística.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              [String(modules.length), "Módulos práticos"],
              [String(categories.length), "Trilhas temáticas"],
              ["100%", "Foco em operação real"],
              ["2026", "Conteúdo atualizado"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-lg border border-white/10 bg-[#141416] p-5">
                <div className="font-[family-name:var(--font-display)] text-4xl text-[#f6b40a]">{n}</div>
                <div className="mt-1.5 text-[13px] text-[#aaa]">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="especialista"
        className="border-t border-white/10 bg-gradient-to-b from-[#0e0e11] to-[#0a0a0c] px-[clamp(20px,4vw,56px)] py-[clamp(56px,8vw,108px)]"
      >
        <div className="mx-auto max-w-[1140px] text-center">
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(24px,3vw,36px)] font-bold uppercase">
            Pronto para dominar o SAP EWM?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-[#a8a8a8]">
            Escolha um plano ou compre módulos avulsos na vitrine.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/planos" className="rounded bg-[#f6b40a] px-7 py-3 font-bold text-[#0a0a0c]">
              Ver planos
            </Link>
            <Link href="/#modulos" className="rounded border border-white/20 px-7 py-3 font-semibold text-white">
              Ver módulos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
