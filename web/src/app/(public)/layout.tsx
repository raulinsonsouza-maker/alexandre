import { auth } from "@/lib/auth";
import { PublicFooter, PublicHeader } from "@/components/shell/PublicShell";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader signedIn={Boolean(session?.user)} isAdmin={session?.user?.role === "ADMIN"} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
