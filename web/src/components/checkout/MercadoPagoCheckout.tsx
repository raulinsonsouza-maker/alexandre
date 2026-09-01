"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Method = "pix" | "card" | "boleto";

type PixData = {
  qrCode: string;
  qrCodeBase64: string;
};

type BoletoData = {
  ticketUrl: string;
  digitableLine: string;
};

type InstallmentOption = {
  installments: number;
  recommended_message: string;
};

type IssuerOption = {
  id: string;
  name: string;
};

type MpField = {
  mount: (el: string) => MpField;
  unmount: () => void;
  on: (event: string, cb: (data?: { bin?: string }) => void) => void;
};

type MercadoPagoInstance = {
  fields: {
    create: (name: string, opts?: { placeholder?: string; style?: Record<string, string> }) => MpField;
    createCardToken: (opts: {
      cardholderName: string;
      identificationType: string;
      identificationNumber: string;
    }) => Promise<{ id: string }>;
  };
  getPaymentMethods: (opts: { bin: string }) => Promise<{
    results?: Array<{ id: string; payment_type_id: string; name?: string }>;
  }>;
  getIssuers: (opts: {
    paymentMethodId: string;
    bin: string;
  }) => Promise<Array<{ id: string; name: string }> | { results?: Array<{ id: string; name: string }> }>;
  getInstallments: (opts: {
    amount: string;
    bin: string;
    paymentTypeId?: string;
  }) => Promise<Array<{ payer_costs?: InstallmentOption[] }>>;
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, opts?: { locale?: string }) => MercadoPagoInstance;
  }
}

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const FIELD_STYLE = {
  height: "42px",
  padding: "10px 12px",
  fontSize: "16px",
  color: "#ffffff",
  placeholderColor: "#A8A8AF",
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function loadMpScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  const existing = document.querySelector('script[data-mp-sdk="1"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar Mercado Pago")));
      if (window.MercadoPago) resolve();
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.dataset.mpSdk = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Mercado Pago"));
    document.head.appendChild(script);
  });
}

export function MercadoPagoCheckout(props: {
  publicKey: string;
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
  const mpRef = useRef<MercadoPagoInstance | null>(null);
  const fieldsRef = useRef<MpField[]>([]);
  const [method, setMethod] = useState<Method>("pix");
  const [sdkReady, setSdkReady] = useState(false);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doc, setDoc] = useState("");
  const [phone, setPhone] = useState(props.userPhone || "");
  const [pix, setPix] = useState<PixData | null>(null);
  const [boleto, setBoleto] = useState<BoletoData | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [waitStatus, setWaitStatus] = useState("Aguardando pagamento…");
  const [copied, setCopied] = useState(false);

  const [holderName, setHolderName] = useState(props.userName);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentTypeId, setPaymentTypeId] = useState("credit_card");
  const [issuerId, setIssuerId] = useState("");
  const [issuers, setIssuers] = useState<IssuerOption[]>([]);
  const [installments, setInstallments] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<InstallmentOption[]>([]);

  const [zipCode, setZipCode] = useState("");
  const [streetName, setStreetName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  const amount = (props.priceCents / 100).toFixed(2);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!props.publicKey) {
          setError("Checkout não configurado (chave pública do Mercado Pago ausente).");
          return;
        }
        await loadMpScript();
        if (cancelled || !window.MercadoPago) {
          throw new Error("SDK Mercado Pago indisponível");
        }
        mpRef.current = new window.MercadoPago(props.publicKey, { locale: "pt-BR" });
        if (!cancelled) setSdkReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Não foi possível iniciar o pagamento");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.publicKey]);

  useEffect(() => {
    if (method !== "card" || !sdkReady || !mpRef.current) {
      setFieldsReady(false);
      return;
    }
    const mp = mpRef.current;
    const created: MpField[] = [];
    try {
      const number = mp.fields.create("cardNumber", {
        placeholder: "Número do cartão",
        style: FIELD_STYLE,
      }).mount("mp-card-number");
      const expiration = mp.fields.create("expirationDate", {
        placeholder: "MM/AA",
        style: FIELD_STYLE,
      }).mount("mp-card-expiration");
      const security = mp.fields.create("securityCode", {
        placeholder: "CVV",
        style: FIELD_STYLE,
      }).mount("mp-card-cvv");
      created.push(number, expiration, security);
      fieldsRef.current = created;

      number.on("binChange", async (data) => {
        const bin = String(data?.bin || "");
        if (bin.length < 6) {
          setPaymentMethodId("");
          setIssuers([]);
          setInstallmentOptions([]);
          return;
        }
        try {
          const methods = await mp.getPaymentMethods({ bin });
          const first = methods.results?.[0];
          if (!first) return;
          setPaymentMethodId(first.id);
          setPaymentTypeId(first.payment_type_id || "credit_card");
          const issuerRaw = await mp.getIssuers({ paymentMethodId: first.id, bin });
          const issuerList = Array.isArray(issuerRaw) ? issuerRaw : issuerRaw?.results || [];
          setIssuers(issuerList || []);
          if (issuerList?.[0]?.id) setIssuerId(String(issuerList[0].id));
          const inst = await mp.getInstallments({
            amount,
            bin,
            paymentTypeId: first.payment_type_id,
          });
          const options = inst?.[0]?.payer_costs || [];
          setInstallmentOptions(options);
          if (options[0]?.installments) setInstallments(options[0].installments);
        } catch (err) {
          console.error(err);
        }
      });
      setFieldsReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar o formulário do cartão");
    }

    return () => {
      for (const field of created) {
        try {
          field.unmount();
        } catch {
          /* ignore */
        }
      }
      fieldsRef.current = [];
      setFieldsReady(false);
    };
  }, [method, sdkReady, amount]);

  const pollPaid = useCallback(
    (id: string) => {
      let tries = 0;
      const max = 180;
      const timer = window.setInterval(async () => {
        tries += 1;
        try {
          const res = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(id)}`, {
            credentials: "include",
          });
          const data = await res.json().catch(() => null);
          if (data?.status === "PAID") {
            window.clearInterval(timer);
            setWaitStatus("Pagamento confirmado! Liberando acesso…");
            router.push("/academia?purchased=1");
            return;
          }
          if (data?.status === "FAILED") {
            window.clearInterval(timer);
            setWaitStatus("Pagamento não confirmado. Tente novamente.");
          }
        } catch {
          /* keep polling */
        }
        if (tries >= max) {
          window.clearInterval(timer);
          setWaitStatus(
            "Ainda não confirmamos o pagamento. Se já pagou, aguarde alguns minutos e abra a Academia.",
          );
        }
      }, 3000);
      return () => window.clearInterval(timer);
    },
    [router],
  );

  useEffect(() => {
    if (!orderId || (!pix && !boleto)) return;
    return pollPaid(orderId);
  }, [orderId, pix, boleto, pollPaid]);

  async function lookupCep() {
    const cep = digitsOnly(zipCode);
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json().catch(() => null);
      if (!data || data.erro) return;
      setStreetName(String(data.logradouro || streetName));
      setNeighborhood(String(data.bairro || neighborhood));
      setCity(String(data.localidade || city));
      setStateUf(String(data.uf || stateUf));
    } catch {
      /* ignore */
    }
  }

  async function pay(extra: Record<string, unknown>) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planSlug: props.planSlug,
          moduleSlug: props.moduleSlug,
          customerDoc: doc,
          customerPhone: phone,
          ...extra,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Não foi possível processar o pagamento");
      }
      if (data.redirectUrl || data.status === "paid") {
        router.push(data.redirectUrl || "/academia?purchased=1");
        return data;
      }
      setOrderId(data.orderId);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function payPix() {
    setPix(null);
    setBoleto(null);
    try {
      const data = await pay({ method: "pix" });
      if (!data) return;
      setPix({
        qrCode: data.pix?.qrCode || "",
        qrCodeBase64: data.pix?.qrCodeBase64 || "",
      });
      setWaitStatus("Aguardando pagamento…");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar Pix");
      setLoading(false);
    }
  }

  async function payBoleto(e: React.FormEvent) {
    e.preventDefault();
    setPix(null);
    setBoleto(null);
    try {
      const data = await pay({
        method: "boleto",
        address: {
          zipCode,
          streetName,
          streetNumber,
          neighborhood,
          city,
          state: stateUf,
        },
      });
      if (!data) return;
      setBoleto({
        ticketUrl: data.boleto?.ticketUrl || "",
        digitableLine: data.boleto?.digitableLine || "",
      });
      setWaitStatus("Boleto gerado. O acesso libera após a compensação.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar boleto");
      setLoading(false);
    }
  }

  async function payCard(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const mp = mpRef.current;
      if (!mp) throw new Error("SDK ainda carregando.");
      if (!paymentMethodId) throw new Error("Informe o número do cartão para identificar a bandeira.");
      const token = await mp.fields.createCardToken({
        cardholderName: holderName.trim(),
        identificationType: digitsOnly(doc).length === 14 ? "CNPJ" : "CPF",
        identificationNumber: digitsOnly(doc),
      });
      const cardToken = token.id || (token as { token?: string }).token;
      if (!cardToken) throw new Error("Não foi possível tokenizar o cartão.");
      const data = await pay({
        method: "card",
        cardToken,
        paymentMethodId,
        paymentTypeId,
        issuerId,
        installments,
      });
      if (!data) return;
      if (data.orderId && !data.redirectUrl) {
        setWaitStatus("Pagamento em análise. Confirmando…");
        pollPaid(data.orderId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no cartão");
      setLoading(false);
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
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
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#F1C96B]">
            {props.title}
          </h2>
          <p className="mt-3 text-3xl font-semibold text-white">{formatBRL(props.priceCents)}</p>
          <ul className="mt-6 space-y-2 text-sm text-[#A8A8AF]">
            {props.summaryLines.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-[#F1C96B]">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[#A8A8AF]">
            Conta: <span className="text-white">{props.userEmail}</span>
          </p>
          {method === "pix" && (
            <p className="mt-4 rounded-lg border border-[#F1C96B]/30 bg-[#F1C96B]/10 px-3 py-2 text-sm text-[#F1C96B]">
              Não feche esta página até o Pix ser confirmado.
            </p>
          )}
          {method === "boleto" && (
            <p className="mt-4 rounded-lg border border-[#F1C96B]/30 bg-[#F1C96B]/10 px-3 py-2 text-sm text-[#F1C96B]">
              O acesso à Academia libera após a compensação do boleto.
            </p>
          )}
        </div>
      </aside>

      <section className="panel">
        <div className="flex flex-wrap gap-2 border-b border-[#2a2d32] pb-3">
          {(["pix", "card", "boleto"] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMethod(m);
                setError("");
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                method === m
                  ? "bg-[#F1C96B] text-[#0a0a0c]"
                  : "border border-[#2a2d32] text-[#A8A8AF] hover:text-white"
              }`}
            >
              {m === "pix" ? "Pix" : m === "card" ? "Cartão" : "Boleto"}
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
                <p className="text-center text-sm text-[#F1C96B]">{waitStatus}</p>
                <label className="block text-xs text-[#A8A8AF]">
                  Copia e cola
                  <textarea
                    className="input mt-1 min-h-[88px] font-mono text-xs"
                    readOnly
                    value={pix.qrCode}
                  />
                </label>
                <button type="button" className="btn-ghost w-full" onClick={() => copyText(pix.qrCode)}>
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
        ) : method === "card" ? (
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
            <div>
              <p className="text-sm text-[#A8A8AF]">Número</p>
              <div id="mp-card-number" className="mp-field mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-[#A8A8AF]">Validade</p>
                <div id="mp-card-expiration" className="mp-field mt-1" />
              </div>
              <div>
                <p className="text-sm text-[#A8A8AF]">CVV</p>
                <div id="mp-card-cvv" className="mp-field mt-1" />
              </div>
            </div>
            {issuers.length > 1 && (
              <label className="block text-sm text-[#A8A8AF]">
                Banco emissor
                <select
                  className="input mt-1"
                  value={issuerId}
                  onChange={(e) => setIssuerId(e.target.value)}
                >
                  {issuers.map((issuer) => (
                    <option key={issuer.id} value={issuer.id}>
                      {issuer.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-sm text-[#A8A8AF]">
              Parcelas
              <select
                className="input mt-1"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
              >
                {installmentOptions.length === 0 ? (
                  <option value={1}>1x de {formatBRL(props.priceCents)}</option>
                ) : (
                  installmentOptions.map((opt) => (
                    <option key={opt.installments} value={opt.installments}>
                      {opt.recommended_message}
                    </option>
                  ))
                )}
              </select>
            </label>
            <button
              type="submit"
              className="btn mt-2 w-full disabled:opacity-60"
              disabled={loading || !sdkReady || !fieldsReady}
            >
              {loading ? "Processando…" : "Pagar com cartão"}
            </button>
            <p className="text-xs text-[#A8A8AF]">
              Dados do cartão ficam só no navegador (tokenização Mercado Pago).
            </p>
          </form>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={payBoleto}>
            {!boleto ? (
              <>
                <label className="block text-sm text-[#A8A8AF]">
                  CEP
                  <input
                    className="input mt-1"
                    inputMode="numeric"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    onBlur={lookupCep}
                    placeholder="00000000"
                    required
                  />
                </label>
                <label className="block text-sm text-[#A8A8AF]">
                  Rua
                  <input
                    className="input mt-1"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    required
                  />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="col-span-1 block text-sm text-[#A8A8AF]">
                    Número
                    <input
                      className="input mt-1"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      required
                    />
                  </label>
                  <label className="col-span-2 block text-sm text-[#A8A8AF]">
                    Bairro
                    <input
                      className="input mt-1"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <label className="col-span-2 block text-sm text-[#A8A8AF]">
                    Cidade
                    <input
                      className="input mt-1"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block text-sm text-[#A8A8AF]">
                    UF
                    <select
                      className="input mt-1"
                      value={stateUf}
                      onChange={(e) => setStateUf(e.target.value)}
                      required
                    >
                      <option value="">UF</option>
                      {UF_OPTIONS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn mt-2 w-full disabled:opacity-60"
                  disabled={loading || !sdkReady}
                >
                  {loading ? "Gerando boleto…" : "Gerar boleto"}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-[#F1C96B]">{waitStatus}</p>
                {boleto.digitableLine && (
                  <label className="block text-xs text-[#A8A8AF]">
                    Linha digitável
                    <textarea
                      className="input mt-1 min-h-[72px] font-mono text-xs"
                      readOnly
                      value={boleto.digitableLine}
                    />
                  </label>
                )}
                <div className="flex flex-col gap-2">
                  {boleto.digitableLine && (
                    <button
                      type="button"
                      className="btn-ghost w-full"
                      onClick={() => copyText(boleto.digitableLine)}
                    >
                      {copied ? "Copiado!" : "Copiar linha digitável"}
                    </button>
                  )}
                  {boleto.ticketUrl && (
                    <a
                      className="btn w-full"
                      href={boleto.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir boleto
                    </a>
                  )}
                </div>
              </div>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
