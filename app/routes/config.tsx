import { Outlet } from "@remix-run/react"
import { LinkLink } from "~/components"

export default function ConfigRoute() {
    return (
        <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center" >
            <div className="text-center">
                <p className="flex justify-around mb-8 w-96">
                    <LinkLink to="edit">General</LinkLink>{" "}
                    <LinkLink to="github/">Github</LinkLink>
                </p>
                <Outlet />
            </div>
        </main>
    )
}
