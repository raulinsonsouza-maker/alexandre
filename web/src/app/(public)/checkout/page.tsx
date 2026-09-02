import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckout } from "@/lib/payment";
import { userAlreadyHasModuleAccess, userAlreadyHasPlanAccess } from "@/lib/access";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TransparentCheckout } from "@/components/checkout/TransparentCheckout";
import { MercadoPagoCheckout } from "@/components/checkout/MercadoPagoCheckout";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function providerLabel() {
  const p = process.env.PAYMENT_PROVIDER || "demo";
  if (p === "mercadopago") return "Pagamento seguro na página (Pix, cartão ou boleto).";
  if (p === "cakto") return "Pagamento seguro na página (Pix ou cartão com 3DS).";
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
  const caktoClientId =
    process.env.NEXT_PUBLIC_CAKTO_CLIENT_ID || process.env.CAKTO_CLIENT_ID || "";
  const mpPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "";

  let title = "";
  let priceCents = 0;
  let planSlug: string | undefined;
  let moduleSlug: string | undefined;
  let blockedReason: string | null = null;
  let kind: "plan" | "module" | null = null;
  let gatewayReady = true;
  let summaryLines: string[] = [];

  if (sp.plan) {
    const plan = await prisma.plan.findUnique({
      where: { slug: sp.plan },
      include: {
        modules: {
          include: { module: { select: { title: true, code: true, sortOrder: true } } },
        },
      },
    });
    if (!plan || !plan.published) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16">
          <h1 className="text-3xl font-semibold text-white">Checkout</h1>
          <p className="mt-4 text-[#A8A8AF]">Plano não encontrado.</p>
          <Link href="/planos" className="mt-4 inline-block text-[#f7bd31]">
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
    gatewayReady =
      provider === "mercadopago"
        ? plan.priceCents > 0
        : provider !== "cakto" || Boolean(plan.caktoOfferId);
    const moduleTitles = [...plan.modules]
      .sort((a, b) => a.module.sortOrder - b.module.sortOrder)
      .map((pm) => pm.module.title);
    summaryLines = moduleTitles.slice(0, 8);
    if (moduleTitles.length > 8) {
      summaryLines.push(`+ ${moduleTitles.length - 8} módulos`);
    }
    if (summaryLines.length === 0) {
      summaryLines = ["Acesso aos módulos do plano na Academia"];
    }
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
          <Link href="/modulos" className="mt-4 inline-block text-[#f7bd31]">
            Ver vitrine
          </Link>
        </div>
      );
    }
    kind = "module";
    moduleSlug = mod.slug;
    title = mod.title;
    priceCents = mod.priceCents;
    gatewayReady =
      provider === "mercadopago"
        ? mod.priceCents > 0
        : provider !== "cakto" || Boolean(mod.caktoOfferId);
    summaryLines = ["Módulo avulso", "Acesso imediato na Academia após confirmação"];
    if (mod.priceCents <= 0) {
      blockedReason = "Este módulo é bônus e não possui checkout avulso. Escolha um plano.";
    } else if (provider === "cakto" && !mod.caktoOfferId) {
      blockedReason = "Compra avulsa deste módulo ainda não está disponível. Escolha um plano.";
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
          <Link href="/modulos" className="btn-ghost">
            Ver módulos
          </Link>
        </div>
      </div>
    );
  }

  const checkoutQs = planSlug ? `plan=${planSlug}` : `module=${moduleSlug}`;
  const showTransparent =
    (provider === "cakto" || provider === "mercadopago") &&
    Boolean(session?.user) &&
    !blockedReason &&
    gatewayReady;

  if (showTransparent) {
    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { name: true, email: true, phone: true },
    });
    if (!user) redirect(`/conta/entrar?callbackUrl=${encodeURIComponent(`/checkout?${checkoutQs}`)}`);

    return (
      <div className="relative mx-auto max-w-5xl overflow-hidden px-4 py-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(241,201,107,0.08),transparent_50%)]"
        />
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white md:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-[#A8A8AF]">{providerLabel()}</p>
        {sp.error && <p className="mt-4 text-sm text-red-400">{sp.error}</p>}
        <div className="mt-8">
          {provider === "mercadopago" ? (
            <MercadoPagoCheckout
              publicKey={mpPublicKey}
              planSlug={planSlug}
              moduleSlug={moduleSlug}
              title={title}
              priceCents={priceCents}
              summaryLines={summaryLines}
              userName={user.name}
              userEmail={user.email}
              userPhone={user.phone}
            />
          ) : (
            <TransparentCheckout
              clientId={caktoClientId}
              planSlug={planSlug}
              moduleSlug={moduleSlug}
              title={title}
              priceCents={priceCents}
              summaryLines={summaryLines}
              userName={user.name}
              userEmail={user.email}
              userPhone={user.phone}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-semibold text-white">Checkout</h1>
      {sp.error && <p className="mt-4 text-sm text-red-400">{sp.error}</p>}
      <div className="panel mt-6">
        <p className="text-xs uppercase tracking-wide text-[#A8A8AF]">
          {kind === "plan" ? "Pacote" : "Módulo avulso"}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#f7bd31]">{title}</h2>
        <p className="mt-2 text-2xl text-white">{formatBRL(priceCents)}</p>
        <p className="mt-2 text-sm text-[#A8A8AF]">{providerLabel()}</p>
      </div>

      {blockedReason ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-[#f7bd31]">{blockedReason}</p>
          <Link href="/academia" className="btn inline-flex">
            Ir à Academia
          </Link>
        </div>
      ) : !gatewayReady ? (
        <p className="mt-6 text-sm text-red-400">
          Este item ainda não está disponível para pagamento. Tente em instantes ou escolha um plano.
        </p>
      ) : !session?.user ? (
        <p className="mt-6 text-sm text-[#A8A8AF]">
          Faça{" "}
          <Link
            href={`/conta/entrar?callbackUrl=${encodeURIComponent(`/checkout?${checkoutQs}`)}`}
            className="text-[#f7bd31]"
          >
            login
          </Link>{" "}
          ou{" "}
          <Link
            href={`/conta/cadastro?callbackUrl=${encodeURIComponent(`/checkout?${checkoutQs}`)}`}
            className="text-[#f7bd31]"
          >
            cadastre-se
          </Link>{" "}
          para comprar.
        </p>
      ) : (
        <form action={checkoutAction} className="mt-6 space-y-4">
          {planSlug && <input type="hidden" name="planSlug" value={planSlug} />}
          {moduleSlug && <input type="hidden" name="moduleSlug" value={moduleSlug} />}
          <input className="input" name="couponCode" placeholder="Cupom (opcional)" />
          <button className="btn w-full" type="submit">
            Pagar e liberar acesso
          </button>
        </form>
      )}
    </div>
  );
}
