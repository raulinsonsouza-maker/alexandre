import { BASE_MODULE_CODES, PRO_MODULE_CODES } from "@/data/plan-modules";

export type PlanSalesSlug = "base" | "pro" | "expert" | "corporate";

export type FaqItem = { q: string; a: string };

export const PLAN_SALES: Record<
  PlanSalesSlug,
  {
    slug: PlanSalesSlug;
    kicker: string;
    headline: string;
    audience: string;
    promise: string;
    checkoutEnabled: boolean;
    outcomes: string[];
    steps: { title: string; text: string }[];
    faq: FaqItem[];
    /** Códigos do plano; "all" = todos os módulos publicados */
    moduleCodes: readonly string[] | "all";
    modulesHint: string;
  }
> = {
  base: {
    slug: "base",
    kicker: "Plano Base · 6 módulos",
    headline: "Pare de se sentir perdido no EWM",
    audience:
      "Você entra no projeto, abre o sistema e o armazém parece um labirinto. Este plano existe para isso acabar.",
    promise:
      "Em 6 módulos objetivos você entende como o EWM se liga ao ERP, como o armazém está estruturado, quais dados mestres importam e como o Warehouse Monitor vira o seu painel de controle. Sem enrolação. Sem jargão solto. Você sai sabendo o que está vendo na tela.",
    checkoutEnabled: true,
    outcomes: [
      "Ler a arquitetura ERP × EWM com segurança em reunião",
      "Explicar estrutura do armazém sem copiar slide",
      "Navegar dados mestres e o Warehouse Monitor no dia a dia",
      "Enxergar o fluxo de delivery de ponta a ponta",
      "Certificado por módulo para colocar no LinkedIn e no currículo",
    ],
    steps: [
      { title: "Garanta sua vaga", text: "Cadastro em um minuto. Use o e-mail que vai no pagamento." },
      { title: "Pague com segurança", text: "Pix, cartão ou boleto no checkout da Cakto." },
      { title: "Comece hoje", text: "Pagamento aprovado, os 6 módulos abrem na Academia. Estude no seu ritmo." },
    ],
    faq: [
      { q: "Quando começo?", a: "Assim que o pagamento for aprovado. Entre na Academia com o mesmo e-mail da compra." },
      { q: "Serve para quem nunca viu EWM?", a: "Sim. Foi desenhado para quem está começando e precisa de clareza, não de volume." },
      { q: "Tem certificado?", a: "Sim. Você emite por módulo concluído, direto na área logada." },
    ],
    moduleCodes: BASE_MODULE_CODES,
    modulesHint: "Seis aulas-núcleo. Cada uma resolve uma dúvida real de quem está começando.",
  },
  pro: {
    slug: "pro",
    kicker: "Plano Pro · 28 módulos",
    headline: "Vire a pessoa que resolve o armazém no SAP",
    audience:
      "Consultor, analista ou key user que precisa executar — não só conversar sobre — inbound, outbound, inventário, HU e RF.",
    promise:
      "28 módulos de operação real: recebimento, expedição, inventário, cross-docking, seriais, shipping, waves, VAS, WIP, recursos, WT, WO, distância, putaway, HU, lotes, identificação de estoque, UoM, RF, catch weight e distribuição. Você sai pronto para o chão de armazém, não para o PowerPoint.",
    checkoutEnabled: true,
    outcomes: [
      "Configurar e explicar GR, GI e inventário físico com propriedade",
      "Dominar HU, lote, serial e identificação de estoque",
      "Operar RF Framework e waves como no projeto do cliente",
      "Entregar WT/WO, putaway e resource management sem improviso",
      "Certificados por módulo para provar o que você realmente fez",
    ],
    steps: [
      { title: "Trave o preço", text: "Cadastro rápido. O e-mail da conta é o da compra — sem mistério." },
      { title: "Pague e entre", text: "Cakto: Pix, cartão ou boleto. Checkout seguro." },
      { title: "28 módulos seus", text: "Acesso imediato na Academia depois da aprovação. Estude, pratique, certifique." },
    ],
    faq: [
      { q: "O acesso é na hora?", a: "Sim, após a confirmação do pagamento. Login com o mesmo e-mail da Cakto." },
      { q: "Isso cobre o dia a dia do projeto?", a: "Sim. O recorte é operacional: o que o consultor e o time de armazém realmente usam." },
      { q: "Tem certificado?", a: "Sim, um por módulo concluído." },
    ],
    moduleCodes: PRO_MODULE_CODES,
    modulesHint: "Vinte e oito módulos. A trilha de quem precisa entregar resultado no cliente, não só assistir aula.",
  },
  expert: {
    slug: "expert",
    kicker: "Plano Expert · 45 módulos",
    headline: "Seja a referência técnica de EWM no projeto",
    audience:
      "Quem já opera o armazém e agora precisa de integração, automação, qualidade, produção e os cenários que separam o especialista do restante da sala.",
    promise:
      "45 módulos do mapa completo: operação, qualidade, produção, TM, MFS, DAS, analytics, RFID, labor, billing e migração WM→EWM. Você deixa de ser “o de EWM básico” e passa a ser quem fecha o desenho de ponta a ponta.",
    checkoutEnabled: true,
    outcomes: [
      "Conduzir desenhos com QM, produção e transporte no mesmo fio",
      "Falar de MFS, DAS, RFID e labor sem enrolar o cliente",
      "Usar analytics e billing para sustentar decisão, não achismo",
      "Apoiar migração WM→EWM com repertório, não com Wikipedia",
      "Portfólio de certificados no volume máximo da jornada",
    ],
    steps: [
      { title: "Reserve o Expert", text: "Crie a conta com o e-mail que vai pagar." },
      { title: "Checkout seguro", text: "Pix, cartão ou boleto na Cakto, pagamento único." },
      { title: "Trilha inteira aberta", text: "45 módulos na Academia, no seu ritmo, com certificado por módulo." },
    ],
    faq: [
      { q: "Quando libero o acesso?", a: "No instante em que o pagamento for aprovado. Entre com o e-mail da compra." },
      { q: "É para quem já trabalha com EWM?", a: "Sim. O Expert assume que você quer profundidade: integração, automação e cenários avançados." },
      { q: "Tem certificado?", a: "Sim. Cada módulo concluído gera certificado na Academia." },
    ],
    moduleCodes: "all",
    modulesHint: "Quarenta e cinco módulos. O mapa completo para quem quer ser a referência na mesa do projeto.",
  },
  corporate: {
    slug: "corporate",
    kicker: "Corporate · capacitação do time",
    headline: "Capacite o time inteiro, com controle de verdade",
    audience:
      "Retail, Farma, 3PL e indústrias que não podem depender de um único especialista — e precisam de trilha, prazo e evidência por colaborador.",
    promise:
      "Conteúdo técnico completo da jornada, licenças para o time, trilhas por perfil, relatórios de progresso e certificado por pessoa. Sem checkout genérico: montamos a proposta no WhatsApp, do tamanho da sua operação.",
    checkoutEnabled: false,
    outcomes: [
      "Mesmo conteúdo avançado, organizado para várias pessoas",
      "Trilhas por perfil (consultor, key user, operação)",
      "Visão de quem avançou, quem travou e quem certificou",
      "Onboarding alinhado ao go-live ou à onda de projeto",
      "Proposta sob medida — volume, prazo e unidades",
    ],
    steps: [
      { title: "Fale o cenário", text: "Quantas pessoas, unidades, prazo e o que o time precisa entregar." },
      { title: "Receba a proposta", text: "Valor, trilhas e onboarding no WhatsApp, sem formulário eterno." },
      { title: "O time entra", text: "Cada colaborador acessa a Academia com a trilha combinada." },
    ],
    faq: [
      { q: "Dá para pagar no site?", a: "Não. Corporate é proposta comercial, para fechar volume e onboarding com calma." },
      { q: "Consigo certificados por colaborador?", a: "Sim. Cada pessoa emite os certificados dos módulos que concluir." },
      { q: "Atende operação em vários CDs?", a: "Sim. É o formato pensado para empresa, não para compra individual." },
    ],
    moduleCodes: "all",
    modulesHint: "Toda a trilha técnica, empacotada para o time — com gestão, não só com login.",
  },
};

export const PLAN_SALES_SLUGS = Object.keys(PLAN_SALES) as PlanSalesSlug[];
