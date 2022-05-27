import { Link, useActionData, useLoaderData } from "@remix-run/react"
import { ActionFunction, LoaderFunction, json } from "@remix-run/server-runtime"
import React from "react"
import { Button, FormControl, LinkLink } from "~/components"
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

export default function ConfigEditRoute() {
    const actionData = useActionData<ActionLoaderData>()
    const loaderData = useLoaderData<ActionLoaderData>()
    const data = {
        ...(loaderData || {}),
        ...(actionData || {})
    }
    return (
        <form method="post" className="space-y-4">
            <FormControl>
                Time zone:{"  "}
                <select name="timeZone" defaultValue={data.userConfig.timeZone}>
                    {timeZones.map(tzName => (
                        <option value={tzName}>{tzName}</option>
                    ))}
                </select>
            </FormControl>
            {data?.errors?.timeZone ? (
                <FormControl className="text-red">
                    {data.errors.timeZone}
                </FormControl>
            ) : null}

            <p><Button type="submit" variant="primary">Save</Button></p>
        </form>
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
