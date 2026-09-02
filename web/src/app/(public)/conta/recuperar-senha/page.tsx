import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";
import { sendEmail, resetPasswordEmailHtml } from "@/lib/email";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

async function requestReset(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const link = `${base}/conta/recuperar-senha?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Redefinir senha",
      html: resetPasswordEmailHtml(user.name, link),
    });
  }
  redirect("/conta/recuperar-senha?sent=1");
}

async function resetPassword(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (!token || password.length < 6) redirect("/conta/recuperar-senha?error=1");

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) redirect("/conta/recuperar-senha?error=token");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash, mustResetPassword: false } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  redirect("/conta/entrar?reset=1");
}

export default async function RecuperarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; sent?: string; error?: string }>;
}) {
  const sp = await searchParams;

  if (sp.token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-semibold text-white">Nova senha</h1>
        {sp.error && <p className="mt-4 text-sm text-red-400">Token inválido ou expirado.</p>}
        <form action={resetPassword} className="mt-8 space-y-4">
          <input type="hidden" name="token" value={sp.token} />
          <input className="input" name="password" type="password" placeholder="Nova senha" minLength={6} required />
          <button className="btn w-full" type="submit">
            Salvar senha
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold text-white">Recuperar senha</h1>
      {sp.sent && <p className="mt-4 text-sm text-[#f7bd31]">Se o e-mail existir, enviamos o link (veja o log do servidor em modo demo).</p>}
      <form action={requestReset} className="mt-8 space-y-4">
        <input className="input" name="email" type="email" placeholder="Seu e-mail" required />
        <button className="btn w-full" type="submit">
          Enviar link
        </button>
      </form>
    </div>
  );
}
