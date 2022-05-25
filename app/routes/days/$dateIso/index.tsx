import { ButtonLink } from "~/components"

export default function DateViewIndex() {
    return <>
        <p className="text-center">Choose</p>
        <div className="flex justify-around">
            <ButtonLink to="./goals" variant="primary" className="btn--primary">Goals day</ButtonLink>
            <ButtonLink to="./breviary" variant="primary" className="btn--primary">Breviary day</ButtonLink>
        </div>
    </>
}
