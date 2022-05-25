-- CreateTable
CREATE TABLE "GithubOAuthState" (
    "userId" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    CONSTRAINT "GithubOAuthState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubOAuthState_userId_key" ON "GithubOAuthState"("userId");
