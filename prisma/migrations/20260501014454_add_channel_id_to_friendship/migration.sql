/*
  Warnings:

  - You are about to drop the column `friendshipId` on the `Channel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_friendshipId_fkey";

-- DropIndex
DROP INDEX "Channel_friendshipId_key";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "friendshipId";

-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "channelId" TEXT;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
