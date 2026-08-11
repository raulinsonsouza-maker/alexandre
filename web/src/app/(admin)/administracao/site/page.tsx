import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function saveSetting(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const key = String(formData.get("key"));
  const value = String(formData.get("value") || "");
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "site.setting",
    entityType: "SiteSetting",
    entityId: key,
  });
  revalidatePath("/administracao/site");
  revalidatePath("/");
}

async function createBanner(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const banner = await prisma.siteBanner.create({
    data: {
      title: String(formData.get("title") || "").trim(),
      subtitle: String(formData.get("subtitle") || "") || null,
      imagePath: String(formData.get("imagePath") || "") || null,
      linkUrl: String(formData.get("linkUrl") || "") || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      active: formData.get("active") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "banner.create",
    entityType: "SiteBanner",
    entityId: banner.id,
  });
  revalidatePath("/administracao/site");
  revalidatePath("/");
}

async function updateBanner(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.siteBanner.update({
    where: { id },
    data: {
      title: String(formData.get("title") || "").trim(),
      subtitle: String(formData.get("subtitle") || "") || null,
      imagePath: String(formData.get("imagePath") || "") || null,
      linkUrl: String(formData.get("linkUrl") || "") || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      active: formData.get("active") === "on",
    },
  });
  await writeAudit({
    actorId: session.user.id,
    action: "banner.update",
    entityType: "SiteBanner",
    entityId: id,
  });
  revalidatePath("/administracao/site");
  revalidatePath("/");
}

async function toggleBanner(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.siteBanner.update({ where: { id }, data: { active: !active } });
  await writeAudit({
    actorId: session.user.id,
    action: "banner.toggle",
    entityType: "SiteBanner",
    entityId: id,
  });
  revalidatePath("/administracao/site");
  revalidatePath("/");
}

async function deleteBanner(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.siteBanner.delete({ where: { id } });
  await writeAudit({
    actorId: session.user.id,
    action: "banner.delete",
    entityType: "SiteBanner",
    entityId: id,
  });
  revalidatePath("/administracao/site");
  revalidatePath("/");
}

const SETTING_KEYS = [
  { key: "hero_title", label: "Título do hero" },
  { key: "hero_subtitle", label: "Subtítulo do hero" },
  { key: "whatsapp_url", label: "URL WhatsApp" },
  { key: "contact_email", label: "E-mail de contato" },
];

export default async function AdminSitePage() {
  await requireRole(["ADMIN"]);
  const [settings, banners] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.siteBanner.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Site</h1>
      <p className="mt-2 text-[#A8A8AF]">Textos da home, WhatsApp e banners de destaque.</p>

      <div className="mt-6 space-y-4">
        {SETTING_KEYS.map((s) => (
          <form key={s.key} action={saveSetting} className="panel grid gap-2 md:grid-cols-[180px_1fr_auto]">
            <input type="hidden" name="key" value={s.key} />
            <label className="text-sm text-[#A8A8AF]">{s.label}</label>
            <input className="input" name="value" defaultValue={map[s.key] || ""} />
            <button className="btn" type="submit">
              Salvar
            </button>
          </form>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold text-white">Banners</h2>
      <form action={createBanner} className="panel mt-4 grid gap-3 md:grid-cols-2">
        <input className="input" name="title" placeholder="Título" required />
        <input className="input" name="subtitle" placeholder="Subtítulo" />
        <input className="input" name="imagePath" placeholder="Imagem /media/..." />
        <input className="input" name="linkUrl" placeholder="Link (ex: /modulos/slug)" />
        <input className="input" name="sortOrder" type="number" defaultValue={0} />
        <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="active" defaultChecked /> Ativo
        </label>
        <button className="btn md:col-span-2" type="submit">
          Criar banner
        </button>
      </form>

      <div className="mt-4 space-y-4">
        {banners.map((b) => (
          <div key={b.id} className="panel space-y-3">
            <form action={updateBanner} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={b.id} />
              <input className="input" name="title" defaultValue={b.title} required />
              <input className="input" name="subtitle" defaultValue={b.subtitle || ""} placeholder="Subtítulo" />
              <input className="input" name="imagePath" defaultValue={b.imagePath || ""} placeholder="Imagem" />
              <input className="input" name="linkUrl" defaultValue={b.linkUrl || ""} placeholder="Link" />
              <input className="input" name="sortOrder" type="number" defaultValue={b.sortOrder} />
              <label className="flex items-center gap-2 text-sm text-[#A8A8AF]">
                <input type="checkbox" name="active" defaultChecked={b.active} /> Ativo
              </label>
              <div className="md:col-span-2">
                <button className="btn" type="submit">
                  Salvar
                </button>
              </div>
            </form>
            <div className="flex gap-2">
              <form action={toggleBanner}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="active" value={String(b.active)} />
                <button className="btn-ghost" type="submit">
                  {b.active ? "Desativar" : "Ativar"}
                </button>
              </form>
              <form action={deleteBanner}>
                <input type="hidden" name="id" value={b.id} />
                <button className="btn-ghost text-red-400" type="submit">
                  Excluir
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
