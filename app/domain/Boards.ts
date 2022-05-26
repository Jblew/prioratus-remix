import { User } from "./User"

export abstract class UserBoardRepository {
    abstract getBoardForUser(userID: User["id"]): Promise<Board>
}

export interface Board {
    getTasks(): Promise<BoardTask[]>
}

export interface BoardTask {
    title: string
    contents: string
    link: string
}
