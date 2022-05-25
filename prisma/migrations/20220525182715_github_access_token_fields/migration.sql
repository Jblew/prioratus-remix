/*
  Warnings:

  - Added the required column `accessToken` to the `GithubAccess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessTokenExpiresAt` to the `GithubAccess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `GithubAccess` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GithubAccess" (
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessTokenExpiresAt" DATETIME NOT NULL,
    CONSTRAINT "GithubAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GithubAccess" ("userId") SELECT "userId" FROM "GithubAccess";
DROP TABLE "GithubAccess";
ALTER TABLE "new_GithubAccess" RENAME TO "GithubAccess";
CREATE UNIQUE INDEX "GithubAccess_userId_key" ON "GithubAccess"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
