import { Board } from "./Boards"
import { User } from "./User"

export type BoardProviderType = string

export abstract class BoardProviders {
    abstract getTypes(): BoardProviderType[]
    abstract getProvider(type: BoardProviderType): BoardProvider
}

export abstract class BoardProvider {
    abstract getBoard(userID: User["id"]): Board
}
