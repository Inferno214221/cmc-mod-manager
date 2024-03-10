import { Dispatch, SetStateAction } from "react";
import appStyles from "../app/app.css";
import iconButtonStyles from "./icon-buttons.css";
const styles: typeof import("../app/app.css") & typeof import("./icon-buttons.css") =
    Object.assign({}, appStyles, iconButtonStyles);

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