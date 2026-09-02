export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function lessonGroup(index: number, total: number) {
  if (index < 3) return "Comece aqui";
  if (index < Math.ceil(total * 0.7)) return "Conteúdo principal";
  return "Aplicação prática";
}

export function formatLessonMinutes(durationSec?: number | null) {
  if (!durationSec || durationSec <= 0) return null;
  const minutes = Math.max(1, Math.round(durationSec / 60));
  return `${minutes} min`;
}

export function formatHoursMinutes(totalSec: number) {
  const minutes = Math.round(totalSec / 60);
  if (minutes < 60) return `${minutes}min`;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}
