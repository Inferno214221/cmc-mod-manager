import { Dispatch, SetStateAction, useState } from "react";
import "./icon-button.css";

export default function ToggleIconButton({
    defaultState,
    trueIcon,
    trueTooltip,
    falseIcon,
    falseTooltip,
    iconSize
}: {
    defaultState: boolean,
    trueIcon: string,
    trueTooltip: string,
    falseIcon: string,
    falseTooltip: string,
    iconSize: string
}): JSX.Element {
    const [checked, setChecked]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(defaultState);
    return (
        <div className={"icon-button-wrapper"}>
            <button  className={"icon-button"} onClick={() => {
                setChecked((checked) => !checked)
            }}>
                <span className={"mat-icon button-icon"} style={{ fontSize: iconSize }}>
                    {checked ? trueIcon : falseIcon}
                </span>
            </button>
            <div className={"icon-button-tooltip"}>
                <span>{checked ? trueTooltip : falseTooltip}</span>
            </div>
        </div>
    );
}