-- CreateTable
CREATE TABLE "GithubAccess" (
    "userId" TEXT NOT NULL,
    CONSTRAINT "GithubAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubAccess_userId_key" ON "GithubAccess"("userId");
