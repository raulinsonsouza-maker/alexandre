import fs from "fs";
import path from "path";

/** Mapeia código do módulo (M00) para capa em /media */
export function moduleCoverUrl(code: string): string | null {
  const num = code.replace(/^M/i, "").padStart(2, "0");
  const mediaDir = path.join(process.cwd(), "public", "media");
  if (!fs.existsSync(mediaDir)) return null;

  const files = fs.readdirSync(mediaDir);
  const match = files.find((f) => f.startsWith(`${num} - `) && /\.(png|jpe?g|webp)$/i.test(f));
  if (!match) return null;
  return `/media/${encodeURIComponent(match)}`;
}
