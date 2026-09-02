"use client";

import { FormEvent, useState } from "react";

const WA_LINK =
  "https://wa.me/5511974389297?text=" +
  encodeURIComponent("Olá, tenho interesse em falar sobre SAP EWM e a Jornada SAP EWM Academy.");

const EMAIL = "info@bestoneit.com.br";

const INTERESTS = [
  "Treinamento SAP EWM",
  "Mentoria SAP EWM",
  "Consultoria SAP EWM",
  "Projeto de implantação",
  "Suporte AMS",
  "Integração SAP",
  "Outro assunto",
];

const TRUST = [
  {
    icon: "◆",
    title: "SAP EWM Specialist",
    text: "Atuação especializada em Extended Warehouse Management, processos logísticos e arquitetura de soluções.",
  },
  {
    icon: "✈",
    title: "Projetos Nacionais e Internacionais",
    text: "Experiência em ambientes complexos, operações críticas, rollouts, integrações e hypercare.",
  },
  {
    icon: "✦",
    title: "Treinamentos Corporativos",
    text: "Capacitação técnica para consultores, key users, gestores de armazém e equipes SAP.",
  },
  {
    icon: "⚙",
    title: "Consultoria e AMS",
    text: "Suporte técnico, diagnóstico de erros, melhoria contínua, estabilização e evolução de operações SAP EWM.",
  },
];

function WaIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44zM12.07 21.15h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.9 6.98c0 5.45-4.44 9.88-9.89 9.88zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = {
      nome: String(fd.get("nome") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      telefone: String(fd.get("telefone") || "").trim(),
      empresa: String(fd.get("empresa") || "").trim(),
      cargo: String(fd.get("cargo") || "").trim(),
      interesse: String(fd.get("interesse") || "").trim(),
      mensagem: String(fd.get("mensagem") || "").trim(),
    };

    const next: Record<string, string> = {};
    if (!v.nome) next.nome = "Informe seu nome completo.";
    if (!v.email || !v.email.includes("@")) next.email = "Informe um e-mail válido.";
    if (!v.telefone) next.telefone = "Informe um telefone ou WhatsApp.";
    if (!v.empresa) next.empresa = "Informe a empresa.";
    if (!v.cargo) next.cargo = "Informe o cargo.";
    if (!v.interesse) next.interesse = "Selecione um tipo de interesse.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const body = [
      `Nome: ${v.nome}`,
      `E-mail: ${v.email}`,
      `Telefone / WhatsApp: ${v.telefone}`,
      `Empresa: ${v.empresa}`,
      `Cargo: ${v.cargo}`,
      `Tipo de interesse: ${v.interesse}`,
      "",
      "Mensagem:",
      v.mensagem || "(sem mensagem)",
    ].join("\n");

    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `Novo contato Jornada SAP EWM Academy — ${v.interesse}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="bg-[#0a0a0c] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-[clamp(20px,4vw,56px)] pb-[clamp(48px,7vw,80px)] pt-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(246,180,10,.14),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(246,180,10,.06),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1140px]">
          <span className="mb-5 inline-flex items-center gap-2 rounded border border-[#f7bd31]/50 bg-[#f7bd31]/15 px-3 py-1 font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.1em] text-[#f7bd31]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f7bd31] shadow-[0_0_10px_#f7bd31]" />
            Best One IT Treinamentos
          </span>
          <h1 className="mb-5 font-[family-name:var(--font-display)] text-[clamp(40px,6vw,88px)] font-bold uppercase leading-[0.94]">
            Fale com a <span className="text-[#f7bd31]">Best One IT</span>
          </h1>
          <p className="mb-3.5 max-w-[760px] text-[clamp(16px,1.6vw,21px)] leading-relaxed text-[#dcdcdc]">
            Entre em contato para treinamentos SAP EWM, mentorias técnicas, consultoria especializada, projetos de
            implantação, suporte AMS e arquitetura de soluções logísticas.
          </p>
          <p className="mb-8 max-w-[680px] text-[15px] font-medium leading-relaxed text-[#9a9a9a]">
            Especialistas em SAP EWM, logística, armazéns, transporte, manufatura e supply chain.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <a href="#form" className="rounded bg-[#f7bd31] px-8 py-3.5 text-base font-bold text-[#0a0a0c]">
              Enviar Mensagem
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded border border-[#25d366]/50 bg-[#25d366]/14 px-6 py-3.5 text-base font-semibold text-white"
            >
              <WaIcon /> Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FORM + ASIDE */}
      <section id="form" className="px-[clamp(20px,4vw,56px)] pb-[clamp(48px,7vw,88px)]">
        <div className="mx-auto grid max-w-[1140px] items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141417] to-[#0f0f12] p-[clamp(24px,3.4vw,40px)] shadow-[0_24px_70px_rgba(0,0,0,.45)]">
            {sent ? (
              <div className="px-3 py-12 text-center">
                <div className="mx-auto mb-5 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[#f7bd31]/50 bg-[#f7bd31]/15 text-4xl text-[#f7bd31]">
                  ✓
                </div>
                <h2 className="mb-3 font-[family-name:var(--font-display)] text-[clamp(24px,3vw,34px)] font-bold uppercase">
                  Obrigado pelo contato
                </h2>
                <p className="mx-auto mb-6 max-w-md text-[16.5px] leading-relaxed text-[#cfcfcf]">
                  Sua mensagem foi preparada para envio a <span className="text-[#f7bd31]">{EMAIL}</span>. Confirme o
                  envio no seu aplicativo de e-mail — em breve retornaremos com uma análise inicial.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="rounded-md border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Enviar nova mensagem
                </button>
              </div>
            ) : (
              <>
                <h2 className="mb-1.5 font-[family-name:var(--font-display)] text-[clamp(22px,2.8vw,32px)] font-bold uppercase">
                  Formulário de <span className="text-[#f7bd31]">contato</span>
                </h2>
                <p className="mb-6 text-[14.5px] text-[#9a9a9a]">
                  Preencha os campos abaixo. Os marcados com <span className="text-[#f7bd31]">*</span> são obrigatórios.
                </p>
                <form onSubmit={onSubmit} noValidate className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className="text-[13px] font-semibold text-[#c8c8c8]">
                        Nome completo <span className="text-[#f7bd31]">*</span>
                      </span>
                      <input className="input" name="nome" placeholder="Seu nome completo" />
                      {errors.nome && <span className="text-[12.5px] text-[#ff6b5e]">{errors.nome}</span>}
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold text-[#c8c8c8]">
                        E-mail profissional <span className="text-[#f7bd31]">*</span>
                      </span>
                      <input className="input" name="email" type="email" placeholder="nome@empresa.com" />
                      {errors.email && <span className="text-[12.5px] text-[#ff6b5e]">{errors.email}</span>}
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold text-[#c8c8c8]">
                        Telefone / WhatsApp <span className="text-[#f7bd31]">*</span>
                      </span>
                      <input className="input" name="telefone" type="tel" placeholder="(11) 9 9999-9999" />
                      {errors.telefone && <span className="text-[12.5px] text-[#ff6b5e]">{errors.telefone}</span>}
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold text-[#c8c8c8]">
                        Empresa <span className="text-[#f7bd31]">*</span>
                      </span>
                      <input className="input" name="empresa" placeholder="Nome da empresa" />
                      {errors.empresa && <span className="text-[12.5px] text-[#ff6b5e]">{errors.empresa}</span>}
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold text-[#c8c8c8]">
                        Cargo <span className="text-[#f7bd31]">*</span>
                      </span>
                      <input className="input" name="cargo" placeholder="Seu cargo / função" />
                      {errors.cargo && <span className="text-[12.5px] text-[#ff6b5e]">{errors.cargo}</span>}
                    </label>
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className="text-[13px] font-semibold text-[#c8c8c8]">
                        Tipo de interesse <span className="text-[#f7bd31]">*</span>
                      </span>
                      <select className="input" name="interesse" defaultValue="">
                        <option value="">Selecione uma opção…</option>
                        {INTERESTS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      {errors.interesse && <span className="text-[12.5px] text-[#ff6b5e]">{errors.interesse}</span>}
                    </label>
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className="text-[13px] font-semibold text-[#c8c8c8]">Mensagem</span>
                      <textarea
                        className="input min-h-24"
                        name="mensagem"
                        rows={4}
                        placeholder="Conte brevemente sobre sua necessidade, projeto ou objetivo…"
                      />
                    </label>
                  </div>
                  <button type="submit" className="mt-2 w-full rounded-lg bg-[#f7bd31] py-4 text-[16.5px] font-bold uppercase tracking-wide text-[#0a0a0c]">
                    Enviar Solicitação
                  </button>
                  <p className="text-[12.5px] leading-relaxed text-[#7e7e84]">
                    Ao enviar, sua mensagem é encaminhada para{" "}
                    <a href={`mailto:${EMAIL}`} className="text-[#9a9a9a]">
                      {EMAIL}
                    </a>
                    . Você autoriza o contato da Best One IT para retorno comercial, técnico ou informativo relacionado
                    à sua solicitação. Seus dados serão tratados conforme boas práticas de privacidade e proteção de
                    dados.
                  </p>
                </form>
              </>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[#25d366]/35 bg-gradient-to-b from-[#25d366]/12 to-[#141417]/60 p-[clamp(24px,3vw,32px)]">
              <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-[13px] bg-[#25d366]/18 text-[#25d366]">
                <WaIcon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight">
                Prefere falar direto pelo WhatsApp?
              </h3>
              <p className="mb-5 text-[15px] leading-relaxed text-[#c2c2c2]">
                Clique no botão abaixo e envie sua mensagem para atendimento comercial ou técnico.
              </p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-[9px] bg-[#25d366] py-3.5 text-base font-bold text-[#072b15]"
              >
                <WaIcon /> Conversar pelo WhatsApp
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141417] to-[#0f0f12] p-[clamp(24px,3vw,32px)]">
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold">Atendimento</h3>
              <div className="space-y-4">
                {[
                  ["Consultoria & Treinamentos", "SAP EWM · Logística · Supply Chain"],
                  ["Marca", "Jornada SAP EWM Academy"],
                  ["E-mail", EMAIL],
                  ["Resposta", "Análise inicial em até 1 dia útil"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="mt-0.5 text-[17px] text-[#f7bd31]">▹</span>
                    <div>
                      <div className="mb-0.5 text-xs uppercase tracking-wide text-[#8a8a8a]">{label}</div>
                      {label === "E-mail" ? (
                        <a href={`mailto:${EMAIL}`} className="text-[15px] font-semibold text-[#f7bd31]">
                          {value}
                        </a>
                      ) : (
                        <div className="text-[15px] font-semibold text-[#e6e6e6]">{value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CONFIANÇA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#0e0e11] to-[#0a0a0c] px-[clamp(20px,4vw,56px)] py-[clamp(48px,7vw,96px)]">
        <div className="mx-auto max-w-[1140px]">
          <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f7bd31]">
            Por que falar com a gente
          </span>
          <h2 className="mb-8 mt-3 font-[family-name:var(--font-display)] text-[clamp(28px,3.7vw,50px)] font-bold uppercase leading-none">
            Autoridade técnica em <span className="text-[#f7bd31]">SAP EWM</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div
                key={t.title}
                className="rounded-[14px] border border-white/10 bg-gradient-to-b from-[#161618] to-[#111113] p-6 transition hover:-translate-y-1 hover:border-[#f7bd31]/45"
              >
                <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-[11px] bg-[#f7bd31]/14 text-[22px] text-[#f7bd31]">
                  {t.icon}
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-white">
                  {t.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[#a8a8a8]">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp flutuante */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        className="fixed bottom-[clamp(16px,3vw,32px)] right-[clamp(16px,3vw,32px)] z-[200] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_rgba(37,211,102,.45)] transition hover:scale-105"
      >
        <WaIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
