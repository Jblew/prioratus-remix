import { NavLink } from "@remix-run/react"
import React from "react"

export function LinkLink(
    { to, children }:
        { to: string, children: React.ReactNode }

) {
    return <NavLink to={to} className={({ isActive }) => `underline text-sky-500 hover:no-underline ${isActive ? "no-underline font-bold text-black" : ""}`}>
        {children}
    </NavLink>
}