// Ative observabilidade instalando `@sentry/nextjs` e definindo SENTRY_DSN.
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  console.info("[sentry] SENTRY_DSN definido — instale @sentry/nextjs para enviar eventos");
}
