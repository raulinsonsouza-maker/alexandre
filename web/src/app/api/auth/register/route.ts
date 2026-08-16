import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";
import { jsonWithSession } from "@/lib/auth-session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");
  const lgpd = Boolean(body.lgpd);

  if (!name || !email || password.length < 6 || !lgpd) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ ok: false, error: "exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      emailVerified: new Date(),
      consents: {
        create: [{ type: "terms_privacy", version: "2026-01", accepted: true }],
      },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "user.register",
    entityType: "User",
    entityId: user.id,
  });

  await sendEmail({
    to: email,
    subject: "Bem-vindo à Jornada SAP EWM",
    html: welcomeEmailHtml(name),
  });

  return jsonWithSession({
    req,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustResetPassword: user.mustResetPassword,
    },
    body: { ok: true },
  });
}
