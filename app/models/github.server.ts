import type { User, GithubAccess } from "@prisma/client"
import { randomUUID } from "crypto"

import { prisma } from "~/db.server"
import { envMust } from "~/utils"

export type { GithubAccess } from "@prisma/client"

const githubAuthorizeURL = "https://github.com/login/oauth/authorize"
const githubAccessTokenURL = "https://github.com/login/oauth/access_token"
const GITHUB_CLIENT_ID = envMust("GITHUB_CLIENT_ID")
const GITHUB_CLIENT_SECRET = envMust("GITHUB_CLIENT_SECRET")
const GITHUB_OAUTH_CALLBACK_URL = envMust("GITHUB_OAUTH_CALLBACK_URL")

export async function generateGithubAuthorizeURLWithState(userId: User["id"]) {
    const stateCode = randomUUID()
    await prisma.githubOAuthState.upsert({
        where: { userId },
        update: { stateCode },
        create: { userId, stateCode }
    })
    return `${githubAuthorizeURL}`
        + `?client_id=${GITHUB_CLIENT_ID}`
        + `&redirect_uri=${GITHUB_OAUTH_CALLBACK_URL}`
        + `&state=${stateCode}`
}

export async function getGithubAccessToken(userId: User["id"]) {
    const githubAccess = await prisma.githubAccess.findFirst({ where: { userId } })
    if (!githubAccess) { throw new Error("User does not have github access record") }
    if (Date.now() > githubAccess.accessTokenExpiresAt.getTime()) {
        const refreshedResp = await refreshGithubAccessToken(userId, {})
        await storeGithubTokens(userId, refreshedResp)
        return refreshedResp.access_token
    }
    return githubAccess.accessToken
}

export async function storeGithubAccess(userId: User["id"], { code }: { code: string }) {
    const refreshedResp = await refreshGithubAccessToken(userId, { code })
    await storeGithubTokens(userId, refreshedResp)
}

interface GithubTokensResponse {
    access_token: string
    expires_in: number
    refresh_token: string
    refresh_token_expires_in: number
    scope: string
    token_type: string
}
async function refreshGithubAccessToken(userId: User["id"], reqOpts: { code: string } | {}): Promise<GithubTokensResponse> {
    const requestBody = "code" in reqOpts
        ? accessTokenRequestBodyForCode(userId, reqOpts)
        : accessTokenRequestBodyForRefresh(userId)
    const resp = await fetch(githubAccessTokenURL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    })
    return resp.json()
}

async function accessTokenRequestBodyForCode(userId: User["id"], { code }: { code: string }) {
    const oauthState = await prisma.githubOAuthState.findFirst({ where: { userId } })
    if (!oauthState) { throw new Error("Cannot request github access token without state code") }
    return {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        state: oauthState.stateCode
    }
}

async function accessTokenRequestBodyForRefresh(userId: User["id"]) {
    const githubAccess = await prisma.githubAccess.findFirst({ where: { userId } })
    if (!githubAccess) { throw new Error("Cannot refresh github access token without github access record") }
    return {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: githubAccess.refreshToken
    }
}

function storeGithubTokens(
    userId: User["id"],
    { access_token, expires_in, refresh_token }: GithubTokensResponse
) {
    const accessTokenExpiresAt = new Date(Date.now() + expires_in * 1000)
    return prisma.githubAccess.upsert({
        where: {
            userId,
        },
        update: {
            accessToken: access_token,
            accessTokenExpiresAt,
            refreshToken: refresh_token
        },
        create: {
            userId,
            accessToken: access_token,
            accessTokenExpiresAt,
            refreshToken: refresh_token
        },
    })
}