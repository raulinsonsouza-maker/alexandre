"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Method = "pix" | "card";

type PixData = {
  qrCode: string;
  qrCodeBase64: string;
  expiresAt?: string | null;
};

type SdkCard = {
  holderName: string;
  cardNumber: string;
  cvv: string;
  expMonth: string;
  expYear: string;
};

type CaktoSdkInstance = {
  initAntifraud: () => Promise<void>;
  completeAntifraudProfile: () => Promise<void>;
  getAntifraudReference: () => string;
  cleanupAntifraud?: () => void;
  createToken: (card: SdkCard) => Promise<{ cardToken: string }>;
  authenticate3DS: (opts: {
    card: SdkCard;
    customer: {
      amount: number;
      currency: string;
      email: string;
      name: string;
      phone: string;
      paymentMethod: string;
    };
  }) => Promise<{
    success: boolean;
    error?: string;
    cavv?: string;
    eci?: string;
    xid?: string;
    referenceId?: string;
    version?: string;
  }>;
};

declare global {
  interface Window {
    Cakto?: {
      CaktoSDK: new (opts: { client_id: string }) => CaktoSdkInstance;
    };
  }
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function loadCaktoScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Cakto?.CaktoSDK) return Promise.resolve();
  const existing = document.querySelector('script[data-cakto-sdk="1"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar SDK Cakto")));
      if (window.Cakto?.CaktoSDK) resolve();
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cakto-sdk.pages.dev/cakto-sdk.min.js";
    script.async = true;
    script.dataset.caktoSdk = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar SDK Cakto"));
    document.head.appendChild(script);
  });
}

function fingerprintKey() {
  const key = "cakto_fp";
  try {
    let v = sessionStorage.getItem(key);
    if (!v) {
      v = `fp_${crypto.randomUUID()}`;
      sessionStorage.setItem(key, v);
    }
    return v;
  } catch {
    return `fp_${Date.now()}`;
  }
}

export function TransparentCheckout(props: {
  clientId: string;
  planSlug?: string;
  moduleSlug?: string;
  title: string;
  priceCents: number;
  summaryLines: string[];
  userName: string;
  userEmail: string;
  userPhone?: string | null;
}) {
  const router = useRouter();
  const sdkRef = useRef<CaktoSdkInstance | null>(null);
  const [method, setMethod] = useState<Method>("pix");
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState("");
  const [phone, setPhone] = useState(props.userPhone || "");
  const [pix, setPix] = useState<PixData | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pixStatus, setPixStatus] = useState("Aguardando pagamento…");
  const [copied, setCopied] = useState(false);

  const [holderName, setHolderName] = useState(props.userName);
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!props.clientId) {
          setError("Checkout não configurado (client id Cakto ausente).");
          return;
        }
        await loadCaktoScript();
        if (cancelled || !window.Cakto?.CaktoSDK) {
          throw new Error("SDK Cakto indisponível");
        }
        const sdk = new window.Cakto.CaktoSDK({ client_id: props.clientId });
        sdkRef.current = sdk;
        await sdk.initAntifraud();
        if (!cancelled) setSdkReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Não foi possível iniciar o pagamento");
        }
      }
    })();
    return () => {
      cancelled = true;
      try {
        sdkRef.current?.cleanupAntifraud?.();
      } catch {
        /* ignore */
      }
    };
  }, [props.clientId]);

  const pollPaid = useCallback(
    (id: string) => {
      let tries = 0;
      const max = 120; // ~6 min
      const timer = window.setInterval(async () => {
        tries += 1;
        try {
          const res = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(id)}`, {
            credentials: "include",
          });
          const data = await res.json().catch(() => null);
          if (data?.status === "PAID") {
            window.clearInterval(timer);
            setPixStatus("Pagamento confirmado! Liberando acesso…");
            router.push("/academia?purchased=1");
            return;
          }
        } catch {
          /* keep polling */
        }
        if (tries >= max) {
          window.clearInterval(timer);
          setPixStatus(
            "Ainda não confirmamos o Pix. Se já pagou, aguarde alguns minutos e abra a Academia.",
          );
        }
      }, 3000);
      return () => window.clearInterval(timer);
    },
    [router],
  );

  useEffect(() => {
    if (!orderId || !pix) return;
    return pollPaid(orderId);
  }, [orderId, pix, pollPaid]);

  async function ensureAntifraud() {
    const sdk = sdkRef.current;
    if (!sdk) throw new Error("SDK ainda carregando. Aguarde um instante.");
    await sdk.completeAntifraudProfile();
    const ref = sdk.getAntifraudReference();
    if (!ref) throw new Error("Antifraude sem referência. Recarregue a página.");
    return ref;
  }

  async function payPix() {
    setError("");
    setLoading(true);
    setPix(null);
    try {
      const antifraudRef = await ensureAntifraud();
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planSlug: props.planSlug,
          moduleSlug: props.moduleSlug,
          method: "pix",
          antifraudRef,
          customerDoc: doc,
          customerPhone: phone,
          fingerprint: fingerprintKey(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Não foi possível gerar o Pix");
      }
      setOrderId(data.orderId);
      setPix({
        qrCode: data.pix?.qrCode || "",
        qrCodeBase64: data.pix?.qrCodeBase64 || "",
        expiresAt: data.pix?.expiresAt,
      });
      setPixStatus("Aguardando pagamento…");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar Pix");
    } finally {
      setLoading(false);
    }
  }

  async function payCard(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sdk = sdkRef.current;
      if (!sdk) throw new Error("SDK ainda carregando.");

      const card: SdkCard = {
        holderName: holderName.trim(),
        cardNumber: digitsOnly(cardNumber),
        cvv: digitsOnly(cvv),
        expMonth: digitsOnly(expMonth).padStart(2, "0").slice(0, 2),
        expYear: digitsOnly(expYear).slice(-2),
      };
      if (card.cardNumber.length < 13) throw new Error("Número do cartão inválido");
      if (!card.expMonth || !card.expYear) throw new Error("Validade inválida");
      if (card.cvv.length < 3) throw new Error("CVV inválido");

      const { cardToken } = await sdk.createToken(card);
      const authResult = await sdk.authenticate3DS({
        card,
        customer: {
          amount: props.priceCents,
          currency: "BRL",
          email: props.userEmail,
          name: props.userName,
          phone: digitsOnly(phone),
          paymentMethod: "credit",
        },
      });
      if (!authResult.success) {
        throw new Error(authResult.error || "Falha na autenticação 3DS");
      }

      const antifraudRef = await ensureAntifraud();
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planSlug: props.planSlug,
          moduleSlug: props.moduleSlug,
          method: "card",
          cardToken,
          threeDSecure: {
            cavv: authResult.cavv,
            eci: authResult.eci,
            xid: authResult.xid,
            referenceId: authResult.referenceId,
            version: authResult.version,
          },
          antifraudRef,
          customerDoc: doc,
          customerPhone: phone,
          fingerprint: fingerprintKey(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Pagamento recusado");
      }
      if (data.redirectUrl || data.status === "paid") {
        router.push(data.redirectUrl || "/academia?purchased=1");
        return;
      }
      if (data.orderId) {
        setOrderId(data.orderId);
        setPixStatus("Pagamento em análise. Confirmando…");
        pollPaid(data.orderId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no cartão");
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!pix?.qrCode) return;
    try {
      await navigator.clipboard.writeText(pix.qrCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Selecione o código manualmente.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      <aside className="panel relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(241,201,107,0.12),transparent_55%)]"
        />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.16em] text-[#A8A8AF]">Resumo</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#f7bd31]">
            {props.title}
          </h2>
          <p className="mt-3 text-3xl font-semibold text-white">{formatBRL(props.priceCents)}</p>
          <ul className="mt-6 space-y-2 text-sm text-[#A8A8AF]">
            {props.summaryLines.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-[#f7bd31]">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[#A8A8AF]">
            Conta: <span className="text-white">{props.userEmail}</span>
          </p>
          {method === "pix" && (
            <p className="mt-4 rounded-lg border border-[#f7bd31]/30 bg-[#f7bd31]/10 px-3 py-2 text-sm text-[#f7bd31]">
              Não feche esta página até o Pix ser confirmado.
            </p>
          )}
        </div>
      </aside>

      <section className="panel">
        <div className="flex gap-2 border-b border-[#2a2d32] pb-3">
          {(["pix", "card"] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMethod(m);
                setError("");
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                method === m
                  ? "bg-[#f7bd31] text-[#0a0a0c]"
                  : "border border-[#2a2d32] text-[#A8A8AF] hover:text-white"
              }`}
            >
              {m === "pix" ? "Pix" : "Cartão"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-sm text-[#A8A8AF]">
            CPF ou CNPJ
            <input
              className="input mt-1"
              inputMode="numeric"
              autoComplete="off"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              placeholder="Somente números"
            />
          </label>
          <label className="block text-sm text-[#A8A8AF]">
            Telefone com DDD
            <input
              className="input mt-1"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11999999999"
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {!sdkReady && !error && (
          <p className="mt-4 text-sm text-[#A8A8AF]">Preparando pagamento seguro…</p>
        )}

        {method === "pix" ? (
          <div className="mt-6 space-y-4">
            {!pix ? (
              <button
                type="button"
                className="btn w-full disabled:opacity-60"
                disabled={loading || !sdkReady}
                onClick={payPix}
              >
                {loading ? "Gerando Pix…" : "Gerar Pix"}
              </button>
            ) : (
              <div className="space-y-4">
                {pix.qrCodeBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      pix.qrCodeBase64.startsWith("data:")
                        ? pix.qrCodeBase64
                        : `data:image/png;base64,${pix.qrCodeBase64}`
                    }
                    alt="QR Code Pix"
                    className="mx-auto h-52 w-52 rounded-lg bg-white p-2"
                  />
                ) : null}
                <p className="text-center text-sm text-[#f7bd31]">{pixStatus}</p>
                <label className="block text-xs text-[#A8A8AF]">
                  Copia e cola
                  <textarea
                    className="input mt-1 min-h-[88px] font-mono text-xs"
                    readOnly
                    value={pix.qrCode}
                  />
                </label>
                <button type="button" className="btn-ghost w-full" onClick={copyPix}>
                  {copied ? "Copiado!" : "Copiar código Pix"}
                </button>
                <button
                  type="button"
                  className="btn w-full disabled:opacity-60"
                  disabled={loading}
                  onClick={payPix}
                >
                  Gerar novo Pix
                </button>
              </div>
            )}
          </div>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={payCard}>
            <label className="block text-sm text-[#A8A8AF]">
              Nome no cartão
              <input
                className="input mt-1"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                autoComplete="cc-name"
                required
              />
            </label>
            <label className="block text-sm text-[#A8A8AF]">
              Número
              <input
                className="input mt-1"
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-sm text-[#A8A8AF]">
                Mês
                <input
                  className="input mt-1"
                  inputMode="numeric"
                  placeholder="MM"
                  autoComplete="cc-exp-month"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm text-[#A8A8AF]">
                Ano
                <input
                  className="input mt-1"
                  inputMode="numeric"
                  placeholder="AA"
                  autoComplete="cc-exp-year"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm text-[#A8A8AF]">
                CVV
                <input
                  className="input mt-1"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </label>
            </div>
            <button
              type="submit"
              className="btn mt-2 w-full disabled:opacity-60"
              disabled={loading || !sdkReady}
            >
              {loading ? "Processando…" : "Pagar com cartão"}
            </button>
            <p className="text-xs text-[#A8A8AF]">
              Dados do cartão ficam só no navegador (tokenização + 3DS Cakto).
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
