-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "serverType" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_ExclusiveGroupUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExclusiveGroupUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExclusiveGroupUsers_B_index" ON "_ExclusiveGroupUsers"("B");

-- AddForeignKey
ALTER TABLE "_ExclusiveGroupUsers" ADD CONSTRAINT "_ExclusiveGroupUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "ServerChannelGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExclusiveGroupUsers" ADD CONSTRAINT "_ExclusiveGroupUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
