CREATE TABLE "GiftPurchase" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "invitationCode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftPurchase_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GiftPurchase_giftId_createdAt_idx" ON "GiftPurchase"("giftId", "createdAt");
CREATE INDEX "GiftPurchase_guestId_createdAt_idx" ON "GiftPurchase"("guestId", "createdAt");

ALTER TABLE "GiftPurchase"
ADD CONSTRAINT "GiftPurchase_giftId_fkey"
FOREIGN KEY ("giftId") REFERENCES "Gift"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GiftPurchase"
ADD CONSTRAINT "GiftPurchase_guestId_fkey"
FOREIGN KEY ("guestId") REFERENCES "Guest"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
