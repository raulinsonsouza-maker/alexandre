import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAcademia = pathname.startsWith("/academia");
  const isAdmin = pathname.startsWith("/administracao");
  const isTrocarSenha = pathname.startsWith("/conta/trocar-senha");

  const res = NextResponse.next();

  if (isAcademia || isAdmin) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (!isAcademia && !isAdmin && !isTrocarSenha) {
    return res;
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.id) {
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
  matcher: ["/academia/:path*", "/administracao/:path*", "/conta/trocar-senha"],
};
