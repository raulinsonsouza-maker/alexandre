import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function CertificadosPage() {
  const session = await requireSession();
  const certs = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { course: true, module: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="academy-subpage">
      <header className="academy-subpage-head">
        <span className="kicker">Certificados</span>
        <h1>Suas conquistas</h1>
        <p className="academy-subpage-lead">
          Emitidos automaticamente ao concluir todas as aulas de um módulo.
        </p>
      </header>

      <div className="academy-subpage-body">
        {certs.length === 0 ? (
          <div className="panel">
            <p className="academy-module-empty">Nenhum certificado emitido ainda.</p>
            <p className="academy-subpage-lead" style={{ marginTop: 8 }}>
              Conclua as aulas de um módulo para liberar o certificado.{" "}
              <Link href="/academia/catalogo" className="text-[#f7bd31]">
                Ver módulos
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="academy-cert-list">
            {certs.map((c) => {
              const moduleTitle = c.module?.title || c.course.title;
              const moduleCode = c.module?.code ? `${c.module.code} · ` : "";
              return (
                <article key={c.id} className="panel academy-cert-card">
                  <div>
                    <h2 className="academy-cert-title">
                      {moduleCode}
                      {moduleTitle}
                    </h2>
                    <p className="academy-cert-meta">Código {c.code}</p>
                    <p className="academy-cert-meta">
                      Emitido em {c.issuedAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="academy-cert-preview">
                    <p className="academy-cert-preview-kicker">Certificado de módulo</p>
                    <p className="academy-cert-preview-name">{session.user.name}</p>
                    <p className="academy-cert-preview-text">
                      concluiu {moduleTitle}
                      {c.course?.title ? ` · ${c.course.title}` : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
