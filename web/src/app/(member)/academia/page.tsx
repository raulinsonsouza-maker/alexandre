import { requireSession } from "@/lib/session";
import { academyCertificateBanner, loadAcademyDashboard } from "@/lib/academy-dashboard";
import { AcademyHome } from "@/components/member/AcademyHome";
import { AcademyHashScroll } from "@/components/member/AcademyHashScroll";

export default async function AcademiaPage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const data = await loadAcademyDashboard(session.user.id);
  const incompleteCount = data.cards.filter((c) => c.progress < 100).length;

  return (
    <>
      <AcademyHashScroll />
      <AcademyHome
        name={session.user.name}
        purchased={Boolean(sp.purchased)}
        hero={
          data.heroSource && data.heroModule
            ? {
                title: data.heroSource.title,
                description:
                  data.heroModule.description || "Retome seus estudos e avance na jornada SAP EWM.",
                cover: data.heroSource.cover,
                category: data.heroSource.category,
                lessons: data.heroSource.lessons,
                progress: data.heroSource.progress,
                resumeHref: data.heroSource.href === "/academia" ? null : data.heroSource.href,
                resumeLabel:
                  data.heroSource.progress > 0
                    ? `Continuar · ${data.heroSource.resumeLessonTitle}`
                    : "Começar agora",
                detailsHref: data.heroSource.href,
                eyebrow: data.heroSource.progress > 0 ? "Continue assistindo" : "Comece por aqui",
              }
            : null
        }
        summary={data.summary}
        rails={data.rails}
        certificate={academyCertificateBanner(data.certCount, incompleteCount)}
      />
    </>
  );
}
