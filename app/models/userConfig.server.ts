import { defaultUserConfig, User, UserConfigRepository } from "~/domain"
import { prisma } from "~/db.server"
import { UserConfig as DomainUserConfig } from "~/domain"
import type { UserConfig } from "@prisma/client"
import { injectable } from "inversify"
let assertUserConfigType: DomainUserConfig = {} as UserConfig

@injectable()
export class UserConfigRepositoryDb implements UserConfigRepository {
    async get(userId: User["id"]) {
        console.log('Users', await prisma.user.findMany())
        console.log("UserConfigRepositoryDb.get")
        const userConfig = await prisma.userConfig.findUnique({
            where: { userId }
        })
        if (userConfig) { return userConfig }
        const newUserConfig = { ...defaultUserConfig, userId, }
        console.log("UserConfigRepositoryDb.get.insert", newUserConfig)
        await prisma.userConfig.create({ data: newUserConfig })
        return newUserConfig
    }

    async update(userId: User["id"], userConfig: Omit<UserConfig, "userId">) {
        console.log("UserConfigRepositoryDb.update")
        const r = await prisma.userConfig.upsert({
            where: { userId },
            update: userConfig,
            create: { ...userConfig, userId }
        })
        return r
    }
}

