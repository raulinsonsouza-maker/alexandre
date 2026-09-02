import Link from "next/link";
import { CourseCard } from "@/components/ui/CourseCard";
import { CourseRail } from "@/components/ui/CourseRail";
import type { AcademyModuleCard, AcademyRail } from "@/lib/academy-dashboard";

export function AcademyEmptyState({ name }: { name: string }) {
  return (
    <div className="academy-subpage">
      <header className="academy-subpage-head">
        <span className="kicker">Academia</span>
        <h1>Área do aluno</h1>
      </header>
      <div className="academy-subpage-body">
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
      </div>
    </div>
  );
}

export function AcademyJourneyView({
  summary,
  inProgress,
  notStarted,
  completed,
}: {
  summary: {
    percent: number;
    completedLessons: number;
    weekLabel: string;
    moduleCount: number;
  };
  inProgress: AcademyModuleCard[];
  notStarted: AcademyModuleCard[];
  completed: AcademyModuleCard[];
}) {
  return (
    <div className="academy-subpage">
      <header className="academy-subpage-head">
        <span className="kicker">Minha jornada</span>
        <h1>Seu progresso</h1>
      </header>

      <section className="dashboard academy-subpage-dashboard" aria-label="Resumo da jornada">
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
            Ver certificados
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m7 4 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      <div className="academy-subpage-body">
        <ModuleProgressList title="Em andamento" items={inProgress} empty="Nenhum módulo em andamento." />
        <ModuleProgressList title="Ainda não iniciados" items={notStarted} empty="Você já começou todos os módulos liberados." />
        <ModuleProgressList title="Concluídos" items={completed} empty="Nenhum módulo concluído ainda." />
      </div>
    </div>
  );
}

function ModuleProgressList({
  title,
  items,
  empty,
}: {
  title: string;
  items: AcademyModuleCard[];
  empty: string;
}) {
  if (!items.length) {
    return (
      <section className="academy-module-section">
        <h2>{title}</h2>
        <p className="academy-module-empty">{empty}</p>
      </section>
    );
  }

  return (
    <section className="academy-module-section">
      <h2>{title}</h2>
      <ul className="academy-module-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className="academy-module-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.cover} alt="" width={96} height={54} />
              <div className="academy-module-row-main">
                <strong>{item.title}</strong>
                <small>
                  {item.category} · {item.completedCount}/{item.lessons} aulas
                </small>
                <div className="progress-track">
                  <i style={{ ["--progress" as string]: `${item.progress}%` }} />
                </div>
              </div>
              <span className="academy-module-row-pct">{item.progress}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
