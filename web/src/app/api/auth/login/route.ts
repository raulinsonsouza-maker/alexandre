import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { encode } from "@auth/core/jwt";
import { prisma } from "@/lib/prisma";
import { safeCallbackUrl } from "@/lib/callback-url";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function homeForRole(role: string, mustResetPassword: boolean) {
  if (mustResetPassword) return "/conta/trocar-senha";
  if (role === "ADMIN") return "/administracao";
  return "/academia";
}

async function readCredentials(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return {
      email: String(body.email || "")
        .trim()
        .toLowerCase(),
      password: String(body.password || ""),
      callbackUrl: String(body.callbackUrl || ""),
    };
  }
  const form = await req.formData();
  return {
    email: String(form.get("email") || "")
      .trim()
      .toLowerCase(),
    password: String(form.get("password") || ""),
    callbackUrl: String(form.get("callbackUrl") || ""),
  };
}

function sessionCookieName(secure: boolean) {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

/** Login unificado: grava sessão e devolve destino por papel (ADMIN → admin, aluno → academia). */
export async function POST(req: Request) {
  const { email, password, callbackUrl } = await readCredentials(req);
  const wantsJson = (req.headers.get("accept") || "").includes("application/json")
    || (req.headers.get("content-type") || "").includes("application/json");
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;

  if (!email || !password) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
    return NextResponse.redirect(new URL("/conta/entrar?error=1", base), 303);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.active) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
    return NextResponse.redirect(new URL("/conta/entrar?error=1", base), 303);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
    return NextResponse.redirect(new URL("/conta/entrar?error=1", base), 303);
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
    return NextResponse.redirect(new URL("/conta/entrar?error=1", base), 303);
  }

  const secure = base.startsWith("https://");
  const cookieName = sessionCookieName(secure);
  const token = await encode({
    token: {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustResetPassword: user.mustResetPassword,
    },
    secret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE,
  });

  const dest =
    user.mustResetPassword
      ? "/conta/trocar-senha"
      : user.role === "ADMIN"
        ? "/administracao"
        : safeCallbackUrl(callbackUrl) || homeForRole(user.role, user.mustResetPassword);
  const res = wantsJson
    ? NextResponse.json({ ok: true, redirect: dest, role: user.role })
    : NextResponse.redirect(new URL(dest, base), 303);

  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE,
  });

  return res;
}
