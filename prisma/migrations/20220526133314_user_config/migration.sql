-- CreateTable
CREATE TABLE "UserConfig" (
    "userId" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    CONSTRAINT "UserConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_userId_key" ON "UserConfig"("userId");
