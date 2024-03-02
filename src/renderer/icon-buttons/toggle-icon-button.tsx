import { Dispatch, SetStateAction } from "react";
import "./icon-buttons.css";

export default function ToggleIconButton({
    // defaultState,
    checked,
    trueIcon,
    trueTooltip,
    falseIcon,
    falseTooltip,
    iconSize,
    setter
}: {
    // defaultState: boolean,
    checked: boolean,
    trueIcon: string,
    trueTooltip: string,
    falseIcon: string,
    falseTooltip: string,
    iconSize: string,
    setter: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    if (checked == null) return null;
    return (
        <div className={"icon-button-wrapper"}>
            <button  className={"icon-button"} onClick={() => {
                setter((prev: boolean) => !prev);
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