-- CreateTable
CREATE TABLE "BoardProvider" (
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    CONSTRAINT "BoardProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardProvider_userId_key" ON "BoardProvider"("userId");
