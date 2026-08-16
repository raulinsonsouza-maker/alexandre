import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckout } from "@/lib/payment";
import { userAlreadyHasModuleAccess, userAlreadyHasPlanAccess } from "@/lib/access";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function providerLabel() {
  const p = process.env.PAYMENT_PROVIDER || "demo";
  if (p === "cakto") return "Pagamento seguro na Cakto (Pix, cartão ou boleto). Use o mesmo e-mail desta conta.";
  if (p === "demo") return "Modo demonstração: o acesso é liberado automaticamente.";
  return `Gateway: ${p}`;
}

async function checkoutAction(formData: FormData) {
  "use server";
  const session = await auth();
  const planSlug = String(formData.get("planSlug") || "") || undefined;
  const moduleSlug = String(formData.get("moduleSlug") || "") || undefined;
  const couponCode = String(formData.get("couponCode") || "") || undefined;
  const back = `/checkout?${planSlug ? `plan=${planSlug}` : `module=${moduleSlug}`}`;
  if (!session?.user) redirect(`/conta/entrar?callbackUrl=${encodeURIComponent(back)}`);
  let redirectUrl = "/academia?purchased=1";
  try {
    const result = await createCheckout({
      userId: session.user.id,
      planSlug,
      moduleSlug,
      couponCode,
    });
    redirectUrl = result.redirectUrl;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro no checkout";
    redirect(`${back}&error=${encodeURIComponent(msg)}`);
  }
  redirect(redirectUrl);
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; module?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const provider = process.env.PAYMENT_PROVIDER || "demo";

  let title = "";
  let priceCents = 0;
  let planSlug: string | undefined;
  let moduleSlug: string | undefined;
  let blockedReason: string | null = null;
  let kind: "plan" | "module" | null = null;
  let caktoReady = true;

  if (sp.plan) {
    const plan = await prisma.plan.findUnique({
      where: { slug: sp.plan },
      include: { _count: { select: { modules: true } } },
    });
    if (!plan || !plan.published) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16">
          <h1 className="text-3xl font-semibold text-white">Checkout</h1>
          <p className="mt-4 text-[#A8A8AF]">Plano não encontrado.</p>
          <Link href="/planos" className="mt-4 inline-block text-[#F1C96B]">
            Ver planos
          </Link>
        </div>
      );
    }
    if (!plan.checkoutEnabled) {
      redirect(plan.ctaUrl || "/contato");
    }
    kind = "plan";
    planSlug = plan.slug;
    title = `Plano ${plan.name}`;
    priceCents = plan.priceCents;
    caktoReady = provider !== "cakto" || Boolean(plan.caktoOfferId);
    if (session?.user && (await userAlreadyHasPlanAccess(session.user.id, plan.id))) {
      blockedReason = "Você já possui este plano. Acesse o Campus.";
    }
  } else if (sp.module) {
    const mod = await prisma.module.findUnique({ where: { slug: sp.module } });
    if (!mod || !mod.published) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16">
          <h1 className="text-3xl font-semibold text-white">Checkout</h1>
          <p className="mt-4 text-[#A8A8AF]">Módulo não encontrado.</p>
          <Link href="/#modulos" className="mt-4 inline-block text-[#F1C96B]">
            Ver vitrine
          </Link>
        </div>
      );
    }
    kind = "module";
    moduleSlug = mod.slug;
    title = mod.title;
    priceCents = mod.priceCents;
    if (provider === "cakto") {
      blockedReason = "Compra de módulo avulso ainda não está disponível no checkout Cakto. Escolha um plano.";
    }
    if (session?.user && (await userAlreadyHasModuleAccess(session.user.id, mod.id))) {
      blockedReason = "Você já tem acesso a este módulo. Acesse o Campus.";
    }
  } else {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-3xl font-semibold text-white">Checkout</h1>
        <p className="mt-4 text-[#A8A8AF]">Escolha um plano ou um módulo na vitrine.</p>
        <div className="mt-6 flex gap-4">
          <Link href="/planos" className="btn">
            Ver planos
          </Link>
          <Link href="/#modulos" className="btn-ghost">
            Ver módulos
          </Link>
        </div>
      </div>
    );
  }

  const checkoutQs = planSlug ? `plan=${planSlug}` : `module=${moduleSlug}`;
  const payLabel = provider === "cakto" ? "Ir para pagamento" : "Pagar e liberar acesso";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-semibold text-white">Checkout</h1>
      {sp.error && <p className="mt-4 text-sm text-red-400">{sp.error}</p>}
      <div className="panel mt-6">
        <p className="text-xs uppercase tracking-wide text-[#A8A8AF]">
          {kind === "plan" ? "Pacote" : "Módulo avulso"}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#F1C96B]">{title}</h2>
        <p className="mt-2 text-2xl text-white">{formatBRL(priceCents)}</p>
        <p className="mt-2 text-sm text-[#A8A8AF]">{providerLabel()}</p>
        {session?.user?.email && provider === "cakto" && (
          <p className="mt-2 text-sm text-white">
            E-mail da compra: <span className="text-[#F1C96B]">{session.user.email}</span>
          </p>
        )}
      </div>

      {blockedReason ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-[#F1C96B]">{blockedReason}</p>
          <Link href="/academia" className="btn inline-flex">
            Ir à Academia
          </Link>
        </div>
      ) : !caktoReady ? (
        <p className="mt-6 text-sm text-red-400">Este plano ainda não está disponível para pagamento. Tente em instantes.</p>
      ) : !session?.user ? (
        <p className="mt-6 text-sm text-[#A8A8AF]">
          Faça{" "}
          <Link
            href={`/conta/entrar?callbackUrl=${encodeURIComponent(`/checkout?${checkoutQs}`)}`}
            className="text-[#F1C96B]"
          >
            login
          </Link>{" "}
          ou{" "}
          <Link
            href={`/conta/cadastro?callbackUrl=${encodeURIComponent(`/checkout?${checkoutQs}`)}`}
            className="text-[#F1C96B]"
          >
            cadastre-se
          </Link>{" "}
          para comprar.
        </p>
      ) : (
        <form action={checkoutAction} className="mt-6 space-y-4">
          {planSlug && <input type="hidden" name="planSlug" value={planSlug} />}
          {moduleSlug && <input type="hidden" name="moduleSlug" value={moduleSlug} />}
          {provider !== "cakto" && (
            <input className="input" name="couponCode" placeholder="Cupom (opcional)" />
          )}
          <button className="btn w-full" type="submit">
            {payLabel}
          </button>
        </form>
      )}
    </div>
  );
}
