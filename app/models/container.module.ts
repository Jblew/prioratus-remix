import { ContainerModule } from "inversify"
import { UserConfigRepository } from "~/domain"
import { UserConfigRepositoryDb } from "./userConfig.server"

export const modelContainerModule = new ContainerModule((bind) => {
    bind(UserConfigRepository)
        .to(UserConfigRepositoryDb)
        .inSingletonScope()
})