"use client";

import Link from "next/link";
import { BuyPlanButton } from "@/components/checkout/BuyPlanModal";

export type AcademyStorePlan = {
  id: string;
  slug: string;
  name: string;
  goal: string | null;
  priceCents: number;
  badge: string | null;
  moduleCount: number;
  checkoutEnabled: boolean;
  access: "owned" | "included" | "available";
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AcademyStorePlans({
  plans,
  whatsappUrl,
}: {
  plans: AcademyStorePlan[];
  whatsappUrl: string;
}) {
  if (!plans.length) return null;

  return (
    <section className="store-plans" aria-label="Planos disponíveis">
      <div className="store-plans-grid">
        {plans.map((plan) => {
          const isFeatured = Boolean(plan.badge?.toLowerCase().includes("recomend"));
          const priceLabel = plan.checkoutEnabled ? formatBRL(plan.priceCents) : "Sob consulta";

          return (
            <article
              key={plan.id}
              className={[
                "store-plan",
                plan.access === "owned" ? "is-owned" : "",
                plan.access === "included" ? "is-included" : "",
                isFeatured ? "is-featured" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {plan.badge ? <span className="store-plan-badge">{plan.badge}</span> : null}

              <div className="store-plan-head">
                <h3>{plan.name}</h3>
                {plan.access === "owned" ? (
                  <span className="store-plan-status is-owned">Plano ativo</span>
                ) : plan.access === "included" ? (
                  <span className="store-plan-status is-included">Incluso</span>
                ) : null}
              </div>

              {plan.goal ? <p className="store-plan-goal">{plan.goal}</p> : null}

              <p className="store-plan-price">{priceLabel}</p>
              <p className="store-plan-meta">{plan.moduleCount} módulos</p>

              <div className="store-plan-foot">
                {plan.access === "owned" ? (
                  <Link href="/academia/jornada" className="button button-outline store-plan-btn">
                    Acessar jornada
                  </Link>
                ) : plan.access === "included" ? (
                  <Link href="/academia/jornada" className="button button-outline store-plan-btn">
                    Ver conteúdo
                  </Link>
                ) : plan.checkoutEnabled ? (
                  <BuyPlanButton
                    loggedIn
                    planSlug={plan.slug}
                    planName={plan.name}
                    checkoutEnabled
                    whatsappUrl={whatsappUrl}
                    label={`Comprar ${plan.name}`}
                    className="store-plan-btn"
                  />
                ) : (
                  <BuyPlanButton
                    loggedIn
                    planSlug={plan.slug}
                    planName={plan.name}
                    checkoutEnabled={false}
                    whatsappUrl={whatsappUrl}
                    label="Falar no WhatsApp"
                    className="store-plan-btn"
                  />
                )}
                <Link href={`/planos/${plan.slug}`} className="store-plan-details">
                  Detalhes
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
