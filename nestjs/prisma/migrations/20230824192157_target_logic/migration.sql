-- AlterTable
ALTER TABLE "User" ADD COLUMN     "targetId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
