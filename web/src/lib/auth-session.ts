import { encode } from "@auth/core/jwt";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export function sessionCookieName(secure: boolean) {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

export async function jsonWithSession(params: {
  req: Request;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    mustResetPassword: boolean;
  };
  body: Record<string, unknown>;
}) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || new URL(params.req.url).origin;
  const secure = base.startsWith("https://");
  const cookieName = sessionCookieName(secure);
  const token = await encode({
    token: {
      id: params.user.id,
      sub: params.user.id,
      email: params.user.email,
      name: params.user.name,
      role: params.user.role,
      mustResetPassword: params.user.mustResetPassword,
    },
    secret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE,
  });
  const res = NextResponse.json(params.body);
  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
