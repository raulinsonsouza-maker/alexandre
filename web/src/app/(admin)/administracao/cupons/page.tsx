import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function createCoupon(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const percentOff = Number(formData.get("percentOff") || 0) || null;
  const amountReais = Number(formData.get("amountOff") || 0);
  const amountOffCents = amountReais > 0 ? Math.round(amountReais * 100) : null;
  const coupon = await prisma.coupon.create({
    data: {
      code,
      percentOff,
      amountOffCents,
      active: true,
      maxRedemptions: Number(formData.get("maxRedemptions") || 0) || null,
      expiresAt: formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : null,
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "coupon.create",
    entityType: "Coupon",
    entityId: coupon.id,
  });
  revalidatePath("/administracao/cupons");
}

async function updateCoupon(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const percentOff = Number(formData.get("percentOff") || 0) || null;
  const amountReais = Number(formData.get("amountOff") || 0);
  await prisma.coupon.update({
    where: { id },
    data: {
      code: String(formData.get("code") || "").trim().toUpperCase(),
      percentOff,
      amountOffCents: amountReais > 0 ? Math.round(amountReais * 100) : null,
      maxRedemptions: Number(formData.get("maxRedemptions") || 0) || null,
      expiresAt: formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : null,
      active: formData.get("active") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "coupon.update",
    entityType: "Coupon",
    entityId: id,
  });
  revalidatePath("/administracao/cupons");
}

async function toggleCoupon(formData: FormData) {
  "use server";
  await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.coupon.update({ where: { id }, data: { active: !active } });
  revalidatePath("/administracao/cupons");
}

export default async function CuponsPage() {
  await requireRole(["ADMIN"]);
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Cupons</h1>
      <form action={createCoupon} className="panel mt-6 grid gap-3 md:grid-cols-3">
        <input className="input" name="code" placeholder="Código" required />
        <input className="input" name="percentOff" type="number" placeholder="% off" />
        <input className="input" name="amountOff" type="number" step="0.01" placeholder="R$ off" />
        <input className="input" name="maxRedemptions" type="number" placeholder="Máx. usos" />
        <input className="input" name="expiresAt" type="date" />
        <button className="btn" type="submit">
          Criar
        </button>
      </form>
      <div className="mt-6 space-y-4">
        {coupons.map((c) => (
          <div key={c.id} className="panel space-y-3">
            <form action={updateCoupon} className="grid gap-3 md:grid-cols-3">
              <input type="hidden" name="id" value={c.id} />
              <input className="input" name="code" defaultValue={c.code} required />
              <input
                className="input"
                name="percentOff"
                type="number"
                defaultValue={c.percentOff ?? ""}
                placeholder="% off"
              />
              <input
                className="input"
                name="amountOff"
                type="number"
                step="0.01"
                defaultValue={c.amountOffCents ? c.amountOffCents / 100 : ""}
                placeholder="R$ off"
              />
              <input
                className="input"
                name="maxRedemptions"
                type="number"
                defaultValue={c.maxRedemptions ?? ""}
                placeholder="Máx. usos"
              />
              <input
                className="input"
                name="expiresAt"
                type="date"
                defaultValue={c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : ""}
              />
              <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
                <input type="checkbox" name="active" defaultChecked={c.active} /> Ativo
              </label>
              <p className="text-xs text-[#A8A8AF] md:col-span-2">
                Usos: {c.redemptionCount}
                {c.maxRedemptions ? `/${c.maxRedemptions}` : ""}
              </p>
              <div className="md:col-span-3">
                <button className="btn" type="submit">
                  Salvar
                </button>
              </div>
            </form>
            <form action={toggleCoupon}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="active" value={String(c.active)} />
              <button className="btn-ghost px-2 py-1 text-xs" type="submit">
                {c.active ? "Desativar rápido" : "Ativar rápido"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
