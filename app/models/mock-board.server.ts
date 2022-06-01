import type { User } from "@prisma/client"

import { Board, BoardTask, UserBoardRepository } from "~/domain"
import { injectable } from "inversify"

@injectable()
export class UserBoardRepositoryMock implements UserBoardRepository {
    constructor() { }

    async getBoardForUser(_: User["id"]): Promise<Board> {
        return {
            getTasks: async (): Promise<BoardTask[]> => ([
                {
                    title: "Goals",
                    contents: `
- Nauka języka (1)
- [ ] Rozmowa z Joanną
- Zadanie Data Science (2)
- Trening (3)
                    `,
                    link: ""
                },
                { title: "Gym training", contents: "", link: "" },
                { title: "Make list of epithelial charge lterature", contents: "", link: "" },
                { title: "Transport furniture to Manki", contents: "", link: "" }
            ])
        }
    }

}
