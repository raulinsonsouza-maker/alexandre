import { BASE_MODULE_CODES, PRO_MODULE_CODES } from "@/data/plan-modules";

export type PlanSalesSlug = "base" | "pro" | "expert" | "corporate";

export type FaqItem = { q: string; a: string };

export type ModuleGroup = {
  title: string;
  codes: readonly string[];
};

export const PLAN_SALES: Record<
  PlanSalesSlug,
  {
    slug: PlanSalesSlug;
    kicker: string;
    headline: string;
    audience: string;
    promise: string;
    checkoutEnabled: boolean;
    ctaLabel: string;
    outcomesTitle: string;
    outcomes: string[];
    steps: { title: string; text: string }[];
    faq: FaqItem[];
    moduleCodes: readonly string[] | "all";
    moduleGroups?: ModuleGroup[];
    modulesHint: string;
    closing: string;
  }
> = {
  base: {
    slug: "base",
    kicker: "Plano Base · 6 módulos",
    headline: "Entenda o EWM de verdade — sem se sentir burro na reunião",
    audience:
      "Para quem acabou de cair no projeto (ou vai cair) e ainda abre a tela do armazém sem saber por onde começar.",
    promise:
      "Em 6 módulos claros você aprende o que o EWM é, como se liga ao ERP, como o armazém está montado e onde olhar no dia a dia. Sem enrolação. Sem volume que você não vai usar agora.",
    checkoutEnabled: true,
    ctaLabel: "Começar pelo Base",
    outcomesTitle: "O que você passa a dominar",
    outcomes: [
      "Explicar, com as próprias palavras, como ERP e EWM trabalham juntos",
      "Ler a estrutura do armazém sem depender de slide de outrem",
      "Saber quais dados mestres importam — e quais só atrapalham",
      "Usar o Warehouse Monitor como painel, não como labirinto",
      "Enxergar o fluxo de delivery de ponta a ponta",
      "Sair com certificado por módulo para currículo e LinkedIn",
    ],
    steps: [
      { title: "Crie sua conta", text: "Nome, e-mail e senha. Use o mesmo e-mail do pagamento." },
      { title: "Pague com segurança", text: "Pix ou cartão no checkout da Cakto." },
      { title: "Estude no seu ritmo", text: "Com o pagamento aprovado, os 6 módulos abrem na Academia." },
    ],
    faq: [
      {
        q: "Serve para quem nunca viu EWM?",
        a: "Sim. O Base foi feito exatamente para quem está começando e precisa de clareza antes de volume.",
      },
      {
        q: "Quando libero o acesso?",
        a: "Assim que o pagamento for confirmado. Entre na Academia com o mesmo e-mail da compra.",
      },
      {
        q: "Tem certificado?",
        a: "Sim. Cada módulo concluído gera certificado na área logada.",
      },
      {
        q: "E se eu precisar de mais depois?",
        a: "Você pode evoluir para o Pro ou o Expert quando quiser. O Base não trava seu caminho.",
      },
    ],
    moduleCodes: BASE_MODULE_CODES,
    moduleGroups: [
      {
        title: "Fundação",
        codes: BASE_MODULE_CODES,
      },
    ],
    modulesHint: "Seis módulos. O mínimo necessário para parar de adivinhar na tela.",
    closing: "Seu primeiro passo sólido no SAP EWM.",
  },
  pro: {
    slug: "pro",
    kicker: "Plano Pro · 28 módulos",
    headline: "Do recebimento à expedição: execute o armazém no SAP",
    audience:
      "Para consultor, analista ou key user que já entendeu o básico — e agora precisa operar de verdade no cliente.",
    promise:
      "28 módulos da operação do dia a dia: entrada, saída, inventário, packing, ondas, coletor e o resto do que o projeto cobra. Você para de só conversar sobre o processo e passa a executar.",
    checkoutEnabled: true,
    ctaLabel: "Quero o Pro",
    outcomesTitle: "O que muda no seu trabalho",
    outcomes: [
      "Configurar e explicar entrada, saída e inventário com propriedade",
      "Trabalhar com unidade de manuseio, lote e serial sem improviso",
      "Operar coletor (RF) e ondas como no projeto real",
      "Montar tarefas e ordens de armazém com método, não no chute",
      "Provar o que fez: certificado por módulo concluído",
    ],
    steps: [
      { title: "Cadastro rápido", text: "Crie a conta com o e-mail que vai usar no pagamento." },
      { title: "Pagamento seguro", text: "Pix ou cartão no checkout da Cakto." },
      { title: "Acesso liberado", text: "Pagamento aprovado → 28 módulos abertos na Academia." },
    ],
    faq: [
      {
        q: "O acesso é imediato?",
        a: "Sim, depois da confirmação do pagamento. Entre com o mesmo e-mail usado na Cakto.",
      },
      {
        q: "Isso cobre o que o cliente cobra no dia a dia?",
        a: "Sim. O foco é operacional: o que consultor e time de armazém realmente usam no projeto.",
      },
      {
        q: "Preciso ter feito o Base antes?",
        a: "Não é obrigatório. O Pro já inclui a base e aprofunda na operação. Se você é iniciante absoluto, o Base ainda pode ser o caminho mais leve.",
      },
      {
        q: "Tem certificado?",
        a: "Sim. Um certificado por módulo que você concluir.",
      },
    ],
    moduleCodes: PRO_MODULE_CODES,
    moduleGroups: [
      {
        title: "Fundação",
        codes: ["M00", "M01", "M03", "M04", "M05", "M06"],
      },
      {
        title: "Operação do armazém",
        codes: ["M07", "M08", "M09", "M10", "M11", "M12", "M13", "C13", "M19", "M21"],
      },
      {
        title: "Tarefas, estoque e coletor",
        codes: ["M22", "M23", "M24", "M25", "M26", "M27", "M28", "M29", "M30", "M31", "M33", "M35"],
      },
    ],
    modulesHint: "Vinte e oito módulos organizados na ordem em que o armazém acontece.",
    closing: "Pronto para entregar no chão de armazém — não só no PowerPoint.",
  },
  expert: {
    slug: "expert",
    kicker: "Plano Expert · 45 módulos",
    headline: "Seja a pessoa que fecha o desenho de ponta a ponta",
    audience:
      "Para quem já opera o armazém e quer virar referência: integração, automação, qualidade, produção e os cenários que separam o especialista do restante da sala.",
    promise:
      "45 módulos — o mapa completo da jornada. Você deixa de ser “o de EWM básico” e passa a sustentar conversas difíceis com método.",
    checkoutEnabled: true,
    ctaLabel: "Quero o Expert",
    outcomesTitle: "O que você passa a entregar",
    outcomes: [
      "Conduzir desenhos com qualidade, produção e transporte no mesmo fio",
      "Falar de automação e cenários avançados sem enrolar o cliente",
      "Usar analytics e billing para sustentar decisão — não achismo",
      "Apoiar migração WM → EWM com repertório de verdade",
      "Portfólio máximo de certificados da jornada",
    ],
    steps: [
      { title: "Reserve o Expert", text: "Crie a conta com o e-mail do pagamento." },
      { title: "Checkout único", text: "Pix ou cartão na Cakto." },
      { title: "Trilha inteira", text: "45 módulos na Academia, no seu ritmo, com certificado por módulo." },
    ],
    faq: [
      {
        q: "É para quem já trabalha com EWM?",
        a: "Sim. O Expert assume que você quer profundidade: integração, automação e cenários avançados.",
      },
      {
        q: "Quando libero o acesso?",
        a: "No instante em que o pagamento for aprovado. Entre com o e-mail da compra.",
      },
      {
        q: "Inclui a operação do Pro?",
        a: "Sim. Você recebe a trilha completa — fundação, operação e avançado.",
      },
      {
        q: "Tem certificado?",
        a: "Sim. Cada módulo concluído gera certificado na Academia.",
      },
    ],
    moduleCodes: "all",
    moduleGroups: [
      {
        title: "Fundação e operação",
        codes: PRO_MODULE_CODES,
      },
      {
        title: "Avançado e integração",
        codes: [], // filled dynamically from remaining modules on the page
      },
    ],
    modulesHint: "Quarenta e cinco módulos. O mapa completo para quem quer ser a referência na mesa.",
    closing: "A trilha completa para quem quer ser chamado quando o projeto aperta.",
  },
  corporate: {
    slug: "corporate",
    kicker: "Corporate · capacitação do time",
    headline: "Capacite o time inteiro — com prazo, trilha e evidência",
    audience:
      "Para retail, farma, 3PL e indústrias que não podem depender de um único especialista.",
    promise:
      "Conteúdo completo da jornada, licenças para o time, trilhas por perfil e relatório de progresso. Sem checkout genérico: montamos a proposta no WhatsApp, do tamanho da sua operação.",
    checkoutEnabled: false,
    ctaLabel: "Pedir proposta no WhatsApp",
    outcomesTitle: "O que a empresa ganha",
    outcomes: [
      "Mesmo conteúdo avançado, organizado para várias pessoas",
      "Trilhas por perfil: consultor, key user e operação",
      "Visão de quem avançou, quem travou e quem certificou",
      "Onboarding alinhado ao go-live ou à onda de projeto",
      "Proposta sob medida — volume, prazo e unidades",
    ],
    steps: [
      { title: "Conte o cenário", text: "Quantas pessoas, unidades, prazo e o que o time precisa entregar." },
      { title: "Receba a proposta", text: "Valor, trilhas e onboarding no WhatsApp — sem formulário eterno." },
      { title: "O time entra", text: "Cada colaborador acessa a Academia com a trilha combinada." },
    ],
    faq: [
      {
        q: "Dá para pagar no site?",
        a: "Não. Corporate é proposta comercial, para fechar volume e onboarding com calma.",
      },
      {
        q: "Tem certificado por colaborador?",
        a: "Sim. Cada pessoa emite os certificados dos módulos que concluir.",
      },
      {
        q: "Atende operação em vários CDs?",
        a: "Sim. É o formato pensado para empresa, não para compra individual.",
      },
    ],
    moduleCodes: "all",
    modulesHint: "Toda a trilha técnica, empacotada para o time — com gestão, não só com login.",
    closing: "Treine o time com método. Sem depender de um único herói.",
  },
};

export const PLAN_SALES_SLUGS = Object.keys(PLAN_SALES) as PlanSalesSlug[];
