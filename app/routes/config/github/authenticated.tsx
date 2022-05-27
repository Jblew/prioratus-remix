import { User } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/node"
import { json, ActionFunction } from "@remix-run/node"
import { useActionData, useLoaderData } from "@remix-run/react"
import { Button, FormControl } from "~/components"
import container from "~/container.server"
import { GithubBoardProvider } from "~/models/github.server"
import { mustGetUser } from "~/session.server"


type ActionData = {
    errors: { project?: string }
}

type LoaderData = {
    projects: { name: string, id: number, selected: boolean }[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const ghBoardProvider = container.get(GithubBoardProvider)
    const projects = await ghBoardProvider.listBoards(user.id)
    return json<LoaderData>({ projects })
}

export const action: ActionFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const errors = await updateBoardSettings(user.id, await request.formData())
    return json<ActionData>({ errors })
}

export default function ConfigGithubAuthenticated() {
    const data = useLoaderData<LoaderData>()
    const actionData = useActionData<ActionData>()
    return (
        <form method="post" className="space-y-4">
            <FormControl>
                Project:{"  "}
                <select name="project">
                    {data.projects.map(p => (
                        <option value={p.id} selected={p.selected}>{p.name}</option>
                    ))}
                </select>
            </FormControl>
            {actionData?.errors?.project ? (
                <FormControl className="text-red">
                    {actionData.errors.project}
                </FormControl>
            ) : null}

            <p><Button type="submit" variant="primary">Save</Button></p>
        </form>
    )
}


async function updateBoardSettings(userID: User["id"], formData: FormData): Promise<{ project?: string }> {
    const ghBoardProvider = container.get(GithubBoardProvider)
    const boards = await ghBoardProvider.listBoards(userID)

    const project = parseInt(formData.get("project")?.toString() || "")
    if (!project) {
        return { project: "You must select a project" }
    }
    if (boards.find(b => b.id === project) === undefined) {
        return { project: "You must select an existing project" }
    }
    await ghBoardProvider.setCurrentProjectId(userID, project)
    return {}
}
