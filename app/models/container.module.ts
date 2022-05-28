import { ContainerModule } from "inversify"
import { UserConfigRepository } from "~/domain"
import { GithubBoardProvider } from "./github-board.server"
import { GithubService } from "./github.server"
import { UserConfigRepositoryDb } from "./userConfig.server"

export const modelContainerModule = new ContainerModule((bind) => {
    bind(UserConfigRepository)
        .to(UserConfigRepositoryDb)
        .inSingletonScope()
    bind(GithubService).toSelf()
    bind(GithubBoardProvider).toSelf()
})