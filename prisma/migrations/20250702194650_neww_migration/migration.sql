/*
  Warnings:

  - A unique constraint covering the columns `[transactionSignature]` on the table `bets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionSignature` to the `bets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game"."bets" ADD COLUMN     "blockHeight" INTEGER,
ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionSignature" TEXT NOT NULL,
ALTER COLUMN "roundId" DROP NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE BIGINT,
ALTER COLUMN "payout" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "game"."players" ADD COLUMN     "lastSignature" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "totalWinnings" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "bets_transactionSignature_key" ON "game"."bets"("transactionSignature");
