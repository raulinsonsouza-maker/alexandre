# Alexandre — Jornada SAP EWM

Monorepo da plataforma (Next.js + Prisma + Postgres).

## Produção

- URL: https://alexandre.symbius.com.br
- Deploy: Docker Swarm + Traefik (veja `deploy/stack.yml`)

## Desenvolvimento

```bash
cd web
cp .env.example .env
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Capas em `web/public/media` não vão para o Git (volume/rsync na VPS).
