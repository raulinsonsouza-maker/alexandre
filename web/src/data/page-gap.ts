/**
 * De-para: páginas do protótipo (.dc.html) × app Next (web/)
 * Mapa de rotas organizadas por área.
 */

export const PAGE_GAP = [
  { proto: "index.dc.html", next: "/", status: "ok", note: "Site · Landing via DB" },
  { proto: "Modulo.dc.html", next: "/modulos/[slug]", status: "ok", note: "Site · Módulo avulso" },
  { proto: "Planos.dc.html", next: "/planos", status: "ok", note: "Site · Planos do DB" },
  { proto: "Cadastro.dc.html", next: "/conta/cadastro + /conta/entrar", status: "parcial", note: "Conta" },
  { proto: "Checkout.dc.html", next: "/checkout", status: "ok", note: "Site · Checkout plan|module" },
  { proto: "Campus.dc.html", next: "/academia", status: "ok", note: "Academia · aluno" },
  { proto: "Modulo Aula.dc.html", next: "/academia/aula/[id]", status: "parcial", note: "Academia · player" },
  { proto: "Meu Perfil.dc.html", next: "/academia/perfil", status: "parcial", note: "Academia" },
  { proto: "Certificados.dc.html", next: "/academia/certificados", status: "parcial", note: "Academia" },
  { proto: "Admin.dc.html", next: "/administracao/*", status: "ok", note: "Administração" },
  { proto: "Sobre.dc.html", next: "/sobre", status: "ok", note: "Site · institucional" },
  { proto: "Contato.dc.html", next: "/contato", status: "ok", note: "Site · institucional" },
  { proto: "Empresas.dc.html", next: "/empresas", status: "ok", note: "Site · B2B" },
  { proto: "Categorias.dc.html", next: "/modulos", status: "ok", note: "Site · catálogo de módulos" },
  { proto: "Blog.dc.html", next: "/blog + /blog/[slug]", status: "ok", note: "Site · blog" },
  { proto: "EWM Basics/Pro/Premium", next: "/planos", status: "ok", note: "Site · planos" },
  { proto: "Termos/Privacidade", next: "/legal/termos + /legal/privacidade", status: "parcial", note: "Legal" },
  { proto: "Suporte/Anotacoes/Favoritos/Provas/Gamificacao/Ofertas", next: "stubs ou —", status: "adiado", note: "Pós-MVP" },
  { proto: "CRM*.dc.html", next: "—", status: "adiado", note: "CRM fora do escopo" },
] as const;
