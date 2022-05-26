
export function FormControl({ children, className }: { children: React.ReactNode, className?: string }) {
    return (<p className={`rounded bg-slate-100 p-2 ${className}`}>
        <label>
            {children}
        </label>
    </p>)
}