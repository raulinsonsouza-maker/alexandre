"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModuleCoverUpload({
  moduleId,
  currentCover,
}: {
  moduleId: string;
  currentCover: string | null;
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
    fd.set("type", "cover");
    fd.set("moduleId", moduleId);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Falha no upload");
      return;
    }
    setMsg("Capa atualizada");
    form.reset();
    router.refresh();
  }

  return (
    <div className="space-y-3 border-t border-white/10 pt-3">
      {currentCover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentCover}
          alt="Capa atual"
          className="h-28 w-48 rounded-md border border-white/10 object-cover"
        />
      )}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-[#A8A8AF]">Upload de capa</label>
          <input className="input" type="file" name="cover" accept="image/*" required />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar capa"}
        </button>
      </form>
      {msg && <p className="text-sm text-[#F1C96B]">{msg}</p>}
    </div>
  );
}
