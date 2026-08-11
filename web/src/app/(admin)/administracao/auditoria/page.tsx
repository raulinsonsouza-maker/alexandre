import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function AuditoriaPage() {
  await requireRole(["ADMIN"]);
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Auditoria</h1>
      <div className="panel mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Quando</th>
              <th>Quem</th>
              <th>Ação</th>
              <th>Entidade</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap text-xs">{l.createdAt.toLocaleString("pt-BR")}</td>
                <td>{l.actor?.email || "sistema"}</td>
                <td>{l.action}</td>
                <td className="text-xs text-[#A8A8AF]">
                  {l.entityType} {l.entityId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
