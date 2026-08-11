import { requireSession } from "@/lib/session";
import { MemberFooter, MemberNav } from "@/components/shell/MemberShell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <MemberNav name={session.user.name} />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        <MemberFooter />
      </div>
    </div>
  );
}
