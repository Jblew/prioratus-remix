import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useCatch, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"

import type { Note } from "~/models/note.server"
import { deleteNote } from "~/models/note.server"
import { getNote } from "~/models/note.server"
import { requireUserId } from "~/session.server"

type LoaderData = {
    iso: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const userId = await requireUserId(request)
    invariant(params.dateIso, "dateIso not found")

    return json<LoaderData>({ iso: params.dateIso })
}

export default function DateView() {
    const data = useLoaderData() as LoaderData

    return (
        <div>
            <h1>This is a day {data.iso}</h1>
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error)

    return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
    const caught = useCatch()

    if (caught.status === 404) {
        return <div>Note not found</div>
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
