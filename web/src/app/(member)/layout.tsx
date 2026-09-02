import { requireSession } from "@/lib/session";
import { listAccessibleModules } from "@/lib/access";
import { academyCover } from "@/lib/academy-cover";
import { MemberChrome } from "@/components/shell/MemberShell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const modules = await listAccessibleModules(session.user.id);
  const navModules = modules.map((m) => {
    const resume = m.lessons[0];
    return {
      id: m.id,
      title: m.title,
      category: m.category || m.course.title || "Jornada",
      cover: academyCover(m.code, m.coverPath),
      lessons: m.lessons.length,
      href: resume ? `/academia/aula/${resume.id}` : "/academia",
    };
  });

  return (
    <MemberChrome name={session.user.name} role={session.user.role} modules={navModules}>
      {children}
    </MemberChrome>
  );
}
