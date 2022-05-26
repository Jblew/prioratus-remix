import { Outlet } from "@remix-run/react"
import { LinkLink } from "~/components"

export default function ConfigRoute() {

    return (
        <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center" >
            <div>
                <p className="flex justify-around mb-8 w-96">
                    <LinkLink to="edit">General</LinkLink>{" "}
                    <LinkLink to="board">Board</LinkLink>
                </p>
                <Outlet />
            </div>
        </main>
    )
}
