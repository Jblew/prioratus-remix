import type { User } from "@prisma/client"
import { v4 as uuid } from "uuid"

import { prisma } from "~/db.server"
import { envMust } from "~/utils"
import { Octokit } from "octokit"
import { createOAuthUserAuth } from "@octokit/auth-oauth-user"

const githubAuthorizeURL = "https://github.com/login/oauth/authorize"
const githubAccessTokenURL = "https://github.com/login/oauth/access_token"
const GITHUB_CLIENT_ID = envMust("GITHUB_CLIENT_ID")
const GITHUB_CLIENT_SECRET = envMust("GITHUB_CLIENT_SECRET")
const GITHUB_OAUTH_CALLBACK_URL = envMust("GITHUB_OAUTH_CALLBACK_URL")

export async function getOctokit(userId: User["id"]) {
    const token = await getGithubAccessToken(userId)
    return new Octokit({
        authStrategy: createOAuthUserAuth,
        auth: {
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            clientType: "oauth-app",
            token,
        }
    })
}

export async function generateGithubAuthorizeURLWithState(userId: User["id"]) {
    const stateCode = uuid()
    await prisma.githubOAuthState.upsert({
        where: { userId },
        update: { stateCode },
        create: { userId, stateCode }
    })
    const authorizeURL = `${githubAuthorizeURL}`
        + `?client_id=${GITHUB_CLIENT_ID}`
        + `&redirect_uri=${encodeURIComponent(GITHUB_OAUTH_CALLBACK_URL)}`
        + `&state=${stateCode}`
    return authorizeURL
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

export async function isUserAuthenticatedToGithub(userId: User["id"]): Promise<boolean> {
    const githubAccess = await prisma.githubAccess.findFirst({ where: { userId } })
    return githubAccess !== null
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
    const formBody = []
    for (var property in requestBody) {
        var encodedKey = encodeURIComponent(property)
        var encodedValue = encodeURIComponent((requestBody as any)[property])
        formBody.push(encodedKey + "=" + encodedValue)
    }
    const resp = await fetch(githubAccessTokenURL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.join("&")
    })
    if (resp.status !== 200) {
        console.log({
            status: resp.status,
            body: await resp.text()
        })
        throw new Error(`Non 200 response (${resp.status}) from github oauth access token endpoint`)
    }
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