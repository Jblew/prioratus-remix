import type { LoaderFunction } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import container from "~/container.server"
import { GithubService } from "~/models/github.server"
import { getUser } from "~/session.server"

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request)
    if (!user) throw redirect("/login")

    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    if (!code) {
        throw json("Missing code parameter", { status: 404 })
    }

    const githubService = container.get(GithubService)
    await githubService.establishAccessWithCode(user.id, { code })
    return redirect("./status")
}
