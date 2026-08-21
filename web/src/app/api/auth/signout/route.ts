import { NextResponse } from "next/server";

const SESSION_MAX_AGE_CLEAR = 0;

function sessionCookieName(secure: boolean) {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

/** Só POST — GET com Link prefetch do Next deslogava ao abrir o painel. */
export async function POST(req: Request) {
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;
  const secure = base.startsWith("https://");
  const cookieName = sessionCookieName(secure);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE_CLEAR,
  });
  // limpa também o nome sem prefixo, se existir de sessões antigas
  res.cookies.set("authjs.session-token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    maxAge: SESSION_MAX_AGE_CLEAR,
  });
  return res;
}

export async function GET(req: Request) {
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;
  return NextResponse.redirect(new URL("/", base));
}
