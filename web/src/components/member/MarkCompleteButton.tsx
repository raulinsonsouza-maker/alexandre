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
    <button className="btn" type="button" disabled={loading} onClick={toggle}>
      {done ? "Aula concluída ✓" : "Marcar como concluída"}
    </button>
  );
}
