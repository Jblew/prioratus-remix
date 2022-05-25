import { Link } from "@remix-run/react"
import React from "react"

interface ButtonStyleProps {
    variant: "primary" | "secondary"
    className: string
}

const defaultButtonStyleProps: ButtonStyleProps = {
    variant: "secondary",
    className: "",
}

const buttonClassName = (p: ButtonStyleProps) => ``
    + `rounded py-2 px-4 text-white `
    + (p.variant === "primary" ? `bg-primary-500 hover:bg-primary-600 focus:bg-primary-400 ` : ``)
    + (p.variant === "secondary" ? `bg-secondary-500 hover:bg-secondary-600 focus:bg-secondary-400 ` : ``)
    + p.className

export function ButtonLink(
    { to, children, ...stylePropsPartial }:
        { to: string, children: React.ReactNode }
        & Partial<ButtonStyleProps>
) {
    const styleProps = { ...defaultButtonStyleProps, ...stylePropsPartial }
    return <Link to={to} className={buttonClassName(styleProps)}>
        {children}
    </Link>
}

export function Button(
    { type, children, ...stylePropsPartial }:
        { type?: "button" | "submit" | "reset", children: React.ReactNode }
        & Partial<ButtonStyleProps>
) {
    const styleProps = { ...defaultButtonStyleProps, ...stylePropsPartial }
    return <button type={type} className={buttonClassName(styleProps)}>
        {children}
    </button>
}