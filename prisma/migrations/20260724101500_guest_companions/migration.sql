ALTER TABLE "Guest"
ADD COLUMN "primaryGuestId" TEXT;

CREATE INDEX "Guest_primaryGuestId_createdAt_idx"
ON "Guest"("primaryGuestId", "createdAt");

ALTER TABLE "Guest"
ADD CONSTRAINT "Guest_primaryGuestId_fkey"
FOREIGN KEY ("primaryGuestId")
REFERENCES "Guest"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
