import { useActionData, useLoaderData } from "@remix-run/react"
import { ActionFunction, LoaderFunction, json } from "@remix-run/server-runtime"
import { Button } from "~/components"
import container from "~/container.server"
import { User, UserConfig, UserConfigRepository } from "~/domain"
import { mustGetUser } from "~/session.server"

const timeZones = [
    "Europe/Warsaw",
    "Europe/London"
]

type Errors = {
    timeZone?: string
}

type ActionLoaderData = {
    userConfig: UserConfig
    errors?: Errors
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const userConfig = await container.get(UserConfigRepository).get(user.id)
    return json<ActionLoaderData>({
        userConfig
    })
}

export const action: ActionFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    const [errors, userConfig] = await updateConfig(user.id, await request.formData())
    return json<ActionLoaderData>({ userConfig, errors })
}

export default function ConfigRoute() {
    const actionData = useActionData<ActionLoaderData>()
    const loaderData = useLoaderData<ActionLoaderData>()
    const data = {
        ...(loaderData || {}),
        ...(actionData || {})
    }
    return (
        <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center" >
            <form method="post" className="space-y-4">
                <p>
                    <label className="rounded bg-slate-100 p-2">
                        Time zone:{"  "}
                        <select name="timeZone" defaultValue={data.userConfig.timeZone}>
                            {timeZones.map(tzName => (
                                <option value={tzName}>{tzName}</option>
                            ))}
                        </select>
                    </label>
                </p>
                {data?.errors?.timeZone ? (
                    <p style={{ color: "red" }}>
                        {data.errors.timeZone}
                    </p>
                ) : null}
                <Button type="submit" variant="primary">Save</Button>
            </form>
        </main>
    )
}

async function updateConfig(userID: User["id"], formData: FormData): Promise<[Errors, UserConfig]> {
    const userConfigRepo = container.get(UserConfigRepository)
    const timeZone = formData.get("timeZone")?.toString()
    if (!timeZone || !timeZones.includes) {
        return [
            { timeZone: "You must select valid time zone" },
            await userConfigRepo.get(userID)
        ]
    }
    return [
        {},
        await userConfigRepo.update(userID, {
            timeZone
        })
    ]
}