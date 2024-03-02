import { Dispatch, SetStateAction } from "react";
import "./icon-buttons.css";

export default function CycleIconButton({
    index,
    icons,
    tooltips,
    iconSize,
    setter
}: {
    index: number,
    icons: string[],
    tooltips: string[],
    iconSize: string,
    setter: Dispatch<SetStateAction<number>>
}): JSX.Element {
    return (
        <div className={"icon-button-wrapper"}>
            <button  className={"icon-button"} onClick={() => {
                setter((prev: number) => {
                    prev++;
                    if (prev == icons.length) {
                        prev = 0;
                    }
                    return prev;
                });
            }}>
                <span className={"mat-icon button-icon"} style={{ fontSize: iconSize }}>
                    {icons[index]}
                </span>
            </button>
            <div className={"icon-button-tooltip"}>
                <span>{tooltips[index]}</span>
            </div>
        </div>
    );
}