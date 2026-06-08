/*
  Warnings:

  - You are about to drop the column `serverId` on the `Channel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_serverId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "serverId",
ADD COLUMN     "SCGId" TEXT;

-- CreateTable
CREATE TABLE "ServerChannelGroup" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerChannelGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_SCGId_fkey" FOREIGN KEY ("SCGId") REFERENCES "ServerChannelGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerChannelGroup" ADD CONSTRAINT "ServerChannelGroup_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
