"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const adminLinks = [
  { href: "/administracao", label: "Dashboard" },
  { href: "/administracao/usuarios", label: "Usuários" },
  { href: "/administracao/matriculas", label: "Matrículas" },
  { href: "/administracao/pedidos", label: "Pedidos" },
  { href: "/administracao/planos", label: "Planos" },
  { href: "/administracao/conteudo", label: "Conteúdo" },
  { href: "/administracao/site", label: "Site" },
  { href: "/administracao/blog", label: "Blog" },
  { href: "/administracao/cupons", label: "Cupons" },
  { href: "/administracao/auditoria", label: "Auditoria" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    } catch {
      // still leave the panel
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--line)] bg-[#101012]">
      <div className="border-b border-[var(--line)] px-4 py-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Administração</p>
        <p className="mt-1 font-semibold text-[var(--gold)]">JORNADA SAP EWM</p>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {adminLinks.map((l) => {
          const active =
            l.href === "/administracao" ? pathname === "/administracao" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm ${active ? "bg-[rgba(241,201,107,.12)] text-[#f7bd31]" : "text-[#A8A8AF] hover:bg-white/5 hover:text-white"}`}
            >
              {l.label}
            </Link>
          );
        })}
        <Link href="/academia" className="mt-4 rounded-md px-3 py-2 text-sm text-[#A8A8AF] hover:text-white">
          Ir à Academia
        </Link>
        <button
          type="button"
          onClick={() => void onSignOut()}
          disabled={signingOut}
          className="rounded-md px-3 py-2 text-left text-sm text-[#A8A8AF] hover:text-white disabled:opacity-60"
        >
          {signingOut ? "Saindo…" : "Sair"}
        </button>
      </nav>
      <p className="mt-auto px-4 py-4 text-xs text-[#666]">
        v{process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0"} · {process.env.NEXT_PUBLIC_APP_ENV || "dev"}
      </p>
    </aside>
  );
}

export function AdminFooter() {
  return (
    <footer className="border-t border-[#2A2D32] px-6 py-3 text-xs text-[#666]">
      Painel administrativo · {process.env.NEXT_PUBLIC_APP_ENV || "development"}
    </footer>
  );
}
