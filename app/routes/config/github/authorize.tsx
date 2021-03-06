import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import container from "~/container.server"
import { GithubService } from "~/models/github.server"
import { mustGetUser } from "~/session.server"

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const githubService = container.get(GithubService)
    const authorizeURL = await githubService.generateAuthorizeURL(user.id)
    return redirect(authorizeURL)
}
