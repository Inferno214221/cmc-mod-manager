import { Dispatch, SetStateAction } from "react";
import styles from "./icon-buttons.css";

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
            <button className={styles.iconButton} title={tooltips[index]} onClick={() => {
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
        </div>
    );
}