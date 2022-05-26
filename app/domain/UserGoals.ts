import { inject } from "inversify"
import { provide } from "inversify-binding-decorators"
import { UserBoardRepository } from "./Boards"
import { User } from "./User"

@provide(UserGoals)
export class UserGoals {
    constructor(
        @inject(UserBoardRepository)
        private boardRepo: UserBoardRepository
    ) { }

    async getTasks(userID: User["id"]): Promise<UserGoal[]> {
        const repo = await this.boardRepo.getBoardForUser(userID)
        const tasks = await repo.getTasks()
        const goalsTask = tasks.find(t => t.title.trim().toLowerCase().startsWith("goals"))
        if (!goalsTask) { return [] }
        return this.taskToGoals(goalsTask.contents)
    }

    private taskToGoals(contents: string) {
        const re = /^[^-]+-\s?\[[ a-zA-Z]\]\s*(?<taskname>.*?)(\((?<count>[0-9]+)\))?$/gmi
        const goals: UserGoal[] = []
        let m: RegExpExecArray | null
        while ((m = re.exec(contents)) !== null) {
            const taskname = m.groups?.taskname || null
            if (!taskname) { continue }
            const count = m.groups?.count || null
            goals.push({
                title: taskname,
                count: count ? parseInt(count) : 1
            })
        }
        return goals
    }
}

export interface UserGoal {
    title: string
    count: number
    link?: string
}