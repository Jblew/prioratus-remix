import type { User } from "@prisma/client"
import { v4 as uuid } from "uuid"

import { prisma } from "~/db.server"
import { envMust } from "~/utils"
import { Octokit } from "octokit"
import { createOAuthUserAuth } from "@octokit/auth-oauth-user"
import { provide } from "inversify-binding-decorators"
import { graphql } from "@octokit/graphql"
import { injectable } from "inversify"

const githubAuthorizeURL = "https://github.com/login/oauth/authorize"
const githubAccessTokenURL = "https://github.com/login/oauth/access_token"
const GITHUB_CLIENT_ID = envMust("GITHUB_CLIENT_ID")
const GITHUB_CLIENT_SECRET = envMust("GITHUB_CLIENT_SECRET")
const GITHUB_OAUTH_CALLBACK_URL = envMust("GITHUB_OAUTH_CALLBACK_URL")

@injectable()
export class GithubService {

    async getOctokit(userId: User["id"]) {
        const token = await this.getGithubAccessToken(userId)
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

    async getGraphql(userId: User["id"]) {
        const token = await this.getGithubAccessToken(userId)
        console.log('TOKEN', token)
        const resp = await (await this.getOctokit(userId)).rest.repos.listForAuthenticatedUser()
        console.log('HEADERS', resp.headers)
        return graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
        })
    }

    async generateAuthorizeURL(userId: User["id"]) {
        const stateCode = uuid()
        await prisma.githubOAuthState.upsert({
            where: { userId },
            update: { stateCode },
            create: { userId, stateCode }
        })
        const authorizeURL = `${githubAuthorizeURL}`
            + `?client_id=${GITHUB_CLIENT_ID}`
            + `&scope=repo`
            + `&redirect_uri=${encodeURIComponent(GITHUB_OAUTH_CALLBACK_URL)}`
            + `&state=${stateCode}`
        return authorizeURL
    }

    async getGithubAccessToken(userId: User["id"]) {
        const count = await prisma.githubAccess.count({ where: { userId } })
        const githubAccess = await prisma.githubAccess.findUnique({ where: { userId } })
        if (!githubAccess) { throw new Error(`User ${userId} does not have github access configured`) }
        if (Date.now() > githubAccess.accessTokenExpiresAt.getTime()) {
            const refreshedResp = await this.refreshGithubAccessToken(userId, {})
            await this.storeGithubTokens(userId, refreshedResp)
            return refreshedResp.access_token
        }
        return githubAccess.accessToken
    }

    async establishAccessWithCode(userId: User["id"], { code }: { code: string }) {
        const refreshedResp = await this.refreshGithubAccessToken(userId, { code })
        await this.storeGithubTokens(userId, refreshedResp)
    }

    async isUserAuthenticated(userId: User["id"]): Promise<boolean> {
        const githubAccess = await prisma.githubAccess.findUnique({ where: { userId } })
        return githubAccess !== null
    }

    private async refreshGithubAccessToken(userId: User["id"], reqOpts: { code: string } | {}): Promise<GithubTokensResponse> {
        const requestBody = "code" in reqOpts
            ? (await this.accessTokenRequestBodyForCode(userId, reqOpts))
            : (await this.accessTokenRequestBodyForRefresh(userId))
        const fetchConfig = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody)
        }
        const resp = await fetch(githubAccessTokenURL, fetchConfig)
        if (resp.status !== 200) {
            const errorText = await resp.text()
            throw new Error(`Non 200 response (${resp.status}) from github oauth access token endpoint: ${errorText.substring(0, 100)}`)
        }

        const responseBody = await resp.json()
        console.log('TOKEN RESPONSE', responseBody)
        if (responseBody.error) {
            throw new Error(`Received error from github oauth access token endpoint: ${responseBody.error}: ${responseBody.error_description}`)
        }
        return responseBody as GithubTokensResponse
    }

    private async accessTokenRequestBodyForCode(userId: User["id"], { code }: { code: string }) {
        const oauthState = await prisma.githubOAuthState.findFirst({ where: { userId } })
        if (!oauthState) { throw new Error("Cannot request github access token without state code") }
        return {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            state: oauthState.stateCode
        }
    }

    private async accessTokenRequestBodyForRefresh(userId: User["id"]) {
        const githubAccess = await prisma.githubAccess.findFirst({ where: { userId } })
        if (!githubAccess) { throw new Error("Cannot refresh github access token without github access record") }
        return {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: githubAccess.refreshToken
        }
    }

    private storeGithubTokens(
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
}

interface GithubTokensResponse {
    access_token: string
    expires_in: number
    refresh_token: string
    refresh_token_expires_in: number
    scope: string
    token_type: string
}