# Build context: repository root (contains web/ + content/)
# docker build -t alexandre-web:latest -f web/Dockerfile .

FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY web/package.json web/package-lock.json ./
COPY web/prisma ./prisma
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY web/ ./
COPY content /content
ENV CONTENT_PATH=/content/aulas-conteudo.json
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy env so Next build can evaluate config
ENV AUTH_SECRET=build-time-placeholder
ENV NEXTAUTH_URL=http://localhost:3000
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV CONTENT_PATH=/content/aulas-conteudo.json

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /content /content
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Tools for migrate/seed one-shots (prisma + tsx)
RUN npm install --omit=dev prisma@6.19.3 tsx@4.23.11 @prisma/client@6.19.3 \
  && npx prisma generate \
  && mkdir -p /app/public/media /app/public/uploads \
  && chown -R nextjs:nodejs /app/public /app/node_modules /app/prisma /app/src || true

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=20s --timeout=5s --start-period=40s --retries=5 \
  CMD curl -fsS http://127.0.0.1:3000/conta/entrar >/dev/null || exit 1

CMD ["node", "server.js"]
