import { Dispatch, SetStateAction } from "react";
import "./icon-button.css";

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
    // const [checked, setChecked]:
    // [boolean, Dispatch<SetStateAction<boolean>>]
    // = useState(defaultState);
    return (
        <div className={"icon-button-wrapper"}>
            <button  className={"icon-button"} onClick={() => {
                // setChecked((checked) => !checked);
                // onClick(checked);
                setter((state: boolean) => !state);
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