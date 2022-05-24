import "reflect-metadata"
import { Container } from 'inversify'
import { buildProviderModule } from "inversify-binding-decorators"
import { Config, UserConfigRepository } from "~/domain"
import { staticConfig } from "~/config-static"
import { UserConfigRepositoryStatic } from "~/UserConfigRepositoryStatic"

const container = new Container()
container.bind<Config>(Config).toConstantValue(staticConfig)
container.bind<UserConfigRepository>(UserConfigRepository)
    .toConstantValue(new UserConfigRepositoryStatic())
container.load(buildProviderModule())

export default container