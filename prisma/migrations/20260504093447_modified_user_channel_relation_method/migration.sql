/*
  Warnings:

  - You are about to drop the column `channelId` on the `Friendship` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_channelId_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "GroupChat" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "channelId";
