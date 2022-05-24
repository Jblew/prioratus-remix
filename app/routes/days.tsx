import { Form, Link, Outlet } from "@remix-run/react"

import { useUser } from "~/utils"

export default function Days() {
    const user = useUser()
    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-800">
            <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
                <h1 className="text-3xl font-bold">
                    <Link to="/days">Prioratus</Link>
                </h1>
                <Logout />
            </header>
            <nav className="flex items-center justify-between p-2 bg-slate-500 text-white">
                <Link to="/days" className="rounded bg-slate-800 hover:bg-slate-600 py-1 px-2">&laquo;</Link>
                <p className="text-italic">Wtorek, 24 maja</p>
                <Link to="/days" className="rounded bg-slate-800 hover:bg-slate-600 py-1 px-2">&raquo;</Link>
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
            <button
                type="submit"
                className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
                Logout
            </button>
        </Form>
    )
}