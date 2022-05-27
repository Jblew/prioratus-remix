import type { User } from "@prisma/client"
import { v4 as uuid } from "uuid"

import { prisma } from "~/db.server"
import { envMust } from "~/utils"
import { Octokit } from "octokit"
import { createOAuthUserAuth } from "@octokit/auth-oauth-user"
import { provide } from "inversify-binding-decorators"
import { Board } from "~/domain"
import { inject } from "inversify"

const githubAuthorizeURL = "https://github.com/login/oauth/authorize"
const githubAccessTokenURL = "https://github.com/login/oauth/access_token"
const GITHUB_CLIENT_ID = envMust("GITHUB_CLIENT_ID")
const GITHUB_CLIENT_SECRET = envMust("GITHUB_CLIENT_SECRET")
const GITHUB_OAUTH_CALLBACK_URL = envMust("GITHUB_OAUTH_CALLBACK_URL")

@provide(GithubBoardProvider)
export class GithubBoardProvider {
    constructor(
        @inject(GithubOctokitService)
        private octokitService: GithubOctokitService
    ) { }

    async listBoards(userId: User["id"]): Promise<{ name: string, id: number, selected: boolean }[]> {
        const octokit = await this.octokitService.getOctokit(userId)
        const user = await this.getGithubUser(userId)
        const username = user.name!
        const projectsResp = await octokit.rest.projects.listForUser({ username })
        if (projectsResp.status !== 200) { throw new Error(`Cannot get ${username} projects, got ${projectsResp.status} instead of 200`) }
        const currentId = await this.getCurrentProjectId(userId)
        return projectsResp.data.map(project => ({
            name: project.name,
            id: project.id,
            selected: project.id === currentId
        }))
    }

    async getCurrentProjectId(userId: User["id"]): Promise<number | null> {
        const record = await prisma.githubBoardConfig.findUnique({ where: { userId } })
        if (!record) { return null }
        return record.projectId
    }

    async setCurrentProjectId(userId: User["id"], projectId: number) {
        await prisma.githubBoardConfig.upsert({
            where: { userId },
            create: { userId, projectId },
            update: { projectId }
        })
    }

    async getBoard(userId: User["id"]): Promise<Board> {
        const [octokit, user, projectId] = await Promise.all([
            this.octokitService.getOctokit(userId),
            this.getGithubUser(userId),
            this.getCurrentProjectId(userId)
        ])
        if (!projectId) { throw new Error(`User ${userId} does not have github board configured`) }
        const username = user.name!
        return new OctokitBoard(octokit, username, projectId)
    }

    private async getGithubUser(userId: User["id"]) {
        const octokit = await this.octokitService.getOctokit(userId)
        const userResp = await octokit.rest.users.getAuthenticated()
        if (userResp.status !== 200) { throw new Error(`Cannot get github username, got ${userResp.status} instead of 200`) }
        return userResp.data
    }
}

class OctokitBoard implements Board {
    constructor(
        private octokit: Octokit,
        private username: string,
        private projectId: number
    ) { }

    async getTasks() {
        const cards = await this.getProjectCards()
        const allCards = cards.columns.map(column => column.cards).flat()
        return allCards.map(card => ({
            title: card.note || "No note",
            contents: card.note || "No note",
            link: card.content_url || ""
        }))
    }

    private async getProjectCards() {
        const projectResp = await this.octokit.rest.projects.get({ project_id: this.projectId })
        if (projectResp.status !== 200) { throw new Error(`Cannot get github project ${this.projectId}, got ${projectResp.status} instead of 200`) }
        const project = projectResp.data
        const project_id = this.projectId
        const columnsResp = await this.octokit.rest.projects.listColumns({ project_id })
        if (columnsResp.status !== 200) { throw new Error(`Cannot get columns of project ${this.projectId}, got ${columnsResp.status} instead of 200`) }
        const columns = columnsResp.data
        return {
            ...project,
            columns: await Promise.all(
                columns.map(async (column) => {
                    const cardsResp = await this.octokit.rest.projects.listCards({ column_id: column.id })
                    if (cardsResp.status !== 200) { throw new Error(`Cannot get cards of column ${column.name} of project ${this.projectId}, got ${columnsResp.status} instead of 200`) }
                    return {
                        ...column,
                        cards: cardsResp.data,
                    }
                })
            ),
        }
    }
}

@provide(GithubOctokitService)
export class GithubOctokitService {
    async getOctokit(userId: User["id"]) {
        const isAuthenticated = await this.isUserAuthenticated(userId)
        if (!isAuthenticated) { throw new Error(`User ${userId} is not authenticated`) }
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

    async generateAuthorizeURL(userId: User["id"]) {
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

    async getGithubAccessToken(userId: User["id"]) {
        const githubAccess = await prisma.githubAccess.findFirst({ where: { userId } })
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
        const githubAccess = await prisma.githubAccess.findFirst({ where: { userId } })
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