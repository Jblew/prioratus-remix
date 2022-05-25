import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ButtonLink } from "~/components"
import { requireUserId } from "~/session.server"
interface Task {
    name: string
    count: number
    maxCount: number
}

type LoaderData = {
    tasks: Task[]
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const userId = await requireUserId(request)
    invariant(params.dateIso, "dateIso not found")

    const tasks = [
        { name: "Nauka języka", count: 1, maxCount: 1 },
        { name: "Rozmowa z Joanną", count: 0, maxCount: 1 },
        { name: "Zadania data science", count: 1, maxCount: 2 },
        { name: "Treningi", count: 1, maxCount: 2 }
    ]

    return json<LoaderData>({ tasks })
}

export default function GoalsDay() {
    const { tasks } = useLoaderData() as LoaderData

    return <>
        <ul className="container mx-auto p-8 space-y-8">
            {tasks.map((task, i) => (
                <TaskSelectorLi key={i} task={task} />
            ))}
        </ul>
    </>
}

function TaskSelectorLi({ task }: { task: Task }) {
    return (
        <li className="rounded bg-slate-700 px-2 flex justify-start divide-x divide-gray-400">
            <p className="p-2 pr-4 font-bold tracking-wide">{task.name}</p>
            <button className="py-2 px-3 bg-slate-500 hover:bg-slate-400">Not done</button>
            {task.maxCount === 1 && <>
                <button className="py-2 px-3 hover:bg-slate-400">Done</button>
            </>}
            {task.maxCount > 1 && <>
                {[...Array(task.maxCount)].map((_, i) => (
                    <button key={i} className="py-2 px-5 hover:bg-slate-400">{i + 1}</button>
                ))}
            </>}
            <p></p>
        </li>
    )
}