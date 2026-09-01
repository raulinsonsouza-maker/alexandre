# Jornada SAP EWM — App web (MVP)

Next.js + **PostgreSQL** + NextAuth + Prisma. Foco: admin, CMS de aulas, área de membros. CRM adiado.

## Pré-requisitos

- Node 20+
- PostgreSQL (neste ambiente local: PG 17 na porta **5433**)

## Setup

```bash
cd web
cp .env.example .env
# Ajuste DATABASE_URL se a porta for outra (ex.: 5432)
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abra http://localhost:3000

### Credenciais seed

| Papel | E-mail | Senha |
|---|---|---|
| Admin | admin@jornadaewm.com.br | Admin@2026 |
| Aluno | aluno@jornadaewm.com.br | Aluno@123 |

## O que está pronto

- Auth (login, cadastro, reset de senha)
- Shells padronizados: público / membro / admin (menu + footer)
- Admin: usuários, matrículas, pedidos, conteúdo, cupons, auditoria
- CMS: criar módulos/aulas, publicar, upload de vídeo e materiais
- Campus + player + progresso + certificado simples
- Checkout transparente Mercado Pago (Pix, cartão, boleto) + webhook `/api/webhooks/mercadopago`
- Checkout Cakto permanece como rollback (`PAYMENT_PROVIDER=cakto`)
- LGPD export/delete, e-mail em modo log (Resend opcional), Sentry opcional, CI

## Postgres local

```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/jornada_ewm?schema=public"
```

## Pagamento real

Defina `PAYMENT_PROVIDER=pagarme` e as chaves; o webhook processa eventos idempotentes.
