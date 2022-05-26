export interface UserConfig {
    userId: string
    timeZone: string
}

export const defaultUserConfig: Omit<UserConfig, "userId"> = {
    timeZone: "Europe/Warsaw",
}

export abstract class UserConfigRepository {
    abstract get(userID: string): Promise<UserConfig>
    abstract update(userID: string, config: Omit<UserConfig, "userId">): Promise<UserConfig>
}