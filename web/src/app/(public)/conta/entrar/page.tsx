import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeCallbackUrl } from "@/lib/callback-url";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; reset?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const next = safeCallbackUrl(sp.callbackUrl);

  if (session?.user) {
    if (session.user.mustResetPassword) redirect("/conta/trocar-senha");
    if (session.user.role === "ADMIN") redirect("/administracao");
    redirect(next || "/academia");
  }

  const cadastroHref = next
    ? `/conta/cadastro?callbackUrl=${encodeURIComponent(next)}`
    : "/conta/cadastro";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-white">Entrar</h1>
      <p className="mt-2 text-[#A8A8AF]">Uma conta. Admin vai para Administração; aluno para a Academia.</p>
      {sp.error && <p className="mt-4 text-sm text-red-400">Credenciais inválidas.</p>}
      {sp.registered && <p className="mt-4 text-sm text-[#f7bd31]">Conta criada. Faça login.</p>}
      {sp.reset && <p className="mt-4 text-sm text-[#f7bd31]">Senha atualizada. Faça login.</p>}
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-sm text-[#A8A8AF]">
        <Link href="/conta/recuperar-senha" className="text-[#f7bd31]">
          Esqueci a senha
        </Link>
        {" · "}
        <Link href={cadastroHref} className="text-[#f7bd31]">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
