import "reflect-metadata"
import { Container } from 'inversify'
import { buildProviderModule } from "inversify-binding-decorators"
import { Config } from "~/domain"
import { modelContainerModule } from "./models/container.module"
import { staticConfig } from "./config-static"

const container = new Container()
container.bind<Config>(Config).toConstantValue(staticConfig)
container.load(buildProviderModule())
container.load(modelContainerModule)

export default container