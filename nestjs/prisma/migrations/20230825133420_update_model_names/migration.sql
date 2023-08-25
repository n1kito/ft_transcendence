/*
  Warnings:

  - You are about to drop the column `bestFriendLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_bestFriendLogin_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bestFriendLogin";

-- DropTable
DROP TABLE "Player";

-- CreateTable
CREATE TABLE "gameSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL,

    CONSTRAINT "gameSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gameSession" ADD CONSTRAINT "gameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gameSession" ADD CONSTRAINT "gameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
