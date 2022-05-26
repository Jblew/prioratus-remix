import { Button } from "~/components"

export default function Board() {
    return <>
        <p className="mb-4">Select board provider:</p>
        <div className="space-x-4">
            <Button>None</Button>
            <Button>Github</Button>
        </div>
    </>
}