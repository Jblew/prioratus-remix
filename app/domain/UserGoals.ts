import { inject } from "inversify"
import { provide } from "inversify-binding-decorators"
import { DateTime } from "luxon"
import { UserBoardRepository } from "./Boards"
import { User } from "./User"

@provide(UserGoals)
export class UserGoals {
    constructor(
        @inject(UserBoardRepository)
        private boardRepo: UserBoardRepository
    ) { }

    async getGoals(userID: User["id"], date: DateTime): Promise<UserGoal[]> {
        const repo = await this.boardRepo.getBoardForUser(userID)
        const tasks = await repo.getTasks()
        const goalsTask = tasks.find(t => t.title.trim().toLowerCase().startsWith("goals"))
        if (!goalsTask) { return [] }
        const goalsWithoutCount = this.taskToGoals(goalsTask.contents)
        return this.loadCounts(goalsWithoutCount)
    }

    private taskToGoals(contents: string) {
        const lines = contents.split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)
        const userGoals = lines.map((line): UserGoal | null => {
            const m = /^-\s*(\[[^\]]\]\s*)?(?<taskname>.*?)\s*(\((?<count>\d+)\))?$/gmui.exec(line)
            const taskname = m?.groups?.taskname || null
            if (!taskname) {
                return null
            }
            const countStr = m?.groups?.count || null
            const count = countStr ? parseInt(countStr) : 1
            return {
                title: taskname,
                count: 0,
                maxCount: count
            }
        })
            .filter(ug => ug !== null)
        return userGoals as UserGoal[]
    }

    private async loadCounts(goals: UserGoal[]): Promise<UserGoal[]> {
        return goals
    }
}

export interface UserGoal {
    title: string
    count: number
    maxCount: number
    link?: string
}