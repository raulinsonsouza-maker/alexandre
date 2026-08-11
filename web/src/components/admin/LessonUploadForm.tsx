"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonUploadForm({
  lessonId,
  moduleId,
  currentVideoUrl,
  currentVideoPath,
}: {
  lessonId: string;
  moduleId: string;
  currentVideoUrl?: string | null;
  currentVideoPath?: string | null;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("lessonId", lessonId);
    fd.set("type", "lesson");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Falha no upload");
      return;
    }
    setMsg("Mídia atualizada");
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t border-[#2A2D32] pt-3">
      <input type="hidden" name="moduleId" value={moduleId} />
      {(currentVideoUrl || currentVideoPath) && (
        <p className="text-xs text-[#A8A8AF]">
          Atual:{" "}
          {currentVideoUrl
            ? `URL ${currentVideoUrl}`
            : `arquivo /uploads/${currentVideoPath}`}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs text-[#A8A8AF]">Link do vídeo (YouTube, Vimeo, Bunny, MP4…)</label>
        <input
          className="input"
          name="videoUrl"
          type="url"
          placeholder="https://..."
          defaultValue={currentVideoUrl || ""}
        />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Ou upload de arquivo de vídeo</label>
          <input className="input" type="file" name="video" accept="video/*,.mp4,.webm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Material (PDF etc.)</label>
          <input className="input" type="file" name="material" />
        </div>
      </div>
      <input className="input" name="materialTitle" placeholder="Título do material (opcional)" />
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Salvar mídia / material"}
      </button>
      {msg && <p className="text-sm text-[#F1C96B]">{msg}</p>}
    </form>
  );
}
