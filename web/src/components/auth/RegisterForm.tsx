"use client";

import Link from "next/link";
import { MaskedInput } from "@/components/ui/MaskedInput";

export function RegisterForm({
  action,
  callbackUrl,
  submitLabel = "Criar conta",
}: {
  action: (formData: FormData) => Promise<void>;
  callbackUrl?: string;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="mt-8 space-y-4">
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
      <input className="input" name="name" placeholder="Nome completo" required autoComplete="name" />
      <input className="input" name="email" type="email" placeholder="E-mail" required autoComplete="email" />
      <MaskedInput
        className="input"
        name="phone"
        mask="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
      />
      <input
        className="input"
        name="password"
        type="password"
        placeholder="Senha (mín. 6)"
        required
        minLength={6}
        autoComplete="new-password"
      />
      <label className="flex items-start gap-2 text-sm text-[#A8A8AF]">
        <input type="checkbox" name="lgpd" className="mt-1" required />
        <span>
          Li e aceito os{" "}
          <Link href="/legal/termos" className="text-[#f7bd31]">
            Termos
          </Link>{" "}
          e a{" "}
          <Link href="/legal/privacidade" className="text-[#f7bd31]">
            Privacidade
          </Link>
          .
        </span>
      </label>
      <button className="btn w-full" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
