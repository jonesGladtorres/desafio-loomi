/*
  Warnings:

  - You are about to drop the column `userId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropIndex
DROP INDEX "public"."transactions_userId_idx";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "userId",
ADD COLUMN     "receiver_user_id" TEXT,
ADD COLUMN     "sender_user_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "bank_account_digit" TEXT,
ADD COLUMN     "bank_agency" TEXT,
ADD COLUMN     "profile_picture" TEXT;

-- CreateIndex
CREATE INDEX "transactions_sender_user_id_idx" ON "transactions"("sender_user_id");

-- CreateIndex
CREATE INDEX "transactions_receiver_user_id_idx" ON "transactions"("receiver_user_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiver_user_id_fkey" FOREIGN KEY ("receiver_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
