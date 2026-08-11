import { prisma } from "@/lib/prisma";
import { listAccessibleModules } from "@/lib/access";
import { requireSession } from "@/lib/session";
import { moduleCoverUrl } from "@/lib/media";
import Link from "next/link";

export default async function AcademiaPage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const modules = await listAccessibleModules(session.user.id);
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { lessonId: true },
  });
  const done = new Set(progress.map((p) => p.lessonId));

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-white">Academia</h1>
      <p className="mt-2 text-[#A8A8AF]">
        Olá, {session.user.name}.{" "}
        {session.user.role === "ADMIN"
          ? "Como admin, você vê todos os módulos."
          : "Seus módulos liberados por planos e compras avulsas."}
      </p>
      {sp.purchased && <p className="mt-4 text-sm text-[#F1C96B]">Compra confirmada. Acesso liberado.</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {modules.length === 0 && (
          <div className="panel text-[#A8A8AF] sm:col-span-2">
            Nenhum acesso ativo. Escolha um{" "}
            <Link href="/planos" className="text-[#F1C96B]">
              plano
            </Link>{" "}
            ou um{" "}
            <Link href="/#modulos" className="text-[#F1C96B]">
              módulo avulso
            </Link>
            .
          </div>
        )}
        {modules.map((m) => {
          const total = m.lessons.length;
          const completed = m.lessons.filter((l) => done.has(l.id)).length;
          const nextIncomplete = m.lessons.find((l) => !done.has(l.id));
          const resume = nextIncomplete || m.lessons[0];
          const cover = m.coverPath || moduleCoverUrl(m.code);
          const allDone = total > 0 && completed >= total;
          return (
            <div key={m.id} className="panel overflow-hidden p-0">
              <div className="relative aspect-[16/9] bg-[#121014]">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={m.title} className="h-full w-full object-cover" />
                ) : null}
                <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-xs text-[#F1C96B]">
                  {m.sourceLabel}
                </span>
              </div>
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs text-[#A8A8AF]">
                    {m.code}
                    {m.category ? ` · ${m.category}` : ""}
                  </p>
                  <h2 className="text-lg font-semibold text-white">{m.title}</h2>
                  <p className="text-sm text-[#A8A8AF]">
                    {completed}/{total} aulas · {m.course.title}
                  </p>
                </div>
                {resume ? (
                  <Link href={`/academia/aula/${resume.id}`} className="btn">
                    {allDone ? "Revisar" : completed > 0 ? "Continuar" : "Começar"}
                  </Link>
                ) : (
                  <span className="text-sm text-[#A8A8AF]">Sem aulas publicadas</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
