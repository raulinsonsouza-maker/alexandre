"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function CourseRail({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [leftDisabled, setLeftDisabled] = useState(true);
  const [rightDisabled, setRightDisabled] = useState(false);
  const key = title.toLowerCase().replace(/\s+/g, "-");

  function update() {
    const rail = railRef.current;
    if (!rail) return;
    setLeftDisabled(rail.scrollLeft < 8);
    setRightDisabled(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8);
  }

  useEffect(() => {
    update();
    const rail = railRef.current;
    if (!rail) return;
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [children]);

  function scroll(dir: "left" | "right") {
    const rail = railRef.current;
    if (!rail) return;
    const amount = Math.max(rail.clientWidth * 0.78, 300);
    rail.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section className="rail-section" aria-labelledby={`rail-${key}-title`}>
      <div className="rail-heading">
        <div>
          <h2 id={`rail-${key}-title`}>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="rail-controls" aria-label={`Navegar por ${title}`}>
          <button type="button" onClick={() => scroll("left")} aria-label="Ver anteriores" disabled={leftDisabled}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m12 4-6 6 6 6" />
            </svg>
          </button>
          <button type="button" onClick={() => scroll("right")} aria-label="Ver próximos" disabled={rightDisabled}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m8 4 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="course-rail" data-course-rail ref={railRef} onScroll={update}>
        {children}
      </div>
    </section>
  );
}
