import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"

import tailwindStylesheetUrl from "./styles/tailwind.css"
import { getUser } from "./session.server"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Prioratus: life in the rhythm of breviary",
  viewport: "width=device-width,initial-scale=1",
  icon: "/favicon.ico",
  description: "Life in the rhythm of breviary",
  manifest: "/manifest.json",
  "theme-color": "#565676",
  "apple-touch-icon": "/apple-touch-icon.png",
  "apple-touch-startup-image": "/launch.png",
  "apple-mobile-web-app-title": "Prioratus",
  "apple-mobile-web-app-capable": "yes",
  "apple-mobile-web-app-status-bar-style": "black"
})

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>
}

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  })
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
