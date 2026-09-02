import Link from "next/link";
import { BuyModuleButton } from "@/components/checkout/BuyPlanModal";
import { minimumPlanLabelForModule, minimumPlanSlugForModule } from "@/data/plan-modules";
import type { LandingModule } from "@/components/landing/LandingHome";

export type AcademyStoreModule = LandingModule & {
  owned: boolean;
  resumeHref: string | null;
  checkoutEnabled: boolean;
  progress?: number;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AcademyStoreItem({ module }: { module: AcademyStoreModule }) {
  const isPlanOnly = module.priceCents <= 0;
  const planSlug = minimumPlanSlugForModule(module.code);
  const planLabel = minimumPlanLabelForModule(module.code);
  const progress = module.progress ?? 0;

  return (
    <article
      className={[
        "store-item",
        module.owned ? "is-owned" : "",
        !module.owned && !isPlanOnly ? "is-for-sale" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={`/modulos/${module.slug}`} className="store-item-thumb" tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={module.coverPath || "/brand/gold-badge.png"} alt="" width={160} height={90} loading="lazy" />
        {module.owned && progress > 0 ? (
          <span className="store-item-progress" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </span>
        ) : null}
      </Link>

      <div className="store-item-main">
        <div className="store-item-tags">
          <span className="store-item-code">{module.code}</span>
          {module.owned ? (
            <span className="store-item-tag is-owned">Liberado</span>
          ) : (
            <Link href={`/planos/${planSlug}`} className={`store-item-tag is-plan is-${planSlug}`}>
              {planLabel}
            </Link>
          )}
        </div>
        <h3>
          <Link href={`/modulos/${module.slug}`}>{module.title}</Link>
        </h3>
        <p className="store-item-meta">
          {module.category} · {module.lessonCount} aulas
          {module.owned && progress > 0 ? ` · ${progress}% concluído` : ""}
        </p>
      </div>

      <div className="store-item-action">
        {module.owned ? (
          <Link
            href={module.resumeHref || `/modulos/${module.slug}`}
            className="button button-primary store-item-btn"
          >
            Continuar
          </Link>
        ) : isPlanOnly ? (
          <>
            <span className="store-item-price">No plano</span>
            <Link href="/planos" className="button button-outline store-item-btn">
              Ver planos
            </Link>
          </>
        ) : (
          <>
            <span className="store-item-price">{formatBRL(module.priceCents)}</span>
            <BuyModuleButton
              loggedIn
              moduleSlug={module.slug}
              moduleName={module.title}
              checkoutEnabled={module.checkoutEnabled}
              label="Comprar"
              className="store-item-btn"
            />
          </>
        )}
      </div>
    </article>
  );
}
