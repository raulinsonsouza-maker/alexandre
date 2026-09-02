import { requireSession } from "@/lib/session";
import { loadAcademyDashboard } from "@/lib/academy-dashboard";
import { AcademyEmptyState, AcademyJourneyView } from "@/components/member/AcademySections";

export default async function JornadaPage() {
  const session = await requireSession();
  const data = await loadAcademyDashboard(session.user.id);

  if (!data.cards.length) {
    return <AcademyEmptyState name={session.user.name} />;
  }

  return (
    <AcademyJourneyView
      summary={data.summary}
      inProgress={data.inProgress}
      notStarted={data.notStarted}
      completed={data.completed}
    />
  );
}
