import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/conta/entrar", base));
  }

  const form = await req.formData();
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm") || "");
  if (password.length < 6 || password !== confirm) {
    return NextResponse.redirect(new URL("/conta/trocar-senha?error=1", base));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      mustResetPassword: false,
    },
  });

  await signOut({ redirectTo: "/conta/entrar?reset=1" });
}
