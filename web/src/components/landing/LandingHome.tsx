import Link from "next/link";
import { PLAN_SALES, type PlanSalesSlug } from "@/data/plan-sales";

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
  lessonCount: number;
};

export type LandingBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imagePath: string | null;
  linkUrl: string | null;
};

export type LandingPlan = {
  slug: string;
  name: string;
  goal: string | null;
  priceCents: number;
  badge: string | null;
  checkoutEnabled: boolean;
  moduleCount: number;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function planSalesCopy(slug: string) {
  if (slug in PLAN_SALES) return PLAN_SALES[slug as PlanSalesSlug];
  return null;
}

const PAINS = [
  {
    title: "Na reunião, sem resposta",
    text: "O cliente pergunta sobre entrada, saída ou monitor — e você depende de alguém da sala para salvar.",
  },
  {
    title: "Tela aberta, caminho fechado",
    text: "Você sabe que o EWM resolve, mas não tem trilha clara do básico até o que o projeto cobra de verdade.",
  },
  {
    title: "Medo de errar no go-live",
    text: "Configuração mal feita para operação, HU ou inventário — e a confiança do time some.",
  },
];

const VALUES = [
  {
    title: "Explica com propriedade",
    text: "Defende entrada, saída, monitor e estrutura do armazém na reunião — sem depender de alguém da sala para traduzir a tela.",
  },
  {
    title: "Executa no chão de armazém",
    text: "HU, inventário, ondas e coletor no ritmo do projeto. Você para de só conversar sobre o processo e passa a conduzir.",
  },
  {
    title: "Cresce com o que o cliente pede",
    text: "Trilha cumulativa do básico ao avançado, na ordem em que a operação acontece — sem volume que você não vai usar agora.",
  },
  {
    title: "Vira referência quando aperta",
    text: "Integração, automação e cenários difíceis com repertório de quem já sustentou projetos nacionais e globais.",
  },
];

const JOURNEY = [
  {
    n: "01",
    title: "Entenda a fundação",
    text: "ERP x EWM, estrutura, dados mestres e monitor — clareza para parar de adivinhar na primeira semana no projeto.",
  },
  {
    n: "02",
    title: "Opere de verdade",
    text: "Recebimento, expedição, inventário, tarefas e coletor — o que consultor e key user entregam no dia a dia.",
  },
  {
    n: "03",
    title: "Feche o desenho",
    text: "Qualidade, produção, integração e automação — profundidade para ser chamado quando o projeto exige mais.",
  },
];

const FAQ = [
  [
    "Serve para quem está começando em EWM?",
    "Sim. O plano Base cobre a fundação. Pro e Expert aprofundam operação e cenários avançados.",
  ],
  [
    "Qual plano devo escolher?",
    "Base para começar, Pro para operar o armazém, Expert para a trilha completa. Os planos são cumulativos — você evolui sem recomeçar do zero.",
  ],
  [
    "Posso comprar só um módulo?",
    "Sim, no catálogo. O plano vale quando você quer trilha organizada e mais conteúdo pelo mesmo investimento.",
  ],
  [
    "O conteúdo é teórico ou prático?",
    "Prático e orientado a projeto: processos reais de SAP EWM, com a lógica de implantação e sustentação.",
  ],
  [
    "Quando o acesso é liberado?",
    "Assim que o pagamento for confirmado. Entre na Academia com o mesmo e-mail da compra.",
  ],
  [
    "E para capacitar o time da empresa?",
    "O plano Corporate atende times com licenças e trilhas por perfil. Proposta sob consulta em Empresas.",
  ],
];

export function LandingHome({
  banners,
  plans = [],
  heroTitle,
  heroSubtitle,
}: {
  modules?: LandingModule[];
  banners: LandingBanner[];
  plans?: LandingPlan[];
  heroTitle?: string;
  heroSubtitle?: string;
}) {
  const banner = banners[0];
  const cover = banner?.imagePath || "/brand/hero-academy.jpg";
  const title = heroTitle || "Pare de adivinhar na tela do SAP EWM";
  const description =
    heroSubtitle ||
    "Formação prática para consultores e key users que precisam entregar no SAP EWM — do primeiro acesso ao desenho completo do armazém.";
  const featuredPlan = plans.find((p) => p.badge?.toLowerCase().includes("recomend")) ?? plans.find((p) => p.slug === "pro");

  return (
    <div className="landing">
      <section className="hero hero-sales" id="inicio" aria-labelledby="hero-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-media" src={cover} alt="" width={1600} height={900} />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow">
            <span>Jornada SAP EWM</span>
            <i /> Academy
          </div>
          <h1 id="hero-title">{title}</h1>
          <p>{description}</p>
          <div className="hero-meta">
            <span>Consultores e key users</span>
            <span>Do básico ao avançado</span>
            <span>Orientado a projeto real</span>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href="/planos">
              Escolher meu plano
            </Link>
            {featuredPlan ? (
              <Link className="button button-secondary" href={`/planos/${featuredPlan.slug}`}>
                Ver plano {featuredPlan.name}
              </Link>
            ) : (
              <Link className="button button-secondary" href="/conta/cadastro">
                Criar conta grátis
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="landing-trust" aria-label="Diferenciais">
        <div className="landing-wrap landing-trust-grid">
          <div>
            <strong>Clareza</strong>
            <span>Saiba por onde começar no EWM</span>
          </div>
          <div>
            <strong>Operação</strong>
            <span>Processos que o cliente cobra no dia a dia</span>
          </div>
          <div>
            <strong>Profundidade</strong>
            <span>Evolua sem recomeçar do zero</span>
          </div>
          <div>
            <strong>Método</strong>
            <span>De quem está no projeto há 15+ anos</span>
          </div>
        </div>
      </section>

      <section className="landing-block" id="problema">
        <div className="landing-wrap">
          <header className="landing-heading">
            <span className="kicker">O problema</span>
            <h2>Reconhece alguma dessas situações?</h2>
            <p>
              A maioria dos profissionais não falha por falta de vontade — falta método, trilha e alguém que já passou
              pelo mesmo cenário no cliente.
            </p>
          </header>
          <div className="landing-grid-3">
            {PAINS.map((item) => (
              <article key={item.title} className="landing-card landing-card-pain">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-block landing-block-alt" id="valor">
        <div className="landing-wrap">
          <header className="landing-heading">
            <span className="kicker">O que muda</span>
            <h2>Resultado que o cliente percebe na mesa</h2>
            <p>
              Não é sobre decorar transação — é sobre chegar preparado, executar com método e ganhar espaço quando o
              projeto aperta.
            </p>
          </header>
          <div className="landing-grid-2 landing-value-grid">
            {VALUES.map((item) => (
              <article key={item.title} className="landing-card landing-card-value">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-block" id="evolucao">
        <div className="landing-wrap">
          <header className="landing-heading">
            <span className="kicker">Sua evolução</span>
            <h2>Do zero à referência no armazém</h2>
            <p>Cada etapa corresponde ao que o mercado cobra de você — fundação, operação e desenho completo.</p>
          </header>
          <div className="landing-steps">
            {JOURNEY.map((step) => (
              <article key={step.n} className="landing-step">
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-block landing-block-alt" id="planos">
        <div className="landing-wrap">
          <header className="landing-heading landing-heading-center">
            <span className="kicker">Investimento</span>
            <h2>Escolha o pacote certo para o seu momento</h2>
            <p>
              Planos cumulativos: o Pro inclui o Base, o Expert inclui o Pro. Prefere um tema só?{" "}
              <Link href="/modulos" className="landing-inline-link">
                Veja módulos avulsos
              </Link>
              .
            </p>
          </header>
          {plans.length > 0 ? (
            <div className="landing-plans">
              {plans.map((plan) => {
                const sales = planSalesCopy(plan.slug);
                const featured = plan.badge?.toLowerCase().includes("recomend");
                const outcomes = sales?.outcomes.slice(0, 3) ?? [];
                const ctaLabel = sales?.ctaLabel ?? (plan.checkoutEnabled ? `Ver ${plan.name}` : "Ver Corporate");
                return (
                  <article key={plan.slug} className={featured ? "landing-plan is-featured" : "landing-plan"}>
                    {plan.badge ? <span className="landing-plan-badge">{plan.badge}</span> : null}
                    {sales?.kicker ? <span className="landing-plan-kicker">{sales.kicker}</span> : null}
                    <h3>{plan.name}</h3>
                    <p>{sales?.audience ?? plan.goal ?? "Formação SAP EWM na Academia."}</p>
                    {outcomes.length > 0 ? (
                      <ul className="landing-plan-outcomes">
                        {outcomes.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                    <strong>{plan.checkoutEnabled ? formatBRL(plan.priceCents) : "Sob consulta"}</strong>
                    {!plan.checkoutEnabled ? (
                      <small>Toda a trilha · licenças para o time</small>
                    ) : (
                      <small>{plan.moduleCount} módulos incluídos</small>
                    )}
                    <Link href={plan.checkoutEnabled ? `/planos/${plan.slug}` : "/empresas"}>{ctaLabel}</Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="landing-empty">Os planos aparecem aqui assim que forem publicados.</p>
          )}
        </div>
      </section>

      <section className="landing-block" id="mentor">
        <div className="landing-wrap landing-mentor">
          <div className="landing-mentor-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/alexandre.jpeg" alt="Alexandre Santos Brunelli, mentor da Jornada SAP EWM" />
            <span>Mentor da Jornada</span>
          </div>
          <div>
            <span className="kicker">Quem conduz</span>
            <h2>Aprenda com quem sustenta projetos de alta criticidade</h2>
            <p>
              Alexandre Santos Brunelli é consultor SAP sênior e instrutor — mais de 25 anos no ecossistema SAP e mais
              de 15 dedicados ao EWM, em projetos nacionais e internacionais. A jornada nasce do que funciona no
              cliente, não de manual genérico.
            </p>
            <Link className="button button-secondary" href="/sobre">
              Conhecer o especialista
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-block landing-block-alt" id="faq">
        <div className="landing-wrap landing-faq-wrap">
          <header className="landing-heading">
            <span className="kicker">Dúvidas</span>
            <h2>Perguntas frequentes</h2>
          </header>
          <div className="landing-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="certificate-banner landing-final-cta">
        <div>
          <span className="kicker">Próximo passo</span>
          <h2>Comece pelo plano do seu momento</h2>
          <p>Base para clareza, Pro para operar, Expert para fechar desenho — escolha e entre na trilha.</p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" href="/planos">
            Escolher meu plano
          </Link>
          <Link className="button button-secondary" href="/conta/cadastro">
            Criar conta
          </Link>
        </div>
      </section>
    </div>
  );
}
