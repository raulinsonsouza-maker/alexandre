import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

function safeCallbackUrl(raw: string | null | undefined) {
  if (!raw) return "/academia";
  const url = raw.trim();
  if (!url.startsWith("/") || url.startsWith("//")) return "/academia";
  if (url.startsWith("/conta/entrar") || url.startsWith("/api/")) return "/academia";
  return url;
}

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") || ""));

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect(`/conta/entrar?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw err;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; registered?: string; reset?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = safeCallbackUrl(sp.callbackUrl);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-white">Entrar</h1>
      <p className="mt-2 text-[#A8A8AF]">Acesse a Academia.</p>
      {sp.error && <p className="mt-4 text-sm text-red-400">Credenciais inválidas.</p>}
      {sp.registered && <p className="mt-4 text-sm text-[#F1C96B]">Conta criada. Faça login.</p>}
      {sp.reset && <p className="mt-4 text-sm text-[#F1C96B]">Senha atualizada. Faça login.</p>}
      <form action={loginAction} className="mt-8 space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <label className="mb-1 block text-sm text-[#A8A8AF]">E-mail</label>
          <input className="input" name="email" type="email" required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#A8A8AF]">Senha</label>
          <input className="input" name="password" type="password" required />
        </div>
        <button className="btn w-full" type="submit">
          Entrar
        </button>
      </form>
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
