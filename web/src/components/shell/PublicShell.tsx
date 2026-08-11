"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/#inicio", label: "Início" },
  { href: "/#modulos", label: "Módulos" },
  { href: "/planos", label: "Planos" },
  { href: "/blog", label: "Blog" },
  { href: "/#especialista", label: "Especialista" },
  { href: "/sobre", label: "Sobre" },
  { href: "/empresas", label: "Empresas" },
  { href: "/contato", label: "Contato" },
];

function linkActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function PublicHeader({
  signedIn,
  isAdmin,
}: {
  signedIn?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-4 px-[clamp(20px,4vw,56px)]">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/gold-badge.png" alt="" className="h-[38px] w-[38px] object-contain" />
          <span className="whitespace-nowrap font-[family-name:var(--font-display)] text-[19px] font-bold tracking-wide text-white">
            JORNADA <span className="text-[#f6b40a]">SAP&nbsp;EWM</span>{" "}
            <span className="text-[#8a8a8a]">Academy</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`text-sm font-medium ${linkActive(pathname, l.href) ? "text-[#f6b40a]" : "text-[#e6e6e6] hover:text-[#f6b40a]"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link
                href={isAdmin ? "/administracao" : "/academia"}
                className="rounded-md bg-[#f6b40a] px-3 py-2 text-sm font-bold text-[#0a0a0c]"
              >
                {isAdmin ? "Administração" : "Minha Academia"}
              </Link>
            </>
          ) : (
            <Link href="/conta/entrar" className="rounded-md bg-[#f6b40a] px-3 py-2 text-sm font-bold text-[#0a0a0c]">
              Entrar
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-xl text-white xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            ≡
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#08080a]/98 px-5 py-3 xl:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="border-b border-white/5 py-3 text-base text-[#e6e6e6]">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#08080a]">
      <div className="mx-auto max-w-[1140px] px-[clamp(20px,4vw,56px)] py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3.5 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-wide text-white">
              Explorar
            </div>
            <div className="flex flex-col gap-2.5 text-[13.5px] text-[#a8a8a8]">
              <Link href="/#modulos" className="hover:text-[#f6b40a]">
                Módulos
              </Link>
              <Link href="/blog" className="hover:text-[#f6b40a]">
                Blog
              </Link>
              <Link href="/planos" className="hover:text-[#f6b40a]">
                Planos
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-3.5 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-wide text-white">
              Sobre
            </div>
            <div className="flex flex-col gap-2.5 text-[13.5px] text-[#a8a8a8]">
              <Link href="/sobre" className="hover:text-[#f6b40a]">
                O Especialista
              </Link>
              <Link href="/empresas" className="hover:text-[#f6b40a]">
                Empresas
              </Link>
              <Link href="/contato" className="hover:text-[#f6b40a]">
                Contato
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-3.5 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-wide text-white">
              Recursos
            </div>
            <div className="flex flex-col gap-2.5 text-[13.5px] text-[#a8a8a8]">
              <Link href="/blog#newsletter" className="hover:text-[#f6b40a]">
                Newsletter
              </Link>
              <Link href="/academia" className="hover:text-[#f6b40a]">
                Academia
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-3.5 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-wide text-white">
              Legal
            </div>
            <div className="flex flex-col gap-2.5 text-[13.5px] text-[#a8a8a8]">
              <Link href="/legal/privacidade" className="hover:text-[#f6b40a]">
                Política de Privacidade
              </Link>
              <Link href="/legal/termos" className="hover:text-[#f6b40a]">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.07] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gold-badge.png" alt="" className="h-[30px] w-[30px] object-contain" />
            <div>
              <span className="font-[family-name:var(--font-display)] text-[15px] font-bold tracking-wide text-white">
                JORNADA <span className="text-[#f6b40a]">SAP EWM</span> <span className="text-[#888]">Academy</span>
              </span>
              <p className="text-xs text-[#6f6f6f]">Best One IT Treinamentos · © 2026</p>
            </div>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-[#6f6f6f]">
            Produto educacional independente. SAP é marca registrada de seus respectivos proprietários.
          </p>
        </div>
      </div>
    </footer>
  );
}
