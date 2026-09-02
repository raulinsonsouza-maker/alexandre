"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function BuyPlanModal(props: {
  open: boolean;
  onClose: () => void;
  planSlug?: string;
  moduleSlug?: string;
  itemName: string;
  whatsappUrl?: string | null;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!props.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [props.open]);

  if (!props.open || !mounted) return null;

  async function startCheckout() {
    const body = props.moduleSlug
      ? { moduleSlug: props.moduleSlug }
      : { planSlug: props.planSlug };
    const res = await fetch("/api/checkout/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) {
      throw new Error(
        data?.error === "corporate"
          ? "corporate"
          : data?.error || "Não foi possível iniciar o pagamento",
      );
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
        setError("Este e-mail já tem conta. Use Entrar no menu do site e volte a comprar.");
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

  // Portal no body: o botão mora dentro de seções com z-index (hero z-3 vs main z-5),
  // e um fixed dentro desse stacking context ficava atrás de "Conteúdo do módulo".
  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={props.onClose}
      />
      <div className="relative z-[1] max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/10 bg-[#141416] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#f7bd31]">Criar conta</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold uppercase">
              {props.itemName}
            </h2>
          </div>
          <button type="button" className="text-[#a8a8a8]" onClick={props.onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-[#a8a8a8]">
          Crie sua conta de aluno. Em seguida você vai ao pagamento (Pix, cartão ou boleto) com este mesmo e-mail.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <form onSubmit={onRegister} className="mt-4 space-y-3">
          <input className="input" name="name" placeholder="Nome completo" required />
          <input className="input" name="email" type="email" placeholder="E-mail" required />
          <input className="input" name="phone" placeholder="Telefone" />
          <input className="input" name="password" type="password" placeholder="Senha (mín. 6)" required minLength={6} />
          <label className="flex items-start gap-2 text-sm text-[#a8a8a8]">
            <input type="checkbox" name="lgpd" className="mt-1" required />
            <span>
              Li e aceito os{" "}
              <Link href="/legal/termos" className="text-[#f7bd31]" target="_blank">
                Termos
              </Link>{" "}
              e a{" "}
              <Link href="/legal/privacidade" className="text-[#f7bd31]" target="_blank">
                Privacidade
              </Link>
              .
            </span>
          </label>
          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? "Continuando…" : "Cadastrar e pagar"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
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
      <button type="button" className="button button-primary" onClick={onClick} disabled={loading}>
        {loading ? "Redirecionando…" : props.label}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <BuyPlanModal
        open={open}
        onClose={() => setOpen(false)}
        planSlug={props.planSlug}
        itemName={props.planName}
        whatsappUrl={props.whatsappUrl}
      />
    </>
  );
}

export function BuyModuleButton(props: {
  loggedIn: boolean;
  moduleSlug: string;
  moduleName: string;
  checkoutEnabled: boolean;
  label?: string;
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
        body: JSON.stringify({ moduleSlug: props.moduleSlug }),
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
    if (!props.checkoutEnabled) return;
    if (props.loggedIn) {
      void goPay();
      return;
    }
    setOpen(true);
  }

  if (!props.checkoutEnabled) {
    return (
      <Link href="/planos" className="button button-primary">
        Ver planos
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className="button button-primary"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? "Redirecionando…" : props.label || "Comprar módulo"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <BuyPlanModal
        open={open}
        onClose={() => setOpen(false)}
        moduleSlug={props.moduleSlug}
        itemName={props.moduleName}
      />
    </>
  );
}
