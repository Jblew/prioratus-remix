import { UserConfig, UserConfigRepository } from "./domain"

export class UserConfigRepositoryStatic extends UserConfigRepository {
    private userConfigs: UserConfig[] = [
        {
            email: "jedrzejblew@gmail.com",
            timeZone: "Europe/Warsaw",
            horas: {
                officiumLectionis: "24:00",
                laudesMatutinae: "7:00",
                tertia: "9: 00",
                sexta: "12: 00",
                nona: "15: 00",
                vespera: "18: 00",
                completorium: "21: 00"
            }
        }
    ]

    get(email: string): Promise<UserConfig | null> {
        const uc = this.userConfigs.find(uc => uc.email === email) || null
        return Promise.resolve(uc)
    }
}