"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "register" | "login";

export function BuyPlanModal(props: {
  open: boolean;
  onClose: () => void;
  planSlug: string;
  planName: string;
  whatsappUrl?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("register");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!props.open) return null;

  async function startCheckout() {
    const res = await fetch("/api/checkout/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ planSlug: props.planSlug }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) {
      throw new Error(data?.error === "corporate" ? "corporate" : data?.error || "Não foi possível iniciar o pagamento");
    }
    window.location.assign(data.url);
  }

  async function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          password: String(fd.get("password") || ""),
          lgpd: fd.get("lgpd") === "on",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 409) {
        setError("E-mail já cadastrado. Entre com sua senha.");
        setTab("login");
        setLoading(false);
        return;
      }
      if (!res.ok || !data?.ok) {
        setError("Preencha os campos e aceite os termos.");
        setLoading(false);
        return;
      }
      await startCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
      setLoading(false);
    }
  }

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: String(fd.get("email") || ""),
          password: String(fd.get("password") || ""),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }
      await startCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/10 bg-[#141416] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#f6b40a]">Comprar</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold uppercase">{props.planName}</h2>
          </div>
          <button type="button" className="text-[#a8a8a8]" onClick={props.onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-[#a8a8a8]">
          Cadastre-se ou entre. Em seguida você vai ao pagamento Cakto com o mesmo e-mail.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded px-3 py-2 text-sm font-bold ${tab === "register" ? "bg-[#f6b40a] text-[#0a0a0c]" : "bg-white/5 text-[#a8a8a8]"}`}
            onClick={() => setTab("register")}
          >
            Criar conta
          </button>
          <button
            type="button"
            className={`rounded px-3 py-2 text-sm font-bold ${tab === "login" ? "bg-[#f6b40a] text-[#0a0a0c]" : "bg-white/5 text-[#a8a8a8]"}`}
            onClick={() => setTab("login")}
          >
            Já tenho conta
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {tab === "register" ? (
          <form onSubmit={onRegister} className="mt-4 space-y-3">
            <input className="input" name="name" placeholder="Nome completo" required />
            <input className="input" name="email" type="email" placeholder="E-mail" required />
            <input className="input" name="phone" placeholder="Telefone" />
            <input className="input" name="password" type="password" placeholder="Senha (mín. 6)" required minLength={6} />
            <label className="flex items-start gap-2 text-sm text-[#a8a8a8]">
              <input type="checkbox" name="lgpd" className="mt-1" required />
              <span>
                Li e aceito os{" "}
                <Link href="/legal/termos" className="text-[#f6b40a]" target="_blank">
                  Termos
                </Link>{" "}
                e a{" "}
                <Link href="/legal/privacidade" className="text-[#f6b40a]" target="_blank">
                  Privacidade
                </Link>
                .
              </span>
            </label>
            <button className="btn w-full" type="submit" disabled={loading}>
              {loading ? "Continuando…" : "Cadastrar e pagar"}
            </button>
          </form>
        ) : (
          <form onSubmit={onLogin} className="mt-4 space-y-3">
            <input className="input" name="email" type="email" placeholder="E-mail" required autoComplete="email" />
            <input className="input" name="password" type="password" placeholder="Senha" required autoComplete="current-password" />
            <button className="btn w-full" type="submit" disabled={loading}>
              {loading ? "Continuando…" : "Entrar e pagar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function BuyPlanButton(props: {
  loggedIn: boolean;
  planSlug: string;
  planName: string;
  checkoutEnabled: boolean;
  whatsappUrl: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function goPay() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ planSlug: props.planSlug }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        setError(typeof data?.error === "string" ? data.error : "Não foi possível iniciar o pagamento");
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Falha de conexão");
      setLoading(false);
    }
  }

  function onClick() {
    if (!props.checkoutEnabled) {
      window.open(props.whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (props.loggedIn) {
      void goPay();
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button type="button" className="btn w-full sm:w-auto" onClick={onClick} disabled={loading}>
        {loading ? "Redirecionando…" : props.label}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <BuyPlanModal
        open={open}
        onClose={() => setOpen(false)}
        planSlug={props.planSlug}
        planName={props.planName}
        whatsappUrl={props.whatsappUrl}
      />
    </>
  );
}
