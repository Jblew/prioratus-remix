import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { generateGithubAuthorizeURLWithState } from "~/models/github.server"
import { mustGetUser } from "~/session.server"

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const authorizeURL = await generateGithubAuthorizeURLWithState(user.id)
    return redirect(authorizeURL)
}
