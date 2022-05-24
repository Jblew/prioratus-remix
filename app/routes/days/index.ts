import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { DateTime } from "luxon"
import container from "~/container.server"
import { UserConfigRepository } from "~/domain"

import { logout, requireUser } from "~/session.server"

export const action: ActionFunction = async ({ request }) => {
    return logout(request)
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUser(request)
    const userConfig = await container.get(UserConfigRepository).get(user.email)
    const timeZone = userConfig!.timeZone
    const todayIso = DateTime.now().setZone(timeZone).toFormat('yyyy-MM-dd')
    return redirect(`/days/${todayIso}`)
}
