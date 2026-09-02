import Link from "next/link";

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

const AUDIENCES = [
  {
    title: "Consultores SAP",
    text: "Para quem precisa desenhar, configurar e defender a solução no projeto.",
  },
  {
    title: "Key users e operação",
    text: "Para quem sustenta o armazém no dia a dia: entrada, saída, inventário e monitoração.",
  },
  {
    title: "Times e empresas",
    text: "Para capacitar o time com a mesma formação e acompanhamento corporativo.",
    href: "/empresas",
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
    "Isso substitui a certificação oficial SAP?",
    "Não. O certificado da Jornada comprova a conclusão dos módulos na Academia. A certificação oficial SAP segue o processo da SAP.",
  ],
  [
    "Quando o acesso é liberado?",
    "Assim que o pagamento for confirmado. Entre na Academia com o mesmo e-mail da compra.",
  ],
  [
    "Por quanto tempo tenho acesso?",
    "Enquanto a matrícula estiver ativa. Você estuda no seu ritmo, sem turma fixa.",
  ],
  [
    "E para capacitar o time da empresa?",
    "O plano Corporate atende times com licenças e trilhas por perfil. Proposta sob consulta em Empresas.",
  ],
];

export function LandingHome({
  modules,
  banners,
  plans = [],
  heroTitle,
  heroSubtitle,
}: {
  modules: LandingModule[];
  banners: LandingBanner[];
  plans?: LandingPlan[];
  heroTitle?: string;
  heroSubtitle?: string;
}) {
  const categories = [...new Set(modules.map((m) => m.category || "Geral"))];
  const banner = banners[0];
  const cover = banner?.imagePath || "/brand/hero-academy.jpg";
  const title = heroTitle || "Domine SAP EWM com a jornada completa";
  const description =
    heroSubtitle ||
    "Formação prática em SAP EWM para consultores, key users e times de logística.";

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
          <div className="hero-actions">
            <Link className="button button-primary" href="/planos">
              Ver planos
            </Link>
            <Link className="button button-secondary" href="/modulos">
              Explorar módulos
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-block" id="oferta">
        <div className="landing-wrap">
          <header className="landing-heading">
            <span className="kicker">Para quem é</span>
            <h2>Consultores, operação e empresas</h2>
          </header>
          <div className="landing-grid-3">
            {AUDIENCES.map((item) => (
              <article key={item.title} className="landing-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {"href" in item && item.href ? (
                  <Link href={item.href} className="landing-card-link">
                    Ver formação para empresas
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-block" id="planos">
        <div className="landing-wrap">
          <header className="landing-heading">
            <span className="kicker">Planos</span>
            <h2>Base, Pro, Expert e Corporate</h2>
            <p>Planos cumulativos. Comece pelo Base e evolua quando o projeto pedir mais profundidade.</p>
          </header>
          {plans.length > 0 ? (
            <div className="landing-plans">
              {plans.map((plan) => {
                const featured = plan.badge?.toLowerCase().includes("recomend");
                return (
                  <article key={plan.slug} className={featured ? "landing-plan is-featured" : "landing-plan"}>
                    {plan.badge ? <span className="landing-plan-badge">{plan.badge}</span> : null}
                    <h3>{plan.name}</h3>
                    {plan.goal ? <p>{plan.goal}</p> : null}
                    <strong>{plan.checkoutEnabled ? formatBRL(plan.priceCents) : "Sob consulta"}</strong>
                    <small>{plan.moduleCount} módulos incluídos</small>
                    <Link href={`/planos/${plan.slug}`}>{plan.checkoutEnabled ? `Ver ${plan.name}` : "Ver Corporate"}</Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="landing-empty">Os planos aparecem aqui assim que forem publicados.</p>
          )}
        </div>
      </section>

      <section className="landing-block" id="sobre">
        <div className="landing-wrap landing-mentor">
          <div className="landing-mentor-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/alexandre.jpeg" alt="Alexandre Santos Brunelli, mentor da Jornada SAP EWM" />
            <span>Mentor da Jornada</span>
          </div>
          <div>
            <span className="kicker">Quem conduz</span>
            <h2>Aprenda com quem atua em projetos reais de alta criticidade</h2>
            <p>
              Alexandre Santos Brunelli é consultor SAP sênior e instrutor — mais de 25 anos no ecossistema SAP e mais
              de 15 dedicados ao EWM, em projetos nacionais e internacionais.
            </p>
            <Link className="button button-secondary" href="/sobre">
              Conhecer o especialista
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-block">
        <div className="landing-wrap">
          <header className="landing-heading">
            <span className="kicker">Conteúdo</span>
            <h2>As trilhas da jornada</h2>
          </header>
          {categories.length > 0 ? (
            <div className="landing-tracks">
              {categories.map((name) => {
                const count = modules.filter((m) => (m.category || "Geral") === name).length;
                return (
                  <Link key={name} href="/modulos" className="landing-track">
                    <strong>{name}</strong>
                    <span>
                      {count} {count === 1 ? "módulo" : "módulos"}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}
          <div className="landing-catalog-cta">
            <Link className="button button-secondary" href="/modulos">
              Ver todos os módulos
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-block" id="faq">
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

      <section className="certificate-banner">
        <div>
          <span className="kicker">Comece agora</span>
          <h2>Entre na Academia</h2>
          <p>Escolha um plano ou crie sua conta para acompanhar o progresso.</p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" href="/planos">
            Ver planos
          </Link>
          <Link className="button button-secondary" href="/conta/cadastro">
            Criar conta
          </Link>
        </div>
      </section>
    </div>
  );
}
