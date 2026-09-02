import Link from "next/link";
import { CourseCard } from "@/components/ui/CourseCard";
import { CourseRail } from "@/components/ui/CourseRail";

export type AcademyModuleCard = {
  id: string;
  title: string;
  category: string;
  cover: string;
  href: string;
  lessons: number;
  progress: number;
  badge?: string | null;
};

export type AcademyRail = {
  key: string;
  title: string;
  subtitle: string;
  items: AcademyModuleCard[];
};

export function AcademyHome({
  name,
  purchased,
  hero,
  summary,
  rails,
  certificate,
}: {
  name: string;
  purchased?: boolean;
  hero: {
    title: string;
    description: string;
    cover: string;
    category: string;
    lessons: number;
    progress: number;
    resumeHref: string | null;
    resumeLabel: string;
    detailsHref: string;
    eyebrow: string;
  } | null;
  summary: {
    percent: number;
    completedLessons: number;
    weekLabel: string;
    moduleCount: number;
  };
  rails: AcademyRail[];
  certificate: {
    kicker: string;
    title: string;
    text: string;
    href: string;
    cta: string;
  };
}) {
  if (!hero) {
    return (
      <main className="catalog" style={{ paddingTop: 120 }}>
        <section className="rail-section">
          <div className="panel text-[#aaaab2]">
            Olá, {name}. Nenhum acesso ativo. Escolha um{" "}
            <Link href="/planos" className="text-[var(--gold)]">
              plano
            </Link>{" "}
            ou um{" "}
            <Link href="/modulos" className="text-[var(--gold)]">
              módulo avulso
            </Link>
            .
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-media" src={hero.cover} alt="" width={1024} height={576} />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow">
            <span>{hero.eyebrow}</span>
            <i /> {hero.category}
          </div>
          <h1 id="hero-title">{hero.title}</h1>
          <p>{hero.description}</p>
          <div className="hero-meta" aria-label="Informações do módulo">
            <span>{hero.category}</span>
            <span>{hero.lessons} aulas</span>
            <span>{hero.progress}% concluído</span>
            <span>Português</span>
          </div>
          <div className="hero-actions">
            {hero.resumeHref ? (
              <Link className="button button-primary" href={hero.resumeHref}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 7 8 5-8 5Z" />
                </svg>
                {hero.resumeLabel}
              </Link>
            ) : null}
            <Link className="button button-secondary" href={hero.detailsHref}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v6M12 7.5v.5" />
              </svg>
              Ver detalhes
            </Link>
          </div>
          <div className="hero-progress">
            <div>
              <span>Seu progresso</span>
              <strong>{hero.progress}%</strong>
            </div>
            <div className="progress-track">
              <i style={{ ["--progress" as string]: `${hero.progress}%` }} />
            </div>
          </div>
        </div>
        <a className="hero-scroll" href="#minha-jornada">
          Explorar minha jornada
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m5 7 5 5 5-5" />
          </svg>
        </a>
      </section>

      <section className="dashboard" id="minha-jornada" aria-label="Resumo da jornada">
        <div className="journey-summary">
          <div className="summary-title">
            <span className="summary-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-7" />
              </svg>
            </span>
            <div>
              <small>Sua evolução</small>
              <strong>{summary.percent}% da jornada concluída</strong>
            </div>
          </div>
          <div className="summary-progress">
            <i style={{ ["--progress" as string]: `${summary.percent}%` }} />
          </div>
          <div className="summary-stats">
            <div>
              <strong>{summary.completedLessons}</strong>
              <span>aulas concluídas</span>
            </div>
            <div>
              <strong>{summary.weekLabel}</strong>
              <span>nesta semana</span>
            </div>
            <div>
              <strong>{summary.moduleCount}</strong>
              <span>módulos liberados</span>
            </div>
          </div>
          <Link className="summary-action" href="/academia/certificados">
            Ver meu desempenho
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m7 4 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      {purchased ? (
        <p className="kicker" style={{ paddingInline: "var(--gutter)", marginBottom: 8 }}>
          Compra confirmada. Acesso liberado.
        </p>
      ) : null}

      <div className="catalog" id="catalogo">
        {rails.map((rail) => (
          <CourseRail key={rail.key} title={rail.title} subtitle={rail.subtitle}>
            {rail.items.map((item, index) => (
              <CourseCard
                key={item.id}
                href={item.href}
                title={item.title}
                image={item.cover}
                label={item.progress > 0 ? `${item.progress}% concluído` : item.category}
                details={[item.category, `${item.lessons} aulas`]}
                progress={item.progress}
                badge={item.badge || (index === 0 && item.progress === 0 ? "Recomendado" : null)}
              />
            ))}
          </CourseRail>
        ))}
      </div>

      <section className="certificate-banner" id="certificados">
        <div>
          <span className="kicker">{certificate.kicker}</span>
          <h2>{certificate.title}</h2>
          <p>{certificate.text}</p>
        </div>
        <Link className="button button-outline" href={certificate.href}>
          {certificate.cta}
        </Link>
      </section>
    </>
  );
}
