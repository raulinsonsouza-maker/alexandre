export type CatalogItem = {
  file: string;
  title: string;
  category: string;
  description: string;
  price: number;
  slug: string;
  id: string;
  index: number;
};

export const CAT_ORDER = [
  "Boas-vindas e Fundamentos",
  "Estrutura e Master Data",
  "Inbound",
  "Outbound",
  "Processos Internos do Armazém",
  "Produção e Manufatura",
  "Qualidade e Compliance",
  "RF, Automação e Identificação",
  "Serviços e Distribuição",
  "Analytics e Billing",
  "Transporte e Integrações",
] as const;

const RAW: [string, string, string, string, number][] = [
  ["00 - ERP x EWM Basis Linkage.png", "ERP x EWM Basis Linkage", "Boas-vindas e Fundamentos", "Conecte ERP e EWM na camada Basis e domine a comunicação qRFC, o CIF e a arquitetura que sustenta toda a operação do armazém.", 317.79],
  ["01 - Migration from Logistic Execution Warehouse Management.png", "Migration LE-WM to EWM", "Boas-vindas e Fundamentos", "Planeje e execute a migração do WM clássico para o SAP EWM com gap analysis, estratégia e boas práticas de transição.", 424.79],
  ["02 - Warehouse Structure.png", "Warehouse Structure", "Estrutura e Master Data", "Configure número de depósito, tipos, áreas e bins e entenda a estrutura física e lógica que organiza todo o armazém.", 317.79],
  ["03 - EWM Master Data.png", "EWM Master Data", "Estrutura e Master Data", "Domine os dados mestres — produto, business partner, HU e storage bin — que sustentam cada processo do EWM.", 317.79],
  ["04 - Warehouse Monitoring.png", "Warehouse Monitoring", "Estrutura e Master Data", "Tenha visibilidade operacional em tempo real com o Warehouse Monitor: alertas, KPIs e execução em uma só tela.", 317.79],
  ["05 - Delivery Processing.png", "Delivery Processing", "Outbound", "Processe entregas inbound e outbound de ponta a ponta, com documentos integrados ao fluxo do armazém.", 317.79],
  ["06 - Goods Receipt.png", "Goods Receipt", "Inbound", "Receba mercadorias com conferência na doca, integração de pedidos e armazenagem orientada por estratégia.", 317.79],
  ["07 - Goods Issue.png", "Goods Issue", "Outbound", "Execute a saída de mercadorias e a expedição: picking, packing, loading e ship confirm sem perder o controle.", 317.79],
  ["08 - Physical Inventory.png", "Physical Inventory", "Processos Internos do Armazém", "Garanta acurácia de estoque com contagem cíclica, tratamento de divergências e execução por RF.", 317.79],
  ["09 - Cross-Docking CD.png", "Cross-Docking (CD)", "Processos Internos do Armazém", "Acelere o fluxo entre recebimento e expedição, eliminando armazenagem e ganhando velocidade operacional.", 424.79],
  ["10 - Serial Number.png", "Serial Number", "Qualidade e Compliance", "Implemente rastreabilidade unitária no armazém com controle de número de série em cada movimento.", 424.79],
  ["11 - Shipping and Receiving.png", "Shipping and Receiving", "Inbound", "Estruture os processos de recebimento e expedição com controle de doca e documentos integrados.", 317.79],
  ["12 - Advanced Shipping and Receiving.png", "Advanced Shipping and Receiving", "Inbound", "Integre pátio, doca e transporte com recursos avançados de yard, unidades de transporte e ASR.", 424.79],
  ["13 - Wave Management.png", "Wave Management", "Outbound", "Planeje e libere ondas de separação, agrupando a demanda para otimizar o picking do armazém.", 424.79],
  ["14 - Quality Management.png", "Quality Management", "Qualidade e Compliance", "Integre inspeção, bloqueio e liberação de qualidade diretamente às operações do armazém.", 424.79],
  ["15 - Advanced Production Integration.png", "Advanced Production Integration", "Produção e Manufatura", "Conecte armazém e produção com PSA, staging e consumo em cenários avançados de manufatura.", 799.29],
  ["16 - Integration with Production.png", "Integration with Production", "Produção e Manufatura", "Abasteça e consuma materiais de produção com integração nativa entre EWM e PP.", 424.79],
  ["17 - Integration with Repetitive Manufacturing.png", "Repetitive Manufacturing", "Produção e Manufatura", "Sincronize armazém e manufatura repetitiva em fluxo contínuo de abastecimento de linha.", 424.79],
  ["18 - MES-EWM Integration.png", "MES-EWM Integration", "Produção e Manufatura", "Integre MES e EWM no chão de fábrica com automação e sincronização operacional.", 799.29],
  ["19 - Value-Added Services VAS.png", "Value-Added Services (VAS)", "Serviços e Distribuição", "Agregue valor no armazém com kitting, labeling, packing e serviços sob medida.", 424.79],
  ["20 - Plant Maintenance Supply.png", "Plant Maintenance Supply", "Produção e Manufatura", "Abasteça a manutenção industrial com peças, kits e suprimento integrado ao PM.", 424.79],
  ["21 - Work-in-Process WIP Management.png", "Work-in-Process (WIP)", "Produção e Manufatura", "Controle o estoque em processo entre etapas produtivas com staging e visibilidade total.", 424.79],
  ["22 - Resource Management.png", "Resource Management", "Processos Internos do Armazém", "Gerencie recursos, filas e capacidade do armazém para equilibrar carga e execução.", 424.79],
  ["23 - Warehouse Task.png", "Warehouse Task", "Processos Internos do Armazém", "Execute tarefas de armazém com precisão: criação, confirmação e rastreio por RF.", 317.79],
  ["24 - Warehouse Order Creation.png", "Warehouse Order Creation", "Processos Internos do Armazém", "Agrupe tarefas em ordens de forma inteligente, otimizando sequência e distância.", 424.79],
  ["25 - Travel Distance Calculation.png", "Travel Distance Calculation", "Processos Internos do Armazém", "Otimize percurso e distância operacional para reduzir tempo e ganhar eficiência.", 424.79],
  ["26 - Putaway and Stock Removal Strategies.png", "Putaway & Stock Removal", "Processos Internos do Armazém", "Defina estratégias de armazenagem e retirada que maximizam ocupação e produtividade.", 317.79],
  ["27 - Handling Unit HU.png", "Handling Unit (HU)", "RF, Automação e Identificação", "Gerencie unidades de manuseio com criação, rotulagem e movimentação rastreável.", 424.79],
  ["28 - Batch Management.png", "Batch Management", "Qualidade e Compliance", "Garanta rastreabilidade por lote, controle de validade e gestão completa de batches.", 424.79],
  ["29 - Stock Identification.png", "Stock Identification", "RF, Automação e Identificação", "Identifique o estoque de forma única e rastreável em todo o ciclo do armazém.", 424.79],
  ["30 - Stock-Specific Unit of Measure.png", "Stock-Specific Unit of Measure", "RF, Automação e Identificação", "Controle o estoque por unidade de medida específica com conversões precisas.", 424.79],
  ["31 - Radio Frequency Framework.png", "Radio Frequency Framework", "RF, Automação e Identificação", "Execute operações móveis por RF com telas configuráveis, scanner e confirmação.", 424.79],
  ["32 - RFID.png", "RFID", "RF, Automação e Identificação", "Automatize a leitura e o rastreamento por radiofrequência com portais e tags RFID.", 799.29],
  ["33 - Catch Weight.png", "Catch Weight Management", "RF, Automação e Identificação", "Gerencie peso variável por unidade logística com captura e precisão na balança.", 424.79],
  ["34 - Just-In-Time JIT Processing.png", "Just-In-Time (JIT) Processing", "Produção e Manufatura", "Abasteça a linha no momento exato com sequenciamento e sincronização JIT.", 799.29],
  ["35 - Goods Distribution with Distribution Equipment.png", "Goods Distribution", "Serviços e Distribuição", "Distribua mercadorias internamente com equipamentos de movimentação e rotas otimizadas.", 424.79],
  ["36 - Transit Warehousing.png", "Transit Warehousing", "Serviços e Distribuição", "Controle mercadorias em trânsito entre pontos logísticos com visibilidade de hub.", 799.29],
  ["37 - Labor Management LM.png", "Labor Management (LM)", "Analytics e Billing", "Gerencie produtividade e desempenho da mão de obra com KPIs operacionais.", 799.29],
  ["38 - Warehouse Analytics.png", "Warehouse Analytics", "Analytics e Billing", "Transforme dados em decisão com indicadores e inteligência analítica do armazém.", 424.79],
  ["39 - Warehouse Billing.png", "Warehouse Billing", "Analytics e Billing", "Fature serviços logísticos e gerencie a cobrança e os custos do armazém.", 799.29],
  ["40 - SAP Dock Appointment Scheduling.png", "Dock Appointment Scheduling", "Transporte e Integrações", "Agende docas e janelas de carregamento de forma inteligente, com check-in e check-out.", 424.79],
  ["41 - TM-EWM Basic Integration.png", "TM-EWM Basic Integration", "Transporte e Integrações", "Conecte transporte e armazém com a integração básica entre TM e EWM.", 424.79],
  ["42 - TM-EWM General Integration.png", "TM-EWM General Integration", "Transporte e Integrações", "Integre transporte e armazém ponta a ponta com a sincronização ampla TM-EWM.", 799.29],
  ["43 - Material Flow System MFS.png", "Material Flow System (MFS)", "Transporte e Integrações", "Automatize o fluxo de materiais integrando o EWM a PLCs, conveyors e equipamentos.", 799.29],
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const CATALOG: CatalogItem[] = RAW.map(([file, title, category, description, price], index) => ({
  file,
  title,
  category,
  description,
  price,
  slug: slugify(title),
  id: slugify(title),
  index,
}));

/**
 * Índice do catálogo da vitrine → código em aulas-conteudo.json.
 * null = só vitrine (sem aula no JSON); ex.: Wave Management.
 * M15 = stub de Advanced Production; M16 = conteúdo combinado API+Production.
 * M00 (boas-vindas) não entra neste mapa — só no JSON.
 */
export const MODULE_CODE_BY_INDEX: (string | null)[] = [
  "M01", "M02", "M03", "M04", "M05", "M06", "M07", "M08", "M09", "M10",
  "M11", "M12", "M13", null, "M14", "M15", "M16", "M17", "M18", "M19",
  "M20", "M21", "M22", "M23", "M24", "M25", "M26", "M27", "M28", "M29",
  "M30", "M31", "M32", "M33", "M34", "M35", "M36", "M37", "M38", "M39",
  "M40", "M41", "M42", "M43",
];

export function mediaUrl(file: string) {
  return `/media/${encodeURIComponent(file)}`;
}

export function codeFromCatalogItem(item: CatalogItem) {
  return MODULE_CODE_BY_INDEX[item.index] ?? null;
}

export function codeFromFile(file: string) {
  const m = file.match(/^(\d{2})\s*-/);
  return m ? `M${m[1]}` : null;
}

export function findCatalogBySlug(slug: string) {
  return CATALOG.find((c) => c.slug === slug || c.id === slug) || null;
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function getCategories() {
  return CAT_ORDER.map((name) => {
    const items = CATALOG.filter((c) => c.category === name);
    return { name, count: `${items.length} módulos`, items };
  }).filter((c) => c.items.length > 0);
}

export function getFeatured(slug = "warehouse-monitoring") {
  return CATALOG.find((c) => c.id === slug) || CATALOG[4] || CATALOG[0];
}
