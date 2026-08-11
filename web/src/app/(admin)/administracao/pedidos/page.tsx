import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { markOrderPaidAndEnroll } from "@/lib/payment";
import { revalidatePath } from "next/cache";

async function confirmManual(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  await markOrderPaidAndEnroll({ orderId: id, actorId: session.user.id, gatewayPaymentId: `manual_${id}` });
  revalidatePath("/administracao/pedidos");
}

export default async function PedidosPage() {
  await requireRole(["ADMIN"]);
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Pedidos</h1>
      <div className="panel mt-6 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Total</th>
              <th>Status</th>
              <th>Método</th>
              <th>Itens</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.user.email}</td>
                <td>R$ {(o.totalCents / 100).toFixed(2)}</td>
                <td>{o.status}</td>
                <td>{o.paymentMethod}</td>
                <td className="text-xs text-[#A8A8AF]">{o.items.map((i) => i.title).join(", ")}</td>
                <td>
                  {o.status === "PENDING" && (
                    <form action={confirmManual}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="btn-ghost px-2 py-1 text-xs" type="submit">
                        Confirmar pagamento
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
