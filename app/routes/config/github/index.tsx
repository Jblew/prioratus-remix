import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import container from "~/container.server"
import { GithubService } from "~/models/github.server"
import { mustGetUser } from "~/session.server"

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const githubService = container.get(GithubService)
    const isAuthenticated = await githubService.isUserAuthenticated(user.id)
    if (isAuthenticated) {
        return redirect("/config/github/authenticated")
    }
    return redirect("/config/github/setup")
}
