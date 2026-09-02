"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { initials } from "@/lib/academy";

export type AcademyNavModule = {
  id: string;
  title: string;
  category: string;
  cover: string;
  lessons: number;
  href: string;
};

const navLinks = [
  { href: "/academia", label: "Início", hash: "" },
  { href: "/academia#minha-jornada", label: "Minha jornada", hash: "minha-jornada" },
  { href: "/academia#catalogo", label: "Catálogo", hash: "catalogo" },
  { href: "/academia/certificados", label: "Certificados", hash: "" },
];

export function MemberChrome({
  name,
  role,
  modules,
  children,
}: {
  name: string;
  role: string;
  modules: AcademyNavModule[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLesson = pathname.startsWith("/academia/aula");
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("panel-open", searchOpen);
    return () => document.body.classList.remove("panel-open");
  }, [searchOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    }
    function onClick() {
      setProfileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    const list = q
      ? modules.filter((m) => `${m.title} ${m.category}`.toLocaleLowerCase("pt-BR").includes(q))
      : modules.slice(0, 6);
    return list.slice(0, 9);
  }, [modules, query]);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    } catch {
      // still leave
    }
    router.replace("/");
    router.refresh();
  }

  if (isLesson) return <>{children}</>;

  const roleLabel = role === "ADMIN" ? "Admin" : "Aluno";

  return (
    <div className="academy-app">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className={`app-header${scrolled ? " is-scrolled" : ""}`} data-header>
        <BrandMark href="/academia" />
        <nav className="primary-nav" aria-label="Navegação principal">
          {navLinks.map((l) => {
            const active =
              l.href === "/academia"
                ? pathname === "/academia"
                : pathname === l.href || (l.hash === "" && pathname.startsWith(l.href));
            return (
              <Link key={l.label} href={l.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Buscar módulos" onClick={() => setSearchOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>
          </button>
          <button
            className="profile-button"
            type="button"
            aria-label="Abrir menu do perfil"
            aria-expanded={profileOpen}
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen((v) => !v);
            }}
          >
            <span className="avatar">{initials(name)}</span>
            <span className="profile-copy">
              <strong>{name.split(" ")[0]}</strong>
              <small>{roleLabel}</small>
            </span>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </button>
        </div>
        <div className="profile-menu" hidden={!profileOpen}>
          <Link href="/academia/perfil">Meu perfil</Link>
          <Link href="/academia/certificados">Meus certificados</Link>
          <Link href="/academia/suporte">Central de ajuda</Link>
          <button type="button" onClick={() => void onSignOut()} disabled={signingOut}>
            {signingOut ? "Saindo…" : "Sair"}
          </button>
        </div>
        <div className="search-panel" hidden={!searchOpen}>
          <div className="search-shell">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>
            <input
              type="search"
              placeholder="Buscar por módulo ou tema..."
              aria-label="Buscar por módulo ou tema"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={searchOpen}
            />
            <button type="button" onClick={() => setSearchOpen(false)}>
              Fechar
            </button>
          </div>
          <div className="search-results">
            {results.length === 0 ? (
              <p className="search-empty">Nenhum módulo encontrado. Tente outro termo.</p>
            ) : (
              results.map((m) => (
                <Link key={m.id} className="search-result" href={m.href} onClick={() => setSearchOpen(false)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.cover} alt="" width={1024} height={576} />
                  <div>
                    <strong>{m.title}</strong>
                    <small>
                      {m.category} · {m.lessons} aulas
                    </small>
                  </div>
                  <span aria-hidden="true">›</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </header>

      <div id="conteudo">{children}</div>

      <footer className="app-footer">
        <BrandMark href="/academia" className="footer-brand" />
        <div>
          <Link href="/academia/suporte">Suporte</Link>
          <Link href="/legal/termos">Termos</Link>
          <Link href="/legal/privacidade">Privacidade</Link>
        </div>
        <small>© 2026 Jornada SAP EWM</small>
      </footer>

      <nav className="mobile-tabs" aria-label="Navegação móvel">
        <Link href="/academia" className={pathname === "/academia" ? "is-active" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 11 12 4l9 7v9h-6v-6H9v6H3Z" />
          </svg>
          <span>Início</span>
        </Link>
        <Link href="/academia#minha-jornada">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 19V9m7 10V5m7 14v-7" />
          </svg>
          <span>Jornada</span>
        </Link>
        <button type="button" onClick={() => setSearchOpen(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <span>Buscar</span>
        </button>
        <Link href="/academia/perfil" className={pathname.startsWith("/academia/perfil") ? "is-active" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
          </svg>
          <span>Perfil</span>
        </Link>
      </nav>
    </div>
  );
}

export function MemberNav(_props: { name: string }) {
  return null;
}

export function MemberFooter() {
  return null;
}
