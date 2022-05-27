import type { LoaderFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import container from "~/container.server"
import { GithubOctokitService } from "~/models/github.server"
import { getUser } from "~/session.server"

type LoaderData = {
    repos: string[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request)
    if (!user) throw redirect("/login")
    const githubService = container.get(GithubOctokitService)

    const octokit = await githubService.getOctokit(user.id)
    const reposResp = await octokit.rest.repos.listForAuthenticatedUser()
    return json<LoaderData>({
        repos: reposResp.data.map(repo => repo.name)
    })
}

export default function GithubStatusPage() {
    const data = useLoaderData() as LoaderData

    return <ul>
        {data.repos.map((repoName, i) => <li key={i}>{repoName}</li>)}
    </ul>
}