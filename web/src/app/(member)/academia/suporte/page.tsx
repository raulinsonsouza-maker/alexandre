import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { redirect } from "next/navigation";

async function sendSupport(formData: FormData) {
  "use server";
  const session = await requireSession();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!subject || !message) redirect("/academia/suporte?error=1");
  await writeAudit({
    actorId: session.user.id,
    action: "support.request",
    entityType: "User",
    entityId: session.user.id,
    meta: { subject, message: message.slice(0, 2000) },
  });
  redirect("/academia/suporte?sent=1");
}

export default async function SuportePage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const contact = await prisma.siteSetting.findUnique({ where: { key: "contact_email" } });
  const email = contact?.value || "contato@jornadaewm.com.br";

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold text-white">Suporte</h1>
      <p className="mt-2 text-[#A8A8AF]">
        Abra um chamado. Também pode escrever para{" "}
        <a className="text-[#F1C96B]" href={`mailto:${email}`}>
          {email}
        </a>
        .
      </p>
      {sp.sent && <p className="mt-4 text-sm text-[#F1C96B]">Pedido registrado. Retornaremos em breve.</p>}
      {sp.error && <p className="mt-4 text-sm text-red-400">Preencha assunto e mensagem.</p>}
      <form action={sendSupport} className="mt-8 space-y-4">
        <input className="input" name="subject" placeholder="Assunto" required />
        <textarea className="input min-h-32" name="message" placeholder="Descreva o problema" required />
        <p className="text-xs text-[#A8A8AF]">Logado como {session.user.email}</p>
        <button className="btn" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}
