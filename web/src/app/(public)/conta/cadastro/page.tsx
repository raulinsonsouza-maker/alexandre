import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { writeAudit } from "@/lib/audit";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";
import { safeCallbackUrl } from "@/lib/callback-url";

async function registerAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const lgpd = formData.get("lgpd") === "on";
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl")) || "";

  if (!name || !email || password.length < 6 || !lgpd) {
    redirect(`/conta/cadastro?error=1${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    redirect(`/conta/cadastro?error=exists${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      emailVerified: new Date(),
      consents: {
        create: [{ type: "terms_privacy", version: "2026-01", accepted: true }],
      },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "user.register",
    entityType: "User",
    entityId: user.id,
  });

  await sendEmail({
    to: email,
    subject: "Bem-vindo à Jornada SAP EWM",
    html: welcomeEmailHtml(name),
  });

  redirect(
    `/conta/entrar?registered=1${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`,
  );
}

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-white">Cadastro</h1>
      <p className="mt-2 text-[#A8A8AF]">Crie sua conta de aluno.</p>
      {sp.error === "exists" && <p className="mt-4 text-sm text-red-400">E-mail já cadastrado.</p>}
      {sp.error === "1" && <p className="mt-4 text-sm text-red-400">Preencha todos os campos e aceite os termos.</p>}
      <form action={registerAction} className="mt-8 space-y-4">
        {sp.callbackUrl && safeCallbackUrl(sp.callbackUrl) ? (
          <input type="hidden" name="callbackUrl" value={safeCallbackUrl(sp.callbackUrl) || ""} />
        ) : null}
        <input className="input" name="name" placeholder="Nome completo" required />
        <input className="input" name="email" type="email" placeholder="E-mail" required />
        <input className="input" name="phone" placeholder="Telefone" />
        <input className="input" name="password" type="password" placeholder="Senha (mín. 6)" required minLength={6} />
        <label className="flex items-start gap-2 text-sm text-[#A8A8AF]">
          <input type="checkbox" name="lgpd" className="mt-1" required />
          <span>
            Li e aceito os{" "}
            <Link href="/legal/termos" className="text-[#F1C96B]">
              Termos
            </Link>{" "}
            e a{" "}
            <Link href="/legal/privacidade" className="text-[#F1C96B]">
              Privacidade
            </Link>
            .
          </span>
        </label>
        <button className="btn w-full" type="submit">
          Criar conta
        </button>
      </form>
    </div>
  );
}
