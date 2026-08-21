import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function sessionCookieName() {
  const url = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "";
  if (url.startsWith("https://") || process.env.NODE_ENV === "production") {
    return "__Secure-authjs.session-token";
  }
  return "authjs.session-token";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAcademia = pathname === "/academia" || pathname.startsWith("/academia/");
  const isAdmin = pathname === "/administracao" || pathname.startsWith("/administracao/");
  const isTrocarSenha = pathname.startsWith("/conta/trocar-senha");

  const res = NextResponse.next();

  if (isAcademia || isAdmin) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (!isAcademia && !isAdmin && !isTrocarSenha) {
    return res;
  }

  const cookieName = sessionCookieName();
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName,
    salt: cookieName,
    secureCookie: cookieName.startsWith("__Secure-"),
  });

  if (!token?.id && !token?.sub) {
    const login = new URL("/conta/entrar", req.url);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (token.mustResetPassword && !isTrocarSenha) {
    return NextResponse.redirect(new URL("/conta/trocar-senha", req.url));
  }

  if (isAdmin && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/academia", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/academia",
    "/academia/:path*",
    "/administracao",
    "/administracao/:path*",
    "/conta/trocar-senha",
    "/conta/trocar-senha/:path*",
  ],
};
