import appStyles from "../app/app.css";
import iconButtonStyles from "./icon-buttons.css";
const styles: typeof import("../app/app.css") & typeof import("./icon-buttons.css") =
    Object.assign({}, appStyles, iconButtonStyles);

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
        <div className={styles.iconButtonWrapper}>
            <button  className={styles.iconButton} onClick={() => {onClick()}}>
                <span className={styles.matIcon + " " + styles.buttonIcon}
                    style={{ fontSize: iconSize }}
                >
                    {icon}
                </span>
            </button>
            <div className={styles.iconButtonTooltip}>
                <span>{tooltip}</span>
            </div>
        </div>
    );
}