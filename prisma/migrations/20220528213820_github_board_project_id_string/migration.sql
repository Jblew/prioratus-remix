-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GithubBoardConfig" (
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "GithubBoardConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GithubBoardConfig" ("projectId", "userId") SELECT "projectId", "userId" FROM "GithubBoardConfig";
DROP TABLE "GithubBoardConfig";
ALTER TABLE "new_GithubBoardConfig" RENAME TO "GithubBoardConfig";
CREATE UNIQUE INDEX "GithubBoardConfig_userId_key" ON "GithubBoardConfig"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
