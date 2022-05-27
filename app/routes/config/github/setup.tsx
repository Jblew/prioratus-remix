import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { ButtonLink, LinkLink } from "~/components"
import container from "~/container.server"
import { GithubOctokitService } from "~/models/github.server"
import { mustGetUser } from "~/session.server"

type LoaderData = {
    isAuthenticated: boolean
    authorizeURL?: string
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const githubService = container.get(GithubOctokitService)

    const isAuthenticated = await githubService.isUserAuthenticated(user.id)
    return json<LoaderData>({ isAuthenticated })
}

export default function ConfigGithubSetup() {
    const data = useLoaderData<LoaderData>()
    return <>
        {data.isAuthenticated && (<>
            <p className="text-green-500">
                Authenticated to github.{" "}
                <LinkLink to="status">Click here to test</LinkLink>
            </p>
            <Outlet />
        </>)}
        {!data.isAuthenticated && (<>
            <p className="mb-3">Not authenticated to github</p>
            <ButtonLink to="authorize" variant="primary">Login to Github</ButtonLink>
        </>)}
    </>
}