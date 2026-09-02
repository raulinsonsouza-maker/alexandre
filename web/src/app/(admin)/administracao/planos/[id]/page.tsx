import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";

async function updatePlan(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const goal = String(formData.get("goal") || "") || null;
  const priceCents = Math.round(Number(formData.get("price") || 0) * 100);
  const badge = String(formData.get("badge") || "") || null;
  const bullets = String(formData.get("bullets") || "")
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
  const checkoutEnabled = formData.get("checkoutEnabled") === "on";
  const ctaUrl = String(formData.get("ctaUrl") || "") || null;
  const published = formData.get("published") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  await prisma.plan.update({
    where: { id },
    data: { name, goal, priceCents, badge, bullets, checkoutEnabled, ctaUrl, published, sortOrder },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "plan.update",
    entityType: "Plan",
    entityId: id,
  });
  revalidatePath(`/administracao/planos/${id}`);
  revalidatePath("/administracao/planos");
  revalidatePath("/planos");
}

async function syncModules(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const planId = String(formData.get("planId"));
  const moduleIds = formData.getAll("moduleIds").map(String);
  await prisma.planModule.deleteMany({ where: { planId } });
  if (moduleIds.length) {
    await prisma.planModule.createMany({
      data: moduleIds.map((moduleId) => ({ planId, moduleId })),
      skipDuplicates: true,
    });
  }
  await writeAudit({
    actorId: session.user.id,
    action: "plan.modules_sync",
    entityType: "Plan",
    entityId: planId,
    meta: { count: moduleIds.length },
  });
  revalidatePath(`/administracao/planos/${planId}`);
}

export default async function AdminPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { modules: { select: { moduleId: true } } },
  });
  if (!plan) notFound();

  const modules = await prisma.module.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, code: true, title: true, category: true, published: true },
  });
  const selected = new Set(plan.modules.map((m) => m.moduleId));
  const bullets = Array.isArray(plan.bullets)
    ? (plan.bullets as string[]).join("\n")
    : "";

  return (
    <div>
      <Link href="/administracao/planos" className="text-sm text-[#A8A8AF] hover:text-[#f7bd31]">
        ← Planos
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-white">Editar {plan.name}</h1>

      <form action={updatePlan} className="panel mt-6 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="id" value={plan.id} />
        <input className="input" name="name" defaultValue={plan.name} required />
        <input className="input" name="goal" defaultValue={plan.goal || ""} />
        <input
          className="input"
          name="price"
          type="number"
          step="0.01"
          defaultValue={(plan.priceCents / 100).toFixed(2)}
        />
        <input className="input" name="badge" defaultValue={plan.badge || ""} />
        <input className="input" name="sortOrder" type="number" defaultValue={plan.sortOrder} />
        <input className="input" name="ctaUrl" defaultValue={plan.ctaUrl || ""} placeholder="CTA URL" />
        <textarea className="input md:col-span-2 min-h-[100px]" name="bullets" defaultValue={bullets} />
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="checkoutEnabled" defaultChecked={plan.checkoutEnabled} />{" "}
          Checkout habilitado (usa o preço acima; Corporate deixe desmarcado)
        </label>
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="published" defaultChecked={plan.published} /> Publicado
        </label>
        <button className="btn md:col-span-2" type="submit">
          Salvar plano
        </button>
      </form>

      <form action={syncModules} className="panel mt-6">
        <input type="hidden" name="planId" value={plan.id} />
        <h2 className="mb-4 text-lg font-semibold text-white">Módulos incluídos</h2>
        <div className="max-h-[420px] space-y-2 overflow-y-auto">
          {modules.map((m) => (
            <label key={m.id} className="flex items-start gap-3 text-sm text-[#A8A8AF]">
              <input type="checkbox" name="moduleIds" value={m.id} defaultChecked={selected.has(m.id)} />
              <span>
                <span className="text-white">
                  {m.code} — {m.title}
                </span>
                {m.category ? ` · ${m.category}` : ""}
                {!m.published ? " (rascunho)" : ""}
              </span>
            </label>
          ))}
        </div>
        <button className="btn mt-4" type="submit">
          Salvar módulos do plano
        </button>
      </form>
    </div>
  );
}
