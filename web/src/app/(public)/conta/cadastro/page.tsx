import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/audit";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";
import { safeCallbackUrl } from "@/lib/callback-url";
import { RegisterForm } from "@/components/auth/RegisterForm";

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
      <RegisterForm action={registerAction} callbackUrl={safeCallbackUrl(sp.callbackUrl) || undefined} />
    </div>
  );
}
