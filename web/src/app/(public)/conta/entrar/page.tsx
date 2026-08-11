import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; reset?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    if (session.user.mustResetPassword) redirect("/conta/trocar-senha");
    if (session.user.role === "ADMIN") redirect("/administracao");
    redirect("/academia");
  }

  const sp = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-white">Entrar</h1>
      <p className="mt-2 text-[#A8A8AF]">Uma conta. Admin vai para Administração; aluno para a Academia.</p>
      {sp.error && <p className="mt-4 text-sm text-red-400">Credenciais inválidas.</p>}
      {sp.registered && <p className="mt-4 text-sm text-[#F1C96B]">Conta criada. Faça login.</p>}
      {sp.reset && <p className="mt-4 text-sm text-[#F1C96B]">Senha atualizada. Faça login.</p>}
      <LoginForm />
      <p className="mt-4 text-sm text-[#A8A8AF]">
        <Link href="/conta/recuperar-senha" className="text-[#F1C96B]">
          Esqueci a senha
        </Link>
        {" · "}
        <Link href="/conta/cadastro" className="text-[#F1C96B]">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
