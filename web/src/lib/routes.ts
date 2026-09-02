/** Rotas canônicas do sistema — use estas constantes nos links. */
export const routes = {
  home: "/",
  planos: "/planos",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  modulo: (slug: string) => `/modulos/${slug}`,
  modulos: "/modulos",
  sobre: "/sobre",
  empresas: "/empresas",
  contato: "/contato",
  checkout: "/checkout",
  checkoutPlan: (slug: string) => `/checkout?plan=${slug}`,
  planSales: (slug: string) => `/planos/${slug}`,
  checkoutModule: (slug: string) => `/checkout?module=${slug}`,

  conta: {
    entrar: "/conta/entrar",
    cadastro: "/conta/cadastro",
    recuperarSenha: "/conta/recuperar-senha",
  },

  legal: {
    termos: "/legal/termos",
    privacidade: "/legal/privacidade",
  },

  academia: {
    root: "/academia",
    aula: (id: string) => `/academia/aula/${id}`,
    perfil: "/academia/perfil",
    certificados: "/academia/certificados",
    suporte: "/academia/suporte",
    lgpd: "/academia/lgpd",
  },

  administracao: {
    root: "/administracao",
    usuarios: "/administracao/usuarios",
    matriculas: "/administracao/matriculas",
    pedidos: "/administracao/pedidos",
    planos: "/administracao/planos",
    plano: (id: string) => `/administracao/planos/${id}`,
    conteudo: "/administracao/conteudo",
    modulo: (id: string) => `/administracao/conteudo/${id}`,
    site: "/administracao/site",
    blog: "/administracao/blog",
    blogPost: (id: string) => `/administracao/blog/${id}`,
    cupons: "/administracao/cupons",
    auditoria: "/administracao/auditoria",
  },
} as const;
