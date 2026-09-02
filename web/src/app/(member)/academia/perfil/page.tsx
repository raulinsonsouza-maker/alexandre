import { MaskedInput } from "@/components/ui/MaskedInput";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await requireSession();
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || "") || null,
      company: String(formData.get("company") || "") || null,
      jobTitle: String(formData.get("jobTitle") || "") || null,
      city: String(formData.get("city") || "") || null,
      state: String(formData.get("state") || "") || null,
    },
  });
  revalidatePath("/academia/perfil");
}

async function changeOwnPassword(formData: FormData) {
  "use server";
  const session = await requireSession();
  const current = String(formData.get("current") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 6 || password !== confirm) {
    redirect("/academia/perfil?pwd=invalid");
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const ok = await bcrypt.compare(current, user.passwordHash);
  if (!ok) redirect("/academia/perfil?pwd=wrong");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      mustResetPassword: false,
    },
  });
  redirect("/academia/perfil?pwd=ok");
}

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ pwd?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="member-page max-w-xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold text-white">Meu perfil</h1>
        <form action={updateProfile} className="mt-8 space-y-4">
          <input className="input" name="name" defaultValue={user.name} placeholder="Nome" />
          <input className="input" defaultValue={user.email} disabled />
          <MaskedInput
            className="input"
            name="phone"
            mask="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={user.phone || ""}
          />
          <input className="input" name="company" defaultValue={user.company || ""} placeholder="Empresa" />
          <input className="input" name="jobTitle" defaultValue={user.jobTitle || ""} placeholder="Cargo" />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" name="city" defaultValue={user.city || ""} placeholder="Cidade" />
            <input className="input" name="state" defaultValue={user.state || ""} placeholder="UF" />
          </div>
          <button className="btn" type="submit">
            Salvar
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">Trocar senha</h2>
        {sp.pwd === "ok" && <p className="mt-2 text-sm text-[#f7bd31]">Senha atualizada.</p>}
        {sp.pwd === "wrong" && <p className="mt-2 text-sm text-red-400">Senha atual incorreta.</p>}
        {sp.pwd === "invalid" && (
          <p className="mt-2 text-sm text-red-400">Nova senha inválida ou não coincide (mín. 6).</p>
        )}
        <form action={changeOwnPassword} className="mt-4 space-y-4">
          <input className="input" name="current" type="password" placeholder="Senha atual" required />
          <input className="input" name="password" type="password" placeholder="Nova senha" minLength={6} required />
          <input className="input" name="confirm" type="password" placeholder="Confirmar nova senha" minLength={6} required />
          <button className="btn" type="submit">
            Atualizar senha
          </button>
        </form>
      </div>
    </div>
  );
}
