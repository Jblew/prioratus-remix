import { ContainerModule } from "inversify"
import { UserBoardRepository, UserConfigRepository } from "~/domain"
import { GithubBoardProvider } from "./github-board.server"
import { GithubService } from "./github.server"
import { UserBoardRepositoryMock } from "./mock-board.server"
import { UserConfigRepositoryDb } from "./userConfig.server"

export const modelContainerModule = new ContainerModule((bind) => {
    bind(UserConfigRepository)
        .to(UserConfigRepositoryDb)
        .inSingletonScope()
    bind(GithubService).toSelf()
    bind(GithubBoardProvider).toSelf()
    bind(UserBoardRepository).to(UserBoardRepositoryMock)
})