import { moduleCoverUrl } from "@/lib/media";

export function academyCover(code: string, coverPath: string | null | undefined): string {
  if (coverPath) return coverPath;
  return moduleCoverUrl(code) || "/brand/gold-badge.png";
}
