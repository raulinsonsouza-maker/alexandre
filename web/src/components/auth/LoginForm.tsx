"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: String(fd.get("email") || ""),
          password: String(fd.get("password") || ""),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.redirect) {
        setError(true);
        setLoading(false);
        return;
      }
      router.replace(data.redirect);
      router.refresh();
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {error && <p className="text-sm text-red-400">E-mail ou senha inválidos.</p>}
      <div>
        <label className="mb-1 block text-sm text-[#A8A8AF]">E-mail</label>
        <input className="input" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[#A8A8AF]">Senha</label>
        <input className="input" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn w-full" type="submit" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
