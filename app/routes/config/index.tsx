import { useActionData, useLoaderData } from "@remix-run/react"
import { ActionFunction, LoaderFunction, redirect, json } from "@remix-run/server-runtime"
import container from "~/container.server"
import { UserConfig, UserConfigRepository } from "~/domain"
import { getUser, mustGetUser } from "~/session.server"

const timeZones = [
    "Europe/Warsaw",
    "Europe/London"
]

type ActionLoaderData = {
    userConfig: UserConfig
    errors?: {
        timeZone?: string
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    console.log('LOADER, user=', user)
    const userConfig = await container.get(UserConfigRepository).get(user.id)
    return json<ActionLoaderData>({
        userConfig
    })
}
export const action: ActionFunction = async ({ request }) => {
    const user = await mustGetUser(request)
    console.log('ACTION, user=', user)
    const oldUserConfig = await container.get(UserConfigRepository).get(user.id)
    const body = await request.formData()
    const timeZone = body.get("timeZone")?.toString()
    if (!timeZone || !timeZones.includes) {
        return json<ActionLoaderData>({
            userConfig: oldUserConfig,
            errors: { timeZone: "You must select valid time zone" }
        })
    }
    const newUserConfig: Omit<UserConfig, "userId"> = {
        timeZone
    }
    const userConfig = await container.get(UserConfigRepository).update(user.id, newUserConfig)
    return json<ActionLoaderData>({
        userConfig,
    })
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
            <form method="post" action=".">
                <p>
                    <label>
                        Time zone:
                        <select name="timeZone" value={data.userConfig.timeZone}>
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
                <button type="submit">Save</button>
            </form>
        </main>
    )
}
