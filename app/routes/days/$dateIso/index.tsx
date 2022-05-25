import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ButtonLink } from "~/components"
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

    return <>
        <p className="text-center">Choose</p>
        <div className="flex justify-around">
            <ButtonLink to="./goals" variant="primary" className="btn--primary">Goals day</ButtonLink>
            <ButtonLink to="./breviary" variant="primary" className="btn--primary">Breviary day</ButtonLink>
        </div>
    </>
}
