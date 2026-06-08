/*
  Warnings:

  - A unique constraint covering the columns `[friendshipId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "friendshipId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Channel_friendshipId_key" ON "Channel"("friendshipId");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friendship"("id") ON DELETE SET NULL ON UPDATE CASCADE;
