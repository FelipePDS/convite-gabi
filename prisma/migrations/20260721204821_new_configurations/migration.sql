/*
  Warnings:

  - You are about to drop the column `purchaseLink` on the `Gift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventSettings" ADD COLUMN     "venueName" TEXT;

-- AlterTable
ALTER TABLE "Gift" DROP COLUMN "purchaseLink",
ADD COLUMN     "price" DOUBLE PRECISION;
