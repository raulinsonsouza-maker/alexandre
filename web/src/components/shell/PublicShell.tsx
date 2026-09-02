"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { PUBLIC_NAV, publicNavActive } from "@/lib/public-nav";

export function PublicHeader({
  signedIn,
  isAdmin,
}: {
  signedIn?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    document.body.classList.toggle("panel-open", open);
    return () => document.body.classList.remove("panel-open");
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const headerClass = [
    "app-header",
    "public-header",
    isHome ? (scrolled ? "is-scrolled" : "is-home") : "is-solid",
  ].join(" ");

  const ctaHref = signedIn ? (isAdmin ? "/administracao" : "/academia") : "/conta/entrar";
  const ctaLabel = signedIn ? (isAdmin ? "Administração" : "Minha jornada") : "Entrar";

  return (
    <header className={headerClass}>
      <BrandMark />
      <nav className="primary-nav" aria-label="Navegação principal">
        {PUBLIC_NAV.map((item) => {
          const active = publicNavActive(pathname, item.href, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "is-active" : undefined}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        <Link href={ctaHref} className="header-cta">
          {ctaLabel}
        </Link>
        <button
          type="button"
          className="icon-button public-menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>
      <div className={`public-mobile-nav${open ? " is-open" : ""}`} aria-hidden={!open}>
        {PUBLIC_NAV.map((item) => {
          const active = publicNavActive(pathname, item.href, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "is-active" : undefined}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
        <Link href={ctaHref} className="public-mobile-cta">
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-main" aria-label="Rodapé">
        <div className="site-footer-brand">
          <BrandMark />
          <p>Formação prática em SAP EWM para consultores, key users e times de logística.</p>
          <Link href="/conta/entrar" className="site-footer-cta">
            Entrar na academia
          </Link>
        </div>
        <div>
          <h3>Formação</h3>
          <Link href="/modulos">Módulos</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/blog">Blog</Link>
        </div>
        <div>
          <h3>Institucional</h3>
          <Link href="/sobre">O especialista</Link>
          <Link href="/empresas">Para empresas</Link>
          <Link href="/contato">Contato</Link>
        </div>
        <div>
          <h3>Alunos</h3>
          <Link href="/academia">Minha jornada</Link>
          <Link href="/conta/entrar">Entrar</Link>
          <Link href="/conta/cadastro">Criar conta</Link>
        </div>
        <div>
          <h3>Legal</h3>
          <Link href="/legal/privacidade">Privacidade</Link>
          <Link href="/legal/termos">Termos de uso</Link>
        </div>
      </nav>
      <div className="site-footer-base">
        <span>© 2026 Best One IT Treinamentos</span>
        <span>SAP é marca registrada de seus respectivos proprietários.</span>
      </div>
    </footer>
  );
}
