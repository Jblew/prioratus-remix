import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"

import { requireUserId } from "~/session.server"
import { DateTime } from "luxon"
import { Button } from "~/components"

type LoaderData = {
    iso: {
        yesterday: string
        today: string
        tomorrow: string
    }
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const userId = await requireUserId(request)
    invariant(params.dateIso, "dateIso not found")

    const today = params.dateIso
    const yesterday = DateTime.fromISO(today).minus({ days: 1 }).toISODate()
    const tomorrow = DateTime.fromISO(today).plus({ days: 1 }).toISODate()

    return json<LoaderData>({ iso: { yesterday, today, tomorrow } })
}

export default function DateView() {
    const data = useLoaderData() as LoaderData

    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-800">
            <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
                <h1 className="text-3xl font-bold">
                    <Link to="/days">Prioratus</Link>
                </h1>
                <Logout />
            </header>
            <nav className="flex items-center justify-between p-2 bg-slate-500 text-white">
                <Link to={`/days/${data.iso.yesterday}`} className="rounded bg-slate-800 hover:bg-slate-600 py-1 px-2">&laquo;</Link>
                <Link to={`/days/${data.iso.today}`} className="text-italic">
                    {DateTime.fromISO(data.iso.today).setLocale("pl").toFormat("cccc, dd LLLL")}
                </Link>
                <Link to={`/days/${data.iso.tomorrow}`} className="rounded bg-slate-800 hover:bg-slate-600 py-1 px-2">&raquo;</Link>
            </nav>
            <main className="text-white mt-4">
                <Outlet />
            </main>
        </div>
    )
}

function Logout() {
    return (
        <Form action="/logout" method="post">
            <Button
                type="submit"
            >
                Logout
            </Button>
        </Form>
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
