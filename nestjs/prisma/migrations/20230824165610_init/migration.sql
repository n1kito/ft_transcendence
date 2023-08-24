-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "ft_id" INTEGER,
    "hash" TEXT,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT,
    "isDefaultProfile" BOOLEAN NOT NULL DEFAULT false,
    "login_is_locked" BOOLEAN NOT NULL DEFAULT false,
    "email_is_locked" BOOLEAN NOT NULL DEFAULT false,
    "image_is_locked" BOOLEAN NOT NULL DEFAULT false,
    "bestFriendLogin" TEXT,
    "killCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Friendship" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_ft_id_key" ON "User"("ft_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_Friendship_AB_unique" ON "_Friendship"("A", "B");

-- CreateIndex
CREATE INDEX "_Friendship_B_index" ON "_Friendship"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bestFriendLogin_fkey" FOREIGN KEY ("bestFriendLogin") REFERENCES "User"("login") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friendship" ADD CONSTRAINT "_Friendship_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friendship" ADD CONSTRAINT "_Friendship_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
