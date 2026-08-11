import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { redirect } from "next/navigation";
import Link from "next/link";

async function deleteAccount() {
  "use server";
  const session = await requireSession();
  await writeAudit({
    actorId: session.user.id,
    action: "lgpd.delete_request",
    entityType: "User",
    entityId: session.user.id,
  });
  await prisma.user.delete({ where: { id: session.user.id } });
  redirect("/");
}

export default async function LgpdPage() {
  await requireSession();
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">LGPD</h1>
        <p className="mt-2 text-[#A8A8AF]">
          Exporte ou exclua seus dados pessoais, conforme a{" "}
          <Link href="/legal/privacidade" className="text-[#F1C96B]">
            Política de privacidade
          </Link>
          .
        </p>
      </div>
      <div>
        <a className="btn inline-block" href="/api/lgpd/export">
          Baixar meus dados (JSON)
        </a>
      </div>
      <form action={deleteAccount}>
        <button className="btn-ghost text-red-300" type="submit">
          Excluir minha conta
        </button>
      </form>
    </div>
  );
}
