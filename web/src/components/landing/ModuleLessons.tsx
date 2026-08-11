"use client";

import { useState } from "react";

type Lesson = { n: number; title: string; description: string };

export function ModuleLessons({ lessons }: { lessons: Lesson[] }) {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="flex flex-col gap-2.5">
      {lessons.map((aula) => {
        const isOpen = open === aula.n;
        return (
          <div key={aula.n} className="overflow-hidden rounded-[10px] border border-white/[0.06] bg-[#121214]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : aula.n)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#17171a]"
            >
              <span className="w-11 shrink-0 text-center font-[family-name:var(--font-display)] text-2xl text-[#3a3a40]">
                {aula.n}
              </span>
              <span className="h-[34px] w-px shrink-0 bg-white/10" />
              <span className="flex-1 font-[family-name:var(--font-display)] text-lg font-semibold text-[#ececec]">
                Aula {aula.n} — {aula.title}
              </span>
              <span className={`shrink-0 text-[#f6b40a] transition ${isOpen ? "rotate-90" : ""}`}>▸</span>
            </button>
            {isOpen && (
              <div className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-[#a8a8a8]">
                {aula.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
