import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

async function changePasswordAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/conta/entrar");

  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 6 || password !== confirm) {
    redirect("/conta/trocar-senha?error=1");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      mustResetPassword: false,
    },
  });

  // Nova sessão JWT sem a flag (middleware lê o token, não o DB)
  await signOut({ redirectTo: "/conta/entrar?reset=1" });
}

export default async function TrocarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/conta/entrar");
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold text-white">Trocar senha</h1>
      <p className="mt-2 text-[#A8A8AF]">
        Por segurança, defina uma nova senha antes de continuar.
      </p>
      {sp.error && <p className="mt-4 text-sm text-red-400">Senhas inválidas ou não coincidem (mín. 6).</p>}
      <form action={changePasswordAction} className="mt-8 space-y-4">
        <input className="input" name="password" type="password" placeholder="Nova senha" minLength={6} required />
        <input className="input" name="confirm" type="password" placeholder="Confirmar senha" minLength={6} required />
        <button className="btn w-full" type="submit">
          Salvar e continuar
        </button>
      </form>
    </div>
  );
}
