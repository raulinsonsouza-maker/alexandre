import { NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

function safeCallbackUrl(raw: string | null | undefined) {
  if (!raw) return "/academia";
  const url = raw.trim();
  if (!url.startsWith("/") || url.startsWith("//")) return "/academia";
  if (url.startsWith("/conta/entrar") || url.startsWith("/api/")) return "/academia";
  return url;
}

/** Login via POST clássico (evita Server Actions quebrados atrás de Cloudflare/Traefik). */
export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");
  const callbackUrl = safeCallbackUrl(String(form.get("callbackUrl") || ""));
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.redirect(
        new URL(`/conta/entrar?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`, base),
      );
    }
    // NEXT_REDIRECT do Auth.js
    throw err;
  }

  return NextResponse.redirect(new URL(callbackUrl, base));
}
