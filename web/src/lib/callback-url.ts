/** Caminho interno relativo seguro para callback após login. */
export function safeCallbackUrl(raw: unknown): string | null {
  const value = String(raw || "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  if (value.includes("://")) return null;
  return value;
}
