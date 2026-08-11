import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: true,
      orders: { include: { items: true } },
      progress: true,
      certificates: true,
      consents: true,
    },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "lgpd.export",
    entityType: "User",
    entityId: session.user.id,
  });

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lgpd-export-${session.user.id}.json"`,
    },
  });
}
