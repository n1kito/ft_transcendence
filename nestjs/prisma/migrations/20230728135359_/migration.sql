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
    "refresh_token" TEXT,
    "login_is_locked" BOOLEAN NOT NULL DEFAULT false,
    "email_is_locked" BOOLEAN NOT NULL DEFAULT false,
    "image_is_locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_ft_id_key" ON "User"("ft_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
