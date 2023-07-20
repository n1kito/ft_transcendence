/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[ft_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "email_is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstName_is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ft_id" TEXT,
ADD COLUMN     "image_is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName_is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "token" TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_ft_id_key" ON "User"("ft_id");
