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
    <div>
      <h1 className="text-3xl font-semibold text-white">Certificados</h1>
      <p className="mt-2 text-[#A8A8AF]">Emitidos ao concluir todas as aulas de um módulo.</p>
      <div className="mt-8 space-y-3">
        {certs.length === 0 && <p className="text-[#A8A8AF]">Nenhum certificado emitido ainda.</p>}
        {certs.map((c) => {
          const moduleTitle = c.module?.title || c.course.title;
          const moduleCode = c.module?.code ? `${c.module.code} · ` : "";
          return (
            <div key={c.id} className="panel">
              <h2 className="font-semibold text-[#F1C96B]">
                {moduleCode}
                {moduleTitle}
              </h2>
              <p className="mt-1 text-sm text-[#A8A8AF]">Código {c.code}</p>
              <p className="text-sm text-[#A8A8AF]">Emitido em {c.issuedAt.toLocaleDateString("pt-BR")}</p>
              <div className="mt-4 rounded border border-[#2A2D32] bg-[#0f0e12] p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-[#A8A8AF]">Certificado de módulo</p>
                <p className="mt-2 text-xl font-semibold text-white">{session.user.name}</p>
                <p className="mt-1 text-sm text-[#A8A8AF]">
                  concluiu {moduleTitle}
                  {c.course?.title ? ` · ${c.course.title}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
