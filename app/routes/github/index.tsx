import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useUser } from "~/utils"

export const loader: LoaderFunction = async ({ request }) => {
    const user = useUser()
    return redirect("https://github.com/login/oauth/authorize")
}
