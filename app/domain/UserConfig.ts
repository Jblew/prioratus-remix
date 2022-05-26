import { Named } from "~/utils"

export interface UserConfig {
    userId: string
    email: string
    timeZone: string
    horas: Record<string, TimeStr>
}

export type TimeStr = Named<string, "TimeStr">

export abstract class UserConfigRepository {
    abstract get(userID: string): Promise<UserConfig | null>
}