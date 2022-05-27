/*
  Warnings:

  - You are about to drop the `BoardProvider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BoardProvider";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GithubBoardConfig" (
    "userId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "GithubBoardConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubBoardConfig_userId_key" ON "GithubBoardConfig"("userId");
