import Link from "next/link";

const SETORES = [
  "Farmacêutico",
  "Automotivo",
  "Bebidas",
  "Agroindústria",
  "Químico",
  "Alimentos",
  "Manufatura",
  "Óleo & lubrificantes",
  "Operações de alta complexidade",
];

const DOMINIOS = [
  ["Arquitetura SAP EWM & SCM", "EWM embedded e decentralized, SAP SCM e desenho de solução enterprise."],
  ["Processos de armazém", "Inbound, outbound e internos, Warehouse Task & Order, putaway e stock removal."],
  ["Integrações SAP", "MM, SD/LE, PP, QM, PM, TM, IDoc, qRFC, CPI/PI e integrações cross-module."],
  ["Produção, qualidade & manutenção", "Production & Plant Maintenance Supply, QIE, JIT e cenários de manufatura."],
  ["Automação, RF & MFS", "RF Framework, MFS, RFID, Handling Unit e identificação de estoque."],
  ["Troubleshooting & estabilização", "Diagnóstico, análise de erros, filas, interfaces e go-live controlado."],
  ["Projetos, rollouts & hypercare", "Do desenho da solução à estabilização operacional pós go-live."],
  ["Instrutoria & mentoria SAP", "Formação de consultores e key users, workshops técnicos e didática bilíngue."],
];

const AUTORIDADE = [
  "Desde 1996 em tecnologia, logística e SAP",
  "Mais de 25 anos no ecossistema SAP",
  "Mais de 15 anos dedicados ao SAP EWM",
  "Consultor bilíngue em projetos nacionais e internacionais",
  "Especialista em SAP EWM e SAP SCM",
  "Experiência em projetos de alta criticidade",
  "Instrutor SAP, mentor técnico e palestrante de logística",
  "Fundador da Best One IT · Criador da Jornada",
];

const CHECKLIST = [
  "Raciocínio de projeto",
  "Processos ponta a ponta",
  "Modelagem de solução",
  "Integração entre módulos",
  "Análise de impactos operacionais",
  "Troubleshooting",
  "Decisão arquitetural",
  "Erros comuns de projeto",
  "Boas práticas de implantação",
  "Visão de consultor sênior",
];

export default function SobrePage() {
  return (
    <div className="bg-[#0a0a0c] text-white">
      <section className="mx-auto max-w-[1140px] px-[clamp(20px,4vw,56px)] py-[clamp(56px,8vw,100px)]">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(260px,360px)_1fr]">
          <div className="relative">
            <div className="absolute -right-2.5 -top-2.5 z-0 h-[64%] w-[64%] rounded-xl border-2 border-[#f7bd31]/40" />
            <div className="relative z-[1] aspect-[4/5] overflow-hidden rounded-xl border border-[#f7bd31]/30 shadow-[0_24px_60px_rgba(0,0,0,.55)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/alexandre.jpeg"
                alt="Alexandre Santos Brunelli — Especialista e Mentor SAP EWM"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#08080a] to-transparent px-4 pb-4 pt-8">
                <div className="font-[family-name:var(--font-display)] text-xl font-bold">Alexandre S. Brunelli</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#f7bd31]">
                  Especialista & Mentor SAP EWM
                </div>
              </div>
              <div className="absolute left-3.5 top-3.5 rounded bg-[#f7bd31] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0a0a0c]">
                Mentor da Jornada
              </div>
            </div>
          </div>

          <div>
            <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f7bd31]">
              Quem conduz a sua jornada
            </span>
            <h1 className="mt-3 mb-4 font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,44px)] font-bold uppercase leading-tight">
              Aprenda SAP EWM com quem atua em <span className="text-[#f7bd31]">projetos reais</span> de alta
              criticidade
            </h1>
            <p className="mb-5 text-[16px] leading-relaxed text-[#c8c8c8]">
              Consultor SAP sênior, SCM Solution Architect, instrutor SAP e palestrante de logística — em atuação desde
              1996, com domínio prático de SAP EWM, SAP SCM e integrações logísticas em projetos nacionais e
              internacionais.
            </p>
            <div className="mb-5 grid grid-cols-3 gap-3">
              {[
                ["+30", "anos em tecnologia"],
                ["+25", "anos no ecossistema SAP"],
                ["+15", "anos em SAP EWM"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-lg border border-white/10 bg-[#141416] p-3">
                  <div className="font-[family-name:var(--font-display)] text-2xl text-[#f7bd31]">{n}</div>
                  <div className="mt-1 text-[11px] text-[#aaa]">{l}</div>
                </div>
              ))}
            </div>
            <p className="mb-4 text-[15px] leading-relaxed text-[#c8c8c8]">
              Sua trajetória combina vivência prática em projetos de alta criticidade — implantações, rollouts,
              integrações e hypercare — com a capacidade didática de formar consultores, key users e arquitetos de
              solução, traduzindo temas complexos de SAP EWM e SCM em conhecimento aplicável ao dia a dia.
            </p>
            <p className="text-[15px] leading-relaxed text-[#c8c8c8]">
              Como instrutor SAP, mentor técnico e palestrante de logística, conecta visão de arquitetura, processos
              operacionais e desafios reais de supply chain — de gestão de armazéns e automação à rastreabilidade,
              qualidade, transporte e transformação digital. É fundador da Best One IT e criador da Jornada SAP EWM
              Academy.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1140px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold uppercase">Experiência setorial</h2>
        <div className="flex flex-wrap gap-2">
          {SETORES.map((s) => (
            <span key={s} className="rounded border border-white/10 bg-[#141416] px-3 py-1.5 text-sm text-[#cfcfcf]">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1140px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold uppercase">
          Principais domínios técnicos
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {DOMINIOS.map(([t, d]) => (
            <div key={t} className="rounded-lg border border-white/10 bg-[#141416] p-4">
              <div className="font-semibold text-[#f7bd31]">{t}</div>
              <p className="mt-1 text-sm text-[#a8a8a8]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1140px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold uppercase">
          Indicadores de autoridade
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {AUTORIDADE.map((a) => (
            <div key={a} className="flex gap-2 text-sm text-[#dcdcdc]">
              <span className="text-[#f7bd31]">◆</span>
              {a}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1140px] px-[clamp(20px,4vw,56px)] pb-20">
        <div className="rounded-xl border border-[#f7bd31]/25 bg-[#141416] p-6 md:p-8">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold uppercase">
            Por que aprender com Alexandre Brunelli?
          </h2>
          <p className="mb-5 text-[15px] leading-relaxed text-[#c8c8c8]">
            Alexandre não atua apenas como consultor de projeto. Como instrutor SAP, mentor técnico e palestrante,
            transforma vivência real de projetos em uma metodologia de ensino estruturada, direta e aplicável — explicando
            os temas com clareza para consultores, key users, gestores, arquitetos de solução e equipes operacionais.
            Você não aprende apenas transações ou telas; aprende a raciocinar como um consultor sênior:
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKLIST.map((x) => (
              <div key={x} className="text-sm text-[#dcdcdc]">
                <span className="mr-2 text-[#f7bd31]">✓</span>
                {x}
              </div>
            ))}
          </div>
          <blockquote className="mt-6 border-l-2 border-[#f7bd31] pl-4 text-[15px] italic leading-relaxed text-[#c8c8c8]">
            “SAP EWM não se domina apenas decorando telas. Domina-se entendendo arquitetura, processo, integração e
            operação real — e aprendendo com quem vive projetos críticos, ensina SAP e traduz logística complexa em
            conhecimento prático.”
          </blockquote>
          <Link href="/modulos" className="btn mt-8 inline-flex">
            Aprender SAP EWM com Alexandre Brunelli
          </Link>
        </div>
      </section>
    </div>
  );
}
