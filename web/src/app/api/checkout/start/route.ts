import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckout } from "@/lib/payment";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const planSlug = String(body.planSlug || "").trim();
  if (!planSlug) {
    return NextResponse.json({ ok: false, error: "plan" }, { status: 400 });
  }
  if (planSlug === "corporate") {
    return NextResponse.json({ ok: false, error: "corporate" }, { status: 400 });
  }

  try {
    const result = await createCheckout({ userId: session.user.id, planSlug });
    return NextResponse.json({ ok: true, url: result.redirectUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro no checkout";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
