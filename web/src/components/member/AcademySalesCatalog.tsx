"use client";

import { useMemo, useState } from "react";
import { AcademyStoreItem } from "@/components/member/AcademyStoreCard";
import type { AcademyStoreModule } from "@/components/member/AcademyStoreCard";
import { AcademyStorePlans } from "@/components/member/AcademyStorePlans";
import type { AcademyStorePlan } from "@/components/member/AcademyStorePlans";
import { CAT_ORDER, TRACK_INTRO } from "@/data/catalog";

export type { AcademyStoreModule };

function trackSlug(name: string) {
  return name
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AcademySalesCatalog({
  modules,
  plans,
  whatsappUrl,
}: {
  modules: AcademyStoreModule[];
  plans: AcademyStorePlan[];
  whatsappUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [scope, setScope] = useState<"all" | "owned" | "store">("all");

  const tracks = useMemo(() => {
    const leftover = [...new Set(modules.map((m) => m.category || "Geral"))].filter(
      (name) => !(CAT_ORDER as readonly string[]).includes(name),
    );
    return [...CAT_ORDER, ...leftover];
  }, [modules]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return modules.filter((m) => {
      const inScope =
        scope === "all" ||
        (scope === "owned" && m.owned) ||
        (scope === "store" && !m.owned);
      const inCategory = category === "Todos" || m.category === category;
      const inQuery =
        !q ||
        `${m.title} ${m.description} ${m.category} ${m.code}`.toLocaleLowerCase("pt-BR").includes(q);
      return inScope && inCategory && inQuery;
    });
  }, [modules, category, query, scope]);

  const groups = useMemo(() => {
    return tracks
      .map((name) => ({
        name,
        intro: TRACK_INTRO[name as keyof typeof TRACK_INTRO] || "Módulos desta etapa da jornada.",
        items: filtered.filter((m) => (m.category || "Geral") === name),
      }))
      .filter((group) => group.items.length > 0);
  }, [tracks, filtered]);

  const filtersActive = Boolean(query.trim() || category !== "Todos" || scope !== "all");

  return (
    <div className="academy-store">
      <AcademyStorePlans plans={plans} whatsappUrl={whatsappUrl} />

      <p className="store-modules-label">Módulos avulsos</p>

      <div className="store-toolbar">
        <label className="store-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar módulo…"
            aria-label="Buscar módulos"
          />
        </label>

        <label className="store-filter">
          <span>Trilha</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por trilha"
          >
            <option value="Todos">Todas</option>
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

        <div className="store-scope" role="group" aria-label="Filtrar por acesso">
          <button type="button" className={scope === "all" ? "is-active" : undefined} onClick={() => setScope("all")}>
            Todos
          </button>
          <button
            type="button"
            className={scope === "owned" ? "is-active" : undefined}
            onClick={() => setScope("owned")}
          >
            Meus
          </button>
          <button
            type="button"
            className={scope === "store" ? "is-active" : undefined}
            onClick={() => setScope("store")}
          >
            Comprar
          </button>
        </div>

        {filtersActive ? (
          <button
            type="button"
            className="store-clear"
            onClick={() => {
              setQuery("");
              setCategory("Todos");
              setScope("all");
            }}
          >
            Limpar
          </button>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <p className="store-empty">
          {scope === "owned"
            ? "Você ainda não tem módulos liberados. Explore o catálogo ou veja os planos."
            : scope === "store"
              ? "Nenhum módulo avulso disponível com esses filtros."
              : "Nenhum módulo encontrado. Tente outro termo ou trilha."}
        </p>
      ) : (
        groups.map((group) => (
          <section
            key={group.name}
            className="store-track"
            id={`trilha-${trackSlug(group.name)}`}
            aria-labelledby={`store-track-${trackSlug(group.name)}`}
          >
            <header className="store-track-head">
              <h2 id={`store-track-${trackSlug(group.name)}`}>{group.name}</h2>
              <span className="store-track-count">
                {group.items.length} módulo{group.items.length === 1 ? "" : "s"}
              </span>
            </header>
            <div className="store-list">
              {group.items.map((item) => (
                <AcademyStoreItem key={item.id} module={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
