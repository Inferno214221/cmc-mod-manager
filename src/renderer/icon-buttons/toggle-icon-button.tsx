import { Dispatch, SetStateAction } from "react";
import styles from "./icon-buttons.css";

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
        <div className={styles.iconButtonWrapper}>
            <button  className={styles.iconButton} onClick={() => {
                setter((prev: boolean) => !prev);
            }}>
                <span className={styles.matIcon + " " + styles.buttonIcon}
                    style={{ fontSize: iconSize }}
                >
                    {checked ? trueIcon : falseIcon}
                </span>
            </button>
            <div className={styles.iconButtonTooltip}>
                <span>{checked ? trueTooltip : falseTooltip}</span>
            </div>
        </div>
    );
}