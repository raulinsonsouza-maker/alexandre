"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LandingModule } from "@/components/landing/LandingHome";
import { CAT_ORDER, TRACK_INTRO } from "@/data/catalog";
import { minimumPlanLabelForModule, minimumPlanSlugForModule } from "@/data/plan-modules";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function trackSlug(name: string) {
  return name
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ModulesCatalog({ modules }: { modules: LandingModule[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const tracks = useMemo(() => {
    const leftover = [...new Set(modules.map((m) => m.category || "Geral"))].filter(
      (name) => !(CAT_ORDER as readonly string[]).includes(name),
    );
    return [...CAT_ORDER, ...leftover];
  }, [modules]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return modules.filter((m) => {
      const inCategory = category === "Todos" || m.category === category;
      const inQuery =
        !q ||
        `${m.title} ${m.description} ${m.category} ${m.code}`.toLocaleLowerCase("pt-BR").includes(q);
      return inCategory && inQuery;
    });
  }, [modules, category, query]);

  const groups = useMemo(() => {
    return tracks
      .map((name) => ({
        name,
        intro: TRACK_INTRO[name as keyof typeof TRACK_INTRO] || "Módulos desta etapa da jornada.",
        items: filtered.filter((m) => (m.category || "Geral") === name),
      }))
      .filter((group) => group.items.length > 0);
  }, [tracks, filtered]);

  return (
    <div className="modules-catalog">
      <div className="catalog-toolbar">
        <div className="catalog-toolbar-row">
          <label className="catalog-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              aria-label="Buscar módulos por nome, código ou processo"
            />
          </label>

          <label className="catalog-filter">
            <span>Trilha</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filtrar por trilha"
            >
              <option value="Todos">Todas as trilhas</option>
              {tracks.map((name) => {
                const count = modules.filter((m) => (m.category || "Geral") === name).length;
                if (!count) return null;
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </label>

          {(query.trim() || category !== "Todos") && (
            <button
              type="button"
              className="catalog-clear"
              onClick={() => {
                setQuery("");
                setCategory("Todos");
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="catalog-empty">Nenhum módulo encontrado. Tente outro termo ou trilha.</p>
      ) : (
        groups.map((group) => (
          <section
            key={group.name}
            className="catalog-track"
            id={`trilha-${trackSlug(group.name)}`}
            aria-labelledby={`heading-${trackSlug(group.name)}`}
          >
            <header className="catalog-track-head">
              <div>
                <h2 id={`heading-${trackSlug(group.name)}`}>{group.name}</h2>
                <p>{group.intro}</p>
              </div>
            </header>
            <div className="catalog-rows">
              {group.items.map((item) => {
                const isBonus = item.priceCents <= 0;
                const planSlug = minimumPlanSlugForModule(item.code);
                const planLabel = minimumPlanLabelForModule(item.code);
                return (
                  <article key={item.id} className="catalog-row">
                    <Link href={`/modulos/${item.slug}`} className="catalog-row-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.coverPath || "/brand/gold-badge.png"}
                        alt=""
                        width={280}
                        height={158}
                        loading="lazy"
                      />
                    </Link>
                    <div className="catalog-row-main">
                      <div className="catalog-row-tags">
                        <span className="catalog-code">{item.code}</span>
                        {isBonus ? (
                          <span className="catalog-bonus">Bônus</span>
                        ) : (
                          <Link
                            href={`/planos/${planSlug}`}
                            className={`catalog-plan is-${planSlug}`}
                          >
                            {planLabel}
                          </Link>
                        )}
                        {item.featured ? <span className="catalog-featured">Destaque</span> : null}
                      </div>
                      <h3>
                        <Link href={`/modulos/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p>{item.description || "Conteúdo prático de SAP EWM para operação real."}</p>
                    </div>
                    <div className="catalog-row-buy">
                      <strong>{item.priceCents > 0 ? formatBRL(item.priceCents) : "Incluso nos planos"}</strong>
                      <Link href={`/modulos/${item.slug}`} className="button button-primary catalog-row-cta">
                        {isBonus ? "Ver módulo" : "Ver e comprar"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
