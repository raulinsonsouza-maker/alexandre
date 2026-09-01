import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function upsertPlan(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const goal = String(formData.get("goal") || "") || null;
  const priceCents = Math.round(Number(formData.get("price") || 0) * 100);
  const badge = String(formData.get("badge") || "") || null;
  const bulletsRaw = String(formData.get("bullets") || "");
  const bullets = bulletsRaw
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
  const checkoutEnabled = formData.get("checkoutEnabled") === "on";
  const ctaUrl = String(formData.get("ctaUrl") || "") || null;
  const published = formData.get("published") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const data = {
    slug,
    name,
    goal,
    priceCents,
    badge,
    bullets,
    checkoutEnabled,
    ctaUrl,
    published,
    sortOrder,
  };

  const plan = id
    ? await prisma.plan.update({ where: { id }, data })
    : await prisma.plan.create({ data });

  await writeAudit({
    actorId: session.user.id,
    action: id ? "plan.update" : "plan.create",
    entityType: "Plan",
    entityId: plan.id,
  });
  revalidatePath("/administracao/planos");
  revalidatePath("/planos");
}

export default async function AdminPlanosPage() {
  await requireRole(["ADMIN"]);
  const plans = await prisma.plan.findMany({
    include: { _count: { select: { modules: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Planos</h1>
      <p className="mt-2 text-[#A8A8AF]">
        Pacotes Base / Pro / Expert / Corporate. Preço + checkout habilitado + publicar já abre a
        cobrança na Academia.
      </p>

      <form action={upsertPlan} className="panel mt-6 grid gap-3 md:grid-cols-2">
        <input className="input" name="slug" placeholder="slug (base, pro…)" required />
        <input className="input" name="name" placeholder="Nome" required />
        <input className="input" name="goal" placeholder="Objetivo" />
        <input className="input" name="price" type="number" step="0.01" placeholder="Preço R$" defaultValue={0} />
        <input className="input" name="badge" placeholder="Badge (opcional)" />
        <input className="input" name="sortOrder" type="number" defaultValue={0} placeholder="Ordem" />
        <input className="input md:col-span-2" name="ctaUrl" placeholder="CTA URL (Corporate WhatsApp)" />
        <textarea
          className="input md:col-span-2 min-h-[100px]"
          name="bullets"
          placeholder="Benefícios (um por linha)"
        />
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="checkoutEnabled" defaultChecked /> Checkout habilitado
        </label>
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="published" defaultChecked /> Publicado
        </label>
        <button className="btn md:col-span-2" type="submit">
          Criar plano
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {plans.map((p) => (
          <div key={p.id} className="panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs text-[#A8A8AF]">
                {p.slug} · {p._count.modules} módulos ·{" "}
                {p.checkoutEnabled ? "Checkout" : "WhatsApp/CTA"} ·{" "}
                {p.published ? "Publicado" : "Rascunho"}
              </p>
              <h2 className="text-lg font-semibold text-white">{p.name}</h2>
              <p className="text-sm text-[#F1C96B]">
                {p.checkoutEnabled
                  ? `R$ ${(p.priceCents / 100).toFixed(2)}`
                  : p.ctaUrl || "Sob consulta"}
              </p>
            </div>
            <Link href={`/administracao/planos/${p.id}`} className="btn">
              Editar / módulos
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
