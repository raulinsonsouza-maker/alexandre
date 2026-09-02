/** Menu principal da área pública — única fonte para header e mobile. */
export const PUBLIC_NAV = [
  { href: "/", label: "Início", match: "home" as const },
  { href: "/modulos", label: "Módulos", match: "prefix" as const },
  { href: "/planos", label: "Planos", match: "prefix" as const },
  { href: "/sobre", label: "Sobre", match: "exact" as const },
  { href: "/empresas", label: "Empresas", match: "exact" as const },
  { href: "/contato", label: "Contato", match: "exact" as const },
] as const;

export function publicNavActive(pathname: string, href: string, match: (typeof PUBLIC_NAV)[number]["match"]) {
  if (match === "home") return pathname === "/";
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
