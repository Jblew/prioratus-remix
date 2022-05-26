import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ButtonLink } from "~/components"
import { isUserAuthenticatedToGithub } from "~/models/github.server"
import { mustGetUser } from "~/session.server"

type LoaderData = {
    isAuthenticated: boolean
    authorizeURL?: string
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)

    const isAuthenticated = await isUserAuthenticatedToGithub(user.id)
    return json<LoaderData>({ isAuthenticated })
}

export default function ConfigGithubIndex() {
    const data = useLoaderData<LoaderData>()
    return <>
        {data.isAuthenticated && (
            <p className="text-green-500">Authenticated to github</p>
        )}
        {!data.isAuthenticated && (<>
            <p className="mb-3">Not authenticated to github</p>
            <ButtonLink to="authorize" variant="primary">Login to Github</ButtonLink>
        </>)}
    </>
}