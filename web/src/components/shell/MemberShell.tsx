"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const memberLinks = [
  { href: "/academia", label: "Início" },
  { href: "/academia/perfil", label: "Meu perfil" },
  { href: "/academia/certificados", label: "Certificados" },
  { href: "/academia/suporte", label: "Suporte" },
  { href: "/academia/lgpd", label: "LGPD" },
];

export function MemberNav({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-[#2A2D32] bg-[#17151A] md:flex md:flex-col">
        <div className="border-b border-[#2A2D32] px-4 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#A8A8AF]">Academia</p>
          <p className="mt-1 font-semibold text-[#F1C96B]">JORNADA SAP EWM</p>
          <p className="mt-3 truncate text-sm text-white">{name}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {memberLinks.map((l) => {
            const active = pathname === l.href || (l.href !== "/academia" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-2 text-sm ${active ? "bg-[rgba(241,201,107,.12)] text-[#F1C96B]" : "text-[#A8A8AF] hover:bg-white/5 hover:text-white"}`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/api/auth/signout" className="mt-auto rounded-md px-3 py-2 text-sm text-[#A8A8AF] hover:text-white">
            Sair
          </Link>
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#2A2D32] bg-[#17151A] md:hidden">
        {memberLinks.slice(0, 4).map((l) => {
          const active = pathname === l.href || (l.href !== "/academia" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex-1 py-3 text-center text-xs ${active ? "text-[#F1C96B]" : "text-[#A8A8AF]"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function MemberFooter() {
  return (
    <footer className="mt-auto border-t border-[#2A2D32] pb-20 md:pb-0">
      <div className="flex flex-wrap gap-4 px-4 py-6 text-sm text-[#A8A8AF]">
        <Link href="/academia/suporte" className="hover:text-[#F1C96B]">
          Suporte
        </Link>
        <Link href="/legal/termos" className="hover:text-[#F1C96B]">
          Termos
        </Link>
        <Link href="/legal/privacidade" className="hover:text-[#F1C96B]">
          Privacidade
        </Link>
      </div>
    </footer>
  );
}
