import type { User } from "@prisma/client"

import { prisma } from "~/db.server"
import { Octokit } from "octokit"
import { Board } from "~/domain"
import { inject, injectable } from "inversify"
import { GithubService } from "./github.server"

@injectable()
export class GithubBoardProvider {
    constructor(
        @inject(GithubService)
        private octokitService: GithubService
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
