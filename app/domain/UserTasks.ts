import { inject, injectable } from "inversify"
import { provide } from "inversify-binding-decorators"
import { UserBoardRepository } from "./Boards"
import { User } from "./User"

@provide(UserTasks)
export class UserTasks {
    constructor(
        @inject(UserBoardRepository)
        private boardRepo: UserBoardRepository
    ) { }

    async getTasks(userID: User["id"]): Promise<UserTask[]> {
        const repo = await this.boardRepo.getBoardForUser(userID)
        return repo.getTasks()
    }
}

export interface UserTask {
    title: string
    link: string
}