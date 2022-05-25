import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { generateGithubAuthorizeURLWithState, isUserAuthenticatedToGithub } from "~/models/github.server"
import { getUser } from "~/session.server"

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request)
    if (!user) throw redirect("/login")

    if (await isUserAuthenticatedToGithub(user.id)) {
        return redirect("./status")
    }
    const authorizeURL = await generateGithubAuthorizeURLWithState(user.id)
    return redirect(authorizeURL)
}
