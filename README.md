# Alexandre — Jornada SAP EWM

Monorepo da plataforma (Next.js + Prisma + Postgres).

## Produção

| Ambiente | URL | VPS |
|----------|-----|-----|
| Best One (principal) | https://bestoneacademy.com.br | `root@158.173.2.125` |
| Symbius (legado) | https://alexandre.symbius.com.br | `root@5.75.172.83` |

Deploy: Docker Swarm + Traefik (`deploy/stack.yml`). Secrets em `/opt/apps/alexandre/.env` na VPS.

### Bestone (Easypanel)

```bash
cd /opt/apps/alexandre
cp deploy/.env.bestone.example .env   # editar secrets
./deploy/bootstrap-bestone.sh
```

Traefik usa rede `easypanel`, entrypoints `http`/`https`, resolver `letsencrypt`.

### Hetzner (Symbius)

```bash
cd /opt/apps/alexandre
set -a && source .env && set +a
docker build -t alexandre-web:latest -f web/Dockerfile .
./deploy/remote-up.sh
```

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

Pagamento em produção: Checkout Transparente Mercado Pago (`PAYMENT_PROVIDER=mercadopago`). Webhook: `https://bestoneacademy.com.br/api/webhooks/mercadopago`. Cakto fica no código só para rollback.
