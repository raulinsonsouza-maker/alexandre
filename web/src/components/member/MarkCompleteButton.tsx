"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkCompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(completed);

  async function toggle() {
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: !done }),
    });
    setDone(!done);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      className={`lesson-complete${done ? " is-complete" : ""}`}
      type="button"
      disabled={loading}
      onClick={toggle}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="m4 10 4 4 8-9" />
      </svg>
      <span>{done ? "Concluída" : loading ? "Salvando…" : "Marcar como concluída"}</span>
    </button>
  );
}
