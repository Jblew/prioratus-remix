import { defaultUserConfig, User, UserConfigRepository } from "~/domain"
import { prisma } from "~/db.server"
import { UserConfig as DomainUserConfig } from "~/domain"
import type { UserConfig } from "@prisma/client"
import { injectable } from "inversify"
let assertUserConfigType: DomainUserConfig = {} as UserConfig

@injectable()
export class UserConfigRepositoryDb implements UserConfigRepository {
    async get(userId: User["id"]) {
        const userConfig = await prisma.userConfig.findUnique({
            where: { userId }
        })
        if (userConfig) { return userConfig }
        const newUserConfig = { ...defaultUserConfig, userId, }
        await prisma.userConfig.create({ data: newUserConfig })
        return newUserConfig
    }

    async update(userId: User["id"], userConfig: Omit<UserConfig, "userId">) {
        return prisma.userConfig.upsert({
            where: { userId },
            update: userConfig,
            create: { ...userConfig, userId }
        })
    }
}

