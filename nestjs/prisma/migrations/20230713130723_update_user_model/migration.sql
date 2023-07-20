/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[login]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `login` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "login" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
