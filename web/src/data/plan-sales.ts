import { BASE_MODULE_CODES, PRO_EXTRA_CODES } from "@/data/plan-modules";

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
    steps: { title: string; text: string }[];
    faq: FaqItem[];
    groups: { title: string; hint: string; codes: readonly string[] }[];
    compare: string;
  }
> = {
  base: {
    slug: "base",
    kicker: "Plano Base · 6 módulos",
    headline: "Entre no SAP EWM com base sólida",
    audience: "Para quem está começando no EWM e precisa entender o mapa do armazém antes de operar o dia a dia.",
    promise:
      "Você sai com a estrutura mental certa: ERP x EWM, dados mestres, Warehouse Monitor e a visão geral de inbound/outbound — o alicerce para subir ao Pro depois.",
    checkoutEnabled: true,
    steps: [
      { title: "Crie sua conta", text: "Cadastro rápido no site da Academia, com o e-mail que você usará no pagamento." },
      { title: "Pague na Cakto", text: "Pix, cartão ou boleto no checkout seguro. Use o mesmo e-mail da conta." },
      { title: "Acesse a Academia", text: "Assim que o pagamento for aprovado, os 6 módulos do Base são liberados." },
    ],
    faq: [
      { q: "O acesso é imediato?", a: "Sim, após a Cakto confirmar o pagamento enviamos o webhook e a matrícula fica ativa. Entre na Academia com o mesmo e-mail." },
      { q: "Posso subir para o Pro depois?", a: "Sim. O Pro inclui tudo do Base. Fale com o suporte se já tiver o Base e quiser o upgrade." },
      { q: "Tem certificado?", a: "Sim. Você emite certificado por módulo concluído na área logada." },
    ],
    groups: [{ title: "6 módulos do Base", hint: "Fundamentos, estrutura e Monitor", codes: BASE_MODULE_CODES }],
    compare: "Depois do Base, o Pro adiciona 22 módulos operacionais (GR, GI, HU, RF, waves).",
  },
  pro: {
    slug: "pro",
    kicker: "Plano Pro · 28 módulos · mais recomendado",
    headline: "Domine o dia a dia do armazém no EWM",
    audience: "Para analistas e consultores que precisam executar inbound, outbound, inventário, HU e RF com segurança.",
    promise:
      "Inclui todo o Base mais 22 módulos de processo: recebimento, expedição, waves, WT/WO, lotes, seriais e RF Framework — o pacote que cobre o chão de armazém.",
    checkoutEnabled: true,
    steps: [
      { title: "Crie sua conta", text: "Cadastro no site. Esse e-mail precisa ser o mesmo da Cakto." },
      { title: "Pague o Pro na Cakto", text: "Checkout hospedado (Pix, cartão ou boleto)." },
      { title: "28 módulos na Academia", text: "Tudo do Base + os 22 módulos operacionais liberados de uma vez." },
    ],
    faq: [
      { q: "O Pro inclui o Base?", a: "Sim. É cumulativo: 6 do Base + 22 operacionais = 28 módulos." },
      { q: "E se eu pagar com outro e-mail?", a: "A matrícula é ligada ao e-mail da conta. Use o mesmo na Cakto para o acesso sair automático." },
      { q: "Tem certificado?", a: "Sim, por módulo, na Academia." },
    ],
    groups: [
      { title: "Tudo do Base (6)", hint: "Já incluso", codes: BASE_MODULE_CODES },
      { title: "Mais 22 operacionais", hint: "Processos, HU, RF e waves", codes: PRO_EXTRA_CODES },
    ],
    compare: "O Expert soma 17 módulos avançados (QM, produção, TM, MFS, analytics e migração).",
  },
  expert: {
    slug: "expert",
    kicker: "Plano Expert · 45 módulos",
    headline: "EWM de ponta a ponta, inclusive avançado",
    audience: "Para quem já opera o básico e precisa de integração, automação, qualidade, produção e cenários avançados.",
    promise:
      "Todo o Pro mais 17 módulos de profundidade técnica: QM, produção, TM, MFS, DAS, analytics, RFID, labor, billing e migração WM→EWM.",
    checkoutEnabled: true,
    steps: [
      { title: "Crie sua conta", text: "Cadastro na Academia com o e-mail da compra." },
      { title: "Pague o Expert na Cakto", text: "Pagamento único no checkout seguro." },
      { title: "Trilha completa", text: "Os 45 módulos publicados entram na sua matrícula." },
    ],
    faq: [
      { q: "Inclui Base e Pro?", a: "Sim. Expert = Pro (28) + 17 avançados = 45 módulos." },
      { q: "Como acesso depois de pagar?", a: "Login na Academia com o e-mail da Cakto. O webhook libera a matrícula automaticamente." },
      { q: "Serve para empresa?", a: "Conteúdo técnico sim. Para times, licenças e dashboard, veja o Corporate." },
    ],
    groups: [
      { title: "Tudo do Base (6)", hint: "Já incluso", codes: BASE_MODULE_CODES },
      { title: "Tudo do Pro (+22)", hint: "Já incluso", codes: PRO_EXTRA_CODES },
      { title: "17 módulos Expert", hint: "Integrações e cenários avançados", codes: [] },
    ],
    compare: "Times e gestão de colaboradores: plano Corporate, sob consulta.",
  },
  corporate: {
    slug: "corporate",
    kicker: "Corporate · 45 módulos + gestão",
    headline: "O Expert para o time, com gestão",
    audience: "Para empresas (Retail, Farma, 3PL) que precisam do conteúdo completo e controle por colaborador.",
    promise:
      "Mesmos 45 módulos do Expert, com licenças, trilhas por perfil, relatórios e certificados por pessoa. Proposta no WhatsApp — sem checkout automático.",
    checkoutEnabled: false,
    steps: [
      { title: "Conte o contexto", text: "Quantas pessoas, unidades e prazo de capacitação." },
      { title: "Proposta no WhatsApp", text: "Montamos valor, trilhas e onboarding." },
      { title: "Acesso do time", text: "Cada colaborador entra na Academia com a trilha combinada." },
    ],
    faq: [
      { q: "O conteúdo é o Expert?", a: "Sim, os 45 módulos. O diferencial é gestão, licenças e acompanhamento." },
      { q: "Tem pagamento no site?", a: "Não. Corporate é sob consulta, para fechar volume e onboarding." },
    ],
    groups: [
      { title: "Base (6)", hint: "Fundamentos", codes: BASE_MODULE_CODES },
      { title: "Pro (+22)", hint: "Operação do armazém", codes: PRO_EXTRA_CODES },
      { title: "Expert (+17)", hint: "Avançado — igual ao Expert", codes: [] },
    ],
    compare: "Pessoa física: escolha Base, Pro ou Expert e pague na Cakto.",
  },
};

export const PLAN_SALES_SLUGS = Object.keys(PLAN_SALES) as PlanSalesSlug[];
