import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [users, enrollments, orders, modules, plans, posts, audits] = await Promise.all([
    prisma.user.count(),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.module.count(),
    prisma.plan.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.auditLog.count(),
  ]);

  const cards = [
    { label: "Usuários", value: users, href: "/administracao/usuarios" },
    { label: "Matrículas ativas", value: enrollments, href: "/administracao/matriculas" },
    { label: "Pedidos pagos", value: orders, href: "/administracao/pedidos" },
    { label: "Módulos", value: modules, href: "/administracao/conteudo" },
    { label: "Planos", value: plans, href: "/administracao/planos" },
    { label: "Posts do blog", value: posts, href: "/administracao/blog" },
    { label: "Eventos de auditoria", value: audits, href: "/administracao/auditoria" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
      <p className="mt-2 text-[#A8A8AF]">Operação da plataforma Jornada SAP EWM.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="panel hover:border-[#F1C96B]/40">
            <p className="text-sm text-[#A8A8AF]">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#F1C96B]">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
