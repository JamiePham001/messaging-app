/*
  Warnings:

  - You are about to drop the column `friendshipId` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `channelId` on the `Friendship` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_friendshipId_fkey";

-- DropIndex
DROP INDEX "Channel_friendshipId_key";

-- DropIndex
DROP INDEX "Friendship_addresseeId_key";

-- DropIndex
DROP INDEX "Friendship_requesterId_key";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "friendshipId",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "channelId";

-- CreateTable
CREATE TABLE "_ChannelUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChannelUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChannelUsers_B_index" ON "_ChannelUsers"("B");

-- AddForeignKey
ALTER TABLE "_ChannelUsers" ADD CONSTRAINT "_ChannelUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelUsers" ADD CONSTRAINT "_ChannelUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
