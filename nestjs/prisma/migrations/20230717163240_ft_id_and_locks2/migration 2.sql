/*
  Warnings:

  - The `ft_id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "ft_id",
ADD COLUMN     "ft_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_ft_id_key" ON "User"("ft_id");
