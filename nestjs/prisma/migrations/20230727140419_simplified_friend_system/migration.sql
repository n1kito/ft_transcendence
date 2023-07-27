/*
  Warnings:

  - You are about to drop the column `isDefaultFriend` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `FriendRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_toUserId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isDefaultFriend",
ADD COLUMN     "isDefaultProfile" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "FriendRequest";
