/*
  Warnings:

  - You are about to drop the column `player1Id` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `player2Id` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `winnerId` on the `Game` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_winnerId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "player1Id",
DROP COLUMN "player2Id",
DROP COLUMN "winnerId";

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
