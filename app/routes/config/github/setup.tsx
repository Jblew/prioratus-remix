import { ButtonLink } from "~/components"

export default function ConfigGithubSetup() {
    return <>
        <p className="mb-3">Not authenticated to github</p>
        <ButtonLink to="authorize" variant="primary">Login to Github</ButtonLink>
    </>
}