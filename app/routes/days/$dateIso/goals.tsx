import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ButtonLink } from "~/components"
import container from "~/container.server"
import { UserGoal, UserGoals } from "~/domain"
import { requireUserId } from "~/session.server"
interface Task {
    name: string
    count: number
    maxCount: number
}

type LoaderData = {
    goals: UserGoal[]
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const userID = await requireUserId(request)
    invariant(params.dateIso, "dateIso not found")
    const goals = await container.get(UserGoals).getGoals(userID)

    return json<LoaderData>({ goals })
}

export default function GoalsDay() {
    const { goals } = useLoaderData() as LoaderData

    return <>
        <ul className="container mx-auto p-8 space-y-8">
            {goals.map((goal, i) => (
                <GoalSelectorLi key={i} goal={goal} />
            ))}
        </ul>
    </>
}

function GoalSelectorLi({ goal }: { goal: UserGoal }) {
    return (
        <li className="rounded bg-slate-700 px-2 flex justify-start divide-x divide-gray-400">
            <p className="p-2 pr-4 font-bold tracking-wide">{goal.title}</p>
            <button className="py-2 px-3 bg-slate-500 hover:bg-slate-400">Not done</button>
            {goal.maxCount === 1 && <>
                <button className="py-2 px-3 hover:bg-slate-400">Done</button>
            </>}
            {goal.maxCount > 1 && <>
                {[...Array(goal.maxCount)].map((_, i) => (
                    <button key={i} className="py-2 px-5 hover:bg-slate-400">{i + 1}</button>
                ))}
            </>}
            <p></p>
        </li>
    )
}