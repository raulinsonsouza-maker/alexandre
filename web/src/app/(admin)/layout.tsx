import { requireRole } from "@/lib/session";
import { AdminFooter, AdminNav } from "@/components/shell/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN"]);
  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <AdminNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-6 py-6">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
