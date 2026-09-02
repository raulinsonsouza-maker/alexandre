import Link from "next/link";
import { LessonPlayer } from "@/components/member/LessonPlayer";
import { MarkCompleteButton } from "@/components/member/MarkCompleteButton";
import { lessonGroup, formatLessonMinutes } from "@/lib/academy";

type LessonRow = {
  id: string;
  title: string;
  sortOrder: number;
  durationSec: number | null;
};

type MaterialRow = {
  id: string;
  title: string;
  filePath: string;
};

export function LessonWorkspace({
  moduleTitle,
  moduleCategory,
  moduleProgress,
  lesson,
  lessons,
  doneIds,
  prevId,
  nextId,
  completed,
  hasVideo,
}: {
  moduleTitle: string;
  moduleCategory: string;
  moduleProgress: number;
  lesson: {
    id: string;
    title: string;
    description: string | null;
    contentKey: string | null;
    videoUrl: string | null;
    videoPath: string | null;
    durationSec: number | null;
    materials: MaterialRow[];
  };
  lessons: LessonRow[];
  doneIds: string[];
  prevId: string | null;
  nextId: string | null;
  completed: boolean;
  hasVideo: boolean;
}) {
  const doneSet = new Set(doneIds);
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const number = String(idx + 1).padStart(2, "0");
  const totalMin = lessons.reduce((sum, l) => sum + Math.max(1, Math.round((l.durationSec || 12 * 60) / 60)), 0);
  const durationLabel = `${lessons.length} aulas · ${Math.floor(totalMin / 60)}h ${String(totalMin % 60).padStart(2, "0")}min`;

  let previousGroup = "";

  return (
    <section className="module-view is-page" aria-labelledby="module-view-title">
      <header className="module-header">
        <Link className="module-back" href="/academia">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 5-7 7 7 7" />
          </svg>
          <span>Voltar para a academia</span>
        </Link>
        <div className="module-header-title">
          <small>{moduleCategory}</small>
          <strong id="module-view-title">{moduleTitle}</strong>
        </div>
        <div className="module-header-progress">
          <div>
            <span>Progresso do módulo</span>
            <strong>{moduleProgress}%</strong>
          </div>
          <div>
            <i style={{ width: `${moduleProgress}%` }} />
          </div>
        </div>
      </header>

      <div className="module-workspace">
        <div className="lesson-stage">
          <div className={`video-shell${hasVideo ? " has-player" : ""}`}>
            <LessonPlayer videoUrl={lesson.videoUrl} videoPath={lesson.videoPath} />
          </div>

          <section className="lesson-about" aria-labelledby="current-lesson-title">
            <div className="lesson-heading">
              <div>
                <span className="kicker">
                  Aula {number} de {lessons.length}
                </span>
                <h1 id="current-lesson-title">{lesson.title}</h1>
              </div>
              <MarkCompleteButton lessonId={lesson.id} completed={completed} />
            </div>
            {lesson.description ? <p>{lesson.description}</p> : null}
            {lesson.contentKey ? <p>{lesson.contentKey}</p> : null}

            <div className="lesson-navigation">
              {prevId ? (
                <Link href={`/academia/aula/${prevId}`}>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m12 4-6 6 6 6" />
                  </svg>
                  Aula anterior
                </Link>
              ) : (
                <span className="is-disabled" style={{ display: "flex", alignItems: "center", opacity: 0.3, fontSize: 10 }}>
                  Aula anterior
                </span>
              )}
              {nextId ? (
                <Link className="next-lesson" href={`/academia/aula/${nextId}`}>
                  Próxima aula
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m8 4 6 6-6 6" />
                  </svg>
                </Link>
              ) : (
                <span className="is-disabled" style={{ display: "flex", alignItems: "center", opacity: 0.3, fontSize: 10 }}>
                  Próxima aula
                </span>
              )}
            </div>

            {lesson.materials.length > 0 ? (
              <div className="lesson-materials">
                <div>
                  <span className="kicker">Materiais desta aula</span>
                  <h3>Recursos para acompanhar o conteúdo</h3>
                </div>
                <div>
                  {lesson.materials.map((m) => (
                    <a key={m.id} href={`/uploads/${m.filePath}`} target="_blank" rel="noreferrer">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 3h9l4 4v14H6zM15 3v5h4M9 13h7M9 17h5" />
                      </svg>
                      <span>
                        <strong>{m.title}</strong>
                        <small>Abrir material</small>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="lesson-sidebar" aria-label="Aulas do módulo">
          <div className="lesson-sidebar-header">
            <div>
              <span>Conteúdo do módulo</span>
              <strong>{durationLabel}</strong>
            </div>
            <Link href="/academia" aria-label="Fechar módulo">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </Link>
          </div>
          <div className="lesson-list">
            {lessons.map((l, index) => {
              const group = lessonGroup(index, lessons.length);
              const showGroup = group !== previousGroup;
              previousGroup = group;
              const complete = doneSet.has(l.id);
              const current = l.id === lesson.id;
              const status = complete ? "✓" : current ? "▶" : String(index + 1).padStart(2, "0");
              const minutes = formatLessonMinutes(l.durationSec);
              return (
                <span key={l.id}>
                  {showGroup ? <span className="lesson-group-label">{group}</span> : null}
                  <Link
                    className={`lesson-item${complete ? " is-complete" : ""}${current ? " is-current" : ""}`}
                    href={`/academia/aula/${l.id}`}
                    aria-current={current ? "true" : undefined}
                  >
                    <span className="lesson-status" aria-hidden="true">
                      {status}
                    </span>
                    <span className="lesson-copy">
                      <strong>{l.title}</strong>
                      <small>Aula {String(index + 1).padStart(2, "0")}</small>
                    </span>
                    <span className="lesson-duration">{minutes || ""}</span>
                  </Link>
                </span>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
