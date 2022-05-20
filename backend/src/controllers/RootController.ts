import * as express from "express"
import { interfaces, controller, httpGet, httpPost, httpDelete, request, queryParam, response, requestParam } from "inversify-express-utils"
import { injectable, inject } from "inversify"
import { envMust } from "@/utils"
import { authOr403 } from "@/auth"
import { UserConfigRepository } from "@/domain"

@controller("/")
export class RootController implements interfaces.Controller {

    constructor(
        @inject(UserConfigRepository)
        private userConfigRepo: UserConfigRepository
    ) { }

    @httpGet("/")
    private index(@request() req: express.Request, @response() res: express.Response) {
        const frontendRedirectURL = envMust("FRONTEND_REDIRECT_URL")
        res.redirect(frontendRedirectURL)
    }

    @httpGet("/health")
    private health(): object {
        return { ok: true }
    }

    @httpGet("/profile", authOr403())
    private profile(@request() req: express.Request): object {
        const user = req.oidc.user!
        const enrolledInBeta = this.userConfigRepo.get(user.email!) !== null
        const profile = {
            ...user,
            enrolledInBeta,
        }
        return profile
    }
}