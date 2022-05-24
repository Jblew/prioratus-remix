import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"
import { requireUserId } from "~/session.server"

type LoaderData = {
    iso: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const userId = await requireUserId(request)
    invariant(params.dateIso, "dateIso not found")

    const iso = params.dateIso

    return json<LoaderData>({ iso })
}

export default function DateViewIndex() {
    const data = useLoaderData() as LoaderData

    return (<i>Today is {data.iso}</i>)
}
