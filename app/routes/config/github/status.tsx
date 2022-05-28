import type { LoaderFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import container from "~/container.server"
import { GithubService } from "~/models/github.server"
import { getUser } from "~/session.server"

type LoaderData = {
    repos: string[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request)
    if (!user) throw redirect("/login")
    const githubService = container.get(GithubService)

    const graphql = await githubService.getGraphql(user.id)
    interface Resp {
        viewer: {
            repositories: {
                nodes: Array<{ name: string }>
            }
        }
    }
    const resp = await graphql<Resp>(`{
        viewer {
            repositories(first: 100, affiliations: [OWNER]) {
                nodes {
                    name
                }
            }
        }
    }`)
    return json<LoaderData>({
        repos: resp.viewer.repositories.nodes.map(n => n.name)
    })
}

export default function GithubStatusPage() {
    const data = useLoaderData() as LoaderData

    return <ul>
        {data.repos.map((repoName, i) => <li key={i}>{repoName}</li>)}
    </ul>
}