import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      mustResetPassword?: boolean;
    };
  }
  interface User {
    role: Role;
    mustResetPassword?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    mustResetPassword?: boolean;
  }
}

const useSecureCookies =
  (process.env.AUTH_URL || process.env.NEXTAUTH_URL || "").startsWith("https://") ||
  process.env.NODE_ENV === "production";

const sessionTokenCookie = useSecureCookies
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/conta/entrar",
  },
  cookies: {
    sessionToken: {
      name: sessionTokenCookie,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustResetPassword: user.mustResetPassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.mustResetPassword = Boolean(user.mustResetPassword);
        return token;
      }
      if (trigger === "update" && session?.mustResetPassword === false) {
        token.mustResetPassword = false;
      }
      // Tokens do /api/auth/login já trazem id/role — não consultar DB a cada request
      // (evita cair no login quando o Postgres reseta conexão ociosa).
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || "");
        session.user.role = token.role as Role;
        session.user.mustResetPassword = Boolean(token.mustResetPassword);
      }
      return session;
    },
  },
});
