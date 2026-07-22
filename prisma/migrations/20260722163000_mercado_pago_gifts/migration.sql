CREATE TYPE "GiftPurchaseStatus" AS ENUM (
    'PENDING',
    'IN_PROCESS',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'REFUNDED'
);

ALTER TABLE "GiftPurchase"
ADD COLUMN "status" "GiftPurchaseStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "provider" TEXT,
ADD COLUMN "externalReference" TEXT,
ADD COLUMN "providerPaymentId" TEXT,
ADD COLUMN "paymentMethodId" TEXT,
ADD COLUMN "paymentTypeId" TEXT,
ADD COLUMN "statusDetail" TEXT,
ADD COLUMN "qrCode" TEXT,
ADD COLUMN "qrCodeBase64" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "lastWebhookAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "GiftPurchase"
SET
    "status" = 'APPROVED',
    "provider" = 'manual_pix',
    "paidAt" = "createdAt",
    "updatedAt" = "createdAt";

CREATE UNIQUE INDEX "GiftPurchase_externalReference_key" ON "GiftPurchase"("externalReference");
CREATE UNIQUE INDEX "GiftPurchase_providerPaymentId_key" ON "GiftPurchase"("providerPaymentId");
CREATE INDEX "GiftPurchase_status_createdAt_idx" ON "GiftPurchase"("status", "createdAt");
