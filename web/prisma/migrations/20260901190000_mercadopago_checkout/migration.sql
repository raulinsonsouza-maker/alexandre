-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'BOLETO';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "gatewayPayload" JSONB;
