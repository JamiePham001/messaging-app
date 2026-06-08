/*
  Warnings:

  - You are about to drop the column `userId` on the `ServerRoles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serverId]` on the table `ServerRoles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ServerRoles" DROP CONSTRAINT "ServerRoles_userId_fkey";

-- DropIndex
DROP INDEX "ServerRoles_serverId_userId_key";

-- AlterTable
ALTER TABLE "ServerRoles" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_ServerRolesChannels" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServerRolesChannels_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ServerRolesUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServerRolesUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ServerRolesGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServerRolesGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServerRolesChannels_B_index" ON "_ServerRolesChannels"("B");

-- CreateIndex
CREATE INDEX "_ServerRolesUsers_B_index" ON "_ServerRolesUsers"("B");

-- CreateIndex
CREATE INDEX "_ServerRolesGroups_B_index" ON "_ServerRolesGroups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ServerRoles_serverId_key" ON "ServerRoles"("serverId");

-- AddForeignKey
ALTER TABLE "_ServerRolesChannels" ADD CONSTRAINT "_ServerRolesChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerRolesChannels" ADD CONSTRAINT "_ServerRolesChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "ServerRoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerRolesUsers" ADD CONSTRAINT "_ServerRolesUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "ServerRoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerRolesUsers" ADD CONSTRAINT "_ServerRolesUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerRolesGroups" ADD CONSTRAINT "_ServerRolesGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "ServerChannelGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerRolesGroups" ADD CONSTRAINT "_ServerRolesGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "ServerRoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
