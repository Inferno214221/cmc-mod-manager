import { Dispatch, SetStateAction } from "react";
import appStyles from "../app/app.css";
import iconButtonStyles from "./icon-buttons.css";
const styles: typeof import("../app/app.css") & typeof import("./icon-buttons.css") =
    Object.assign({}, appStyles, iconButtonStyles);

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
        <div className={styles.iconButtonWrapper}>
            <button  className={styles.iconButton} onClick={() => {
                setter((prev: number) => {
                    prev++;
                    if (prev == icons.length) {
                        prev = 0;
                    }
                    return prev;
                });
            }}>
                <span className={styles.matIcon + " " + styles.buttonIcon}
                    style={{ fontSize: iconSize }}
                >
                    {icons[index]}
                </span>
            </button>
            <div className={styles.iconButtonTooltip}>
                <span>{tooltips[index]}</span>
            </div>
        </div>
    );
}