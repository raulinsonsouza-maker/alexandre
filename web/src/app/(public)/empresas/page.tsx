"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const DESAFIOS = [
  ["Falta de key users preparados", "Dependência excessiva de consultorias externas"],
  ["Baixo conhecimento dos processos EWM", "Erros em recebimento, expedição, inventário e movimentações"],
  ["Dificuldade em integrar áreas", "Falhas entre logística, produção, qualidade, transporte e manutenção"],
  ["Pouca visão de troubleshooting", "Lentidão para resolver filas, mensagens e erros operacionais"],
  ["Uso limitado do sistema", "A empresa investe no SAP EWM, mas utiliza pouco do potencial"],
  ["Rotatividade de profissionais", "Perda de conhecimento crítico da operação"],
  ["Falta de padronização", "Cada unidade trabalha de uma forma diferente"],
  ["Baixa maturidade operacional", "Processos manuais, retrabalho e baixa rastreabilidade"],
];

const PUBLICOS = [
  ["Key users", "Dominar processos operacionais e apoiar a sustentação"],
  ["Consultores internos", "Evoluir tecnicamente na configuração e análise do EWM"],
  ["Analistas de logística", "Entender fluxos, documentos, tarefas e monitoramento"],
  ["Coordenadores e supervisores", "Melhorar gestão de processos e tomada de decisão"],
  ["Gerentes de armazém", "Obter visão integrada de operação, indicadores e riscos"],
  ["Times de TI", "Compreender integrações, filas, erros e arquitetura"],
  ["Times de qualidade", "Entender integração EWM com QM e inspeções"],
  ["Times de produção", "Entender abastecimento, PSA, staging e integração PP"],
  ["Times de transporte", "Entender integração entre EWM, expedição e TM"],
];

const BENEFICIOS = [
  ["Redução da dependência externa", "Times internos mais preparados para analisar e resolver problemas"],
  ["Padronização de conhecimento", "Mesma base conceitual e prática entre áreas e unidades"],
  ["Aceleração de projetos", "Profissionais entendem melhor processos, integrações e impactos"],
  ["Melhoria na sustentação", "Redução de retrabalho, erros recorrentes e chamados mal direcionados"],
  ["Visão ponta a ponta", "Conexão entre inbound, outbound, inventário, produção, qualidade e transporte"],
  ["Formação de key users", "Usuários mais preparados para apoiar operação e negócio"],
  ["Evolução técnica", "Consultores internos com maior domínio de configuração e análise"],
  ["Gestão de aprendizagem", "Acompanhamento de progresso, certificados e trilhas"],
];

const TRILHAS = [
  {
    name: "Trilha Key User SAP EWM",
    for: "Indicada para usuários-chave da operação logística.",
    mods: ["Warehouse Structure", "Master Data", "Goods Receipt", "Goods Issue", "Physical Inventory", "Warehouse Monitoring", "RF Framework"],
  },
  {
    name: "Trilha Consultor SAP EWM",
    for: "Indicada para consultores internos, TI e profissionais de sustentação.",
    mods: ["ERP x EWM Basis Linkage", "Delivery Processing", "Warehouse Task", "Warehouse Order Creation", "Putaway and Stock Removal Strategies", "Queue and Integration Analysis", "API and Integration"],
  },
  {
    name: "Trilha Gestão de Armazém",
    for: "Indicada para coordenadores, supervisores, gerentes e líderes logísticos.",
    mods: ["Warehouse Monitoring", "Labor Management", "Warehouse Analytics", "Wave Management", "Dock Appointment Scheduling", "Transportation Integration"],
  },
  {
    name: "Trilha Integrações Avançadas",
    for: "Indicada para empresas com processos integrados entre logística, produção, qualidade, manutenção e transporte.",
    mods: ["Quality Management", "Production Integration", "Repetitive Manufacturing", "Plant Maintenance Supply", "TM EWM Integration", "Material Flow System"],
  },
];

const GESTAO = [
  "Lista de colaboradores",
  "Trilhas liberadas",
  "Progresso individual",
  "Progresso por curso",
  "Certificados emitidos",
  "Relatórios",
  "Controle de licenças",
  "Convite por e-mail",
];

const MODALIDADES = [
  "Pacote por usuário",
  "Pacote por equipe",
  "Plano por trilha",
  "Plano anual corporativo",
  "Treinamento híbrido",
  "Mentoria executiva",
];

const FAQ = [
  ["A capacitação corporativa atende empresas em pré-implantação?", "Sim. A Jornada serve tanto para empresas que já operam SAP EWM quanto para times em preparação para implantação, rollout ou expansão."],
  ["É possível contratar múltiplos acessos?", "Sim. O modelo corporativo permite múltiplos usuários e licenças conforme a necessidade da empresa."],
  ["A empresa consegue acompanhar o progresso?", "Sim. Há acompanhamento de trilhas, progresso individual, certificados e relatórios."],
  ["Serve para operação e para consultores?", "Sim. Existem trilhas para key users, consultores, gestão e integrações avançadas."],
  ["Há certificado?", "Sim. Certificados podem ser emitidos conforme critérios de conclusão dos módulos e trilhas."],
  ["Dá para customizar a trilha?", "Sim. O plano Corporate pode ser configurado por módulos, trilhas ou acesso completo."],
  ["O login é individual?", "Sim. Cada colaborador tem acesso próprio e protegido."],
  ["Há suporte?", "Há suporte de acesso à plataforma. Escopos de mentoria e AMS podem ser combinados na proposta."],
  ["Podemos contratar só alguns módulos?", "Sim. É possível configurar por módulos ou trilhas específicas."],
  ["Isso substitui consultoria de projeto?", "Não. A capacitação fortalece o time interno; não substitui consultoria especializada de implantação quando necessária."],
];

export default function EmpresasPage() {
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="bg-[#0a0a0c] text-white">
      <section className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] pb-12 pt-16">
        <span className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.16em] text-[#f6b40a]">
          Jornada SAP EWM Academy · Corporativo
        </span>
        <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(30px,4.5vw,52px)] font-bold uppercase leading-tight">
          Capacite sua equipe em SAP EWM com uma formação prática, profunda e orientada a{" "}
          <span className="text-[#f6b40a]">projetos reais</span>
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#cfcfcf]">
          Uma trilha estruturada para formar consultores, key users, líderes operacionais, analistas de logística,
          gestores de armazém e profissionais de supply chain — com visão prática de operação, integração e arquitetura
          SAP EWM, organizada por módulos, trilhas, progresso, certificados e gestão corporativa.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#form" className="rounded bg-[#f6b40a] px-6 py-3 font-bold text-[#0a0a0c]">
            Solicitar proposta corporativa
          </a>
          <a href="#trilhas" className="rounded border border-white/20 px-6 py-3 font-semibold">
            Conhecer as trilhas de capacitação
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-[clamp(26px,3vw,40px)] font-bold uppercase">
          O desafio das empresas que utilizam SAP EWM
        </h2>
        <p className="mb-6 max-w-3xl text-[#a8a8a8]">
          Na prática, muitos problemas operacionais não acontecem por falha do SAP, mas por falta de entendimento dos
          processos, das integrações e da arquitetura do EWM.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {DESAFIOS.map(([d, i]) => (
            <div key={d} className="rounded-lg border border-white/10 bg-[#141416] p-4">
              <div className="font-semibold text-[#f6b40a]">{d}</div>
              <p className="mt-1 text-sm text-[#a8a8a8]">{i}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-[clamp(26px,3vw,40px)] font-bold uppercase">
          Uma plataforma de capacitação SAP EWM para empresas
        </h2>
        <p className="mb-6 max-w-3xl text-[#a8a8a8]">
          A empresa pode contratar acessos para seus colaboradores e acompanhar a evolução da equipe por meio de
          trilhas de aprendizagem, módulos técnicos, progresso individual, certificados e relatórios.
        </p>
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#f6b40a]">Para quem se aplica</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PUBLICOS.map(([t, d]) => (
            <div key={t} className="rounded-lg border border-white/10 bg-[#141416] p-4">
              <div className="font-semibold text-white">{t}</div>
              <p className="mt-1 text-sm text-[#a8a8a8]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-[clamp(26px,3vw,40px)] font-bold uppercase">
          O que sua empresa <span className="text-[#f6b40a]">ganha</span>
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {BENEFICIOS.map(([t, d]) => (
            <div key={t} className="rounded-lg border border-white/10 bg-[#141416] p-4">
              <div className="font-semibold text-[#f6b40a]">{t}</div>
              <p className="mt-1 text-sm text-[#a8a8a8]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trilhas" className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-[clamp(26px,3vw,40px)] font-bold uppercase">
          Trilhas de <span className="text-[#f6b40a]">capacitação</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TRILHAS.map((t) => (
            <div key={t.name} className="rounded-xl border border-white/10 bg-[#141416] p-5">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">{t.name}</h3>
              <p className="mt-2 text-sm text-[#a8a8a8]">{t.for}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.mods.map((m) => (
                  <span key={m} className="rounded border border-[#f6b40a]/25 bg-[#f6b40a]/10 px-2 py-1 text-xs text-[#f6b40a]">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-[clamp(26px,3vw,40px)] font-bold uppercase">
          Gestão corporativa
        </h2>
        <p className="mb-6 max-w-3xl text-[#a8a8a8]">
          Na modalidade empresarial, a Jornada SAP EWM permite que a empresa acompanhe a evolução dos colaboradores
          inscritos — RH, TI, logística ou centros de excelência SAP acompanham com mais controle e previsibilidade.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {GESTAO.map((g) => (
            <div key={g} className="rounded-lg border border-white/10 bg-[#141416] px-4 py-3 text-sm text-[#dcdcdc]">
              <span className="mr-2 text-[#f6b40a]">✓</span>
              {g}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold uppercase">Modalidades de contratação</h2>
        <div className="flex flex-wrap gap-2">
          {MODALIDADES.map((m) => (
            <span key={m} className="rounded border border-white/10 bg-[#141416] px-3 py-2 text-sm text-[#cfcfcf]">
              {m}
            </span>
          ))}
        </div>
        <p className="mt-6 text-sm text-[#a8a8a8]">
          Conduzida por Alexandre Brunelli.{" "}
          <Link href="/sobre" className="text-[#f6b40a]">
            Conheça o instrutor →
          </Link>
        </p>
      </section>

      <section id="form" className="mx-auto max-w-[720px] px-[clamp(20px,4vw,56px)] pb-16">
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(26px,3vw,40px)] font-bold uppercase">
          Solicite uma proposta <span className="text-[#f6b40a]">corporativa</span>
        </h2>
        <p className="mt-3 text-[#a8a8a8]">
          Sua empresa utiliza SAP EWM ou está se preparando para implantar, expandir ou sustentar a solução? Conte um
          pouco sobre sua necessidade e retornaremos com o melhor modelo.
        </p>
        {sent ? (
          <div className="mt-8 rounded-xl border border-[#f6b40a]/30 bg-[#141416] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase text-[#f6b40a]">
              Solicitação recebida
            </h3>
            <p className="mt-3 text-[#cfcfcf]">
              Obrigado pelo contato. Recebemos sua solicitação e retornaremos com uma proposta alinhada ao perfil da
              sua empresa e aos objetivos de capacitação em SAP EWM.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input className="input" name="nome" placeholder="Nome completo *" required />
            <input className="input" name="email" type="email" placeholder="E-mail corporativo *" required />
            <input className="input" name="telefone" placeholder="Telefone / WhatsApp *" required />
            <input className="input" name="empresa" placeholder="Empresa *" required />
            <input className="input" name="cargo" placeholder="Cargo" />
            <select className="input" name="qtd" defaultValue="">
              <option value="">Quantidade estimada de colaboradores</option>
              <option>1 a 5</option>
              <option>6 a 15</option>
              <option>16 a 30</option>
              <option>31 a 50</option>
              <option>Mais de 50</option>
            </select>
            <select className="input" name="objetivo" defaultValue="">
              <option value="">Principal objetivo</option>
              <option>Capacitar key users</option>
              <option>Apoiar implantação SAP EWM</option>
              <option>Apoiar rollout</option>
              <option>Melhorar sustentação</option>
              <option>Treinar equipe de TI</option>
              <option>Treinar liderança logística</option>
              <option>Criar trilha corporativa</option>
              <option>Solicitar proposta comercial</option>
            </select>
            <select className="input" name="jaUtiliza" defaultValue="">
              <option value="">A empresa já utiliza SAP EWM?</option>
              <option>Sim</option>
              <option>Não</option>
              <option>Em implantação</option>
            </select>
            <textarea
              className="input min-h-28"
              name="mensagem"
              placeholder="Conte um pouco sobre o contexto da sua empresa e o que busca com a capacitação."
            />
            <button type="submit" className="btn w-full">
              Solicitar proposta corporativa
            </button>
            <p className="text-xs text-[#7e7e84]">
              Ao enviar, você concorda com nossa{" "}
              <Link href="/legal/privacidade" className="text-[#f6b40a]">
                Política de Privacidade
              </Link>
              .
            </p>
          </form>
        )}
      </section>

      <section className="mx-auto max-w-[900px] px-[clamp(20px,4vw,56px)] pb-20">
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-[clamp(26px,3vw,40px)] font-bold uppercase">
          FAQ <span className="text-[#f6b40a]">Empresas</span>
        </h2>
        <div className="space-y-2">
          {FAQ.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q} className="overflow-hidden rounded-lg border border-white/10 bg-[#141416]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  onClick={() => setOpenFaq(open ? null : i)}
                >
                  <span className="font-semibold text-[#e2e2e2]">{q}</span>
                  <span className="text-[#f6b40a]">{open ? "–" : "+"}</span>
                </button>
                {open && <div className="border-t border-white/10 px-4 py-4 text-sm leading-relaxed text-[#a8a8a8]">{a}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
