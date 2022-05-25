export function envMust(name: string): string {
    const v = process.env[name]
    if (typeof v === "undefined") {
        throw new Error(`Missing environment variable '${name}'`)
    }
    return v
}