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
    setter: (state: boolean) => void
}): JSX.Element {
    return (
        <div className={"icon-button-wrapper"}>
            <button  className={"icon-button"} onClick={() => {
                setter(!checked);
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