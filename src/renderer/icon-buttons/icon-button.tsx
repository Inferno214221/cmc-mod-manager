import "./icon-buttons.css";

export default function IconButton({
    icon,
    iconSize,
    tooltip,
    onClick
}: {
    icon: string,
    iconSize: string,
    tooltip: string,
    onClick: VoidFunction
}): JSX.Element {
    return (
        <div className={"icon-button-wrapper"}>
            <button  className={"icon-button"} onClick={() => {onClick()}}>
                <span className={"mat-icon button-icon"} style={{ fontSize: iconSize }}>
                    {icon}
                </span>
            </button>
            <div className={"icon-button-tooltip"}>
                <span>{tooltip}</span>
            </div>
        </div>
    );
}