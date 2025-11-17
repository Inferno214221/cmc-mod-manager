import styles from "./icon-buttons.css";

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
            <button className={styles.iconButton} title={tooltip} onClick={() => {onClick()}}>
                <span className={styles.matIcon + " " + styles.buttonIcon}
                    style={{ fontSize: iconSize }}
                >
                    {icon}
                </span>
            </button>
        </div>
    );
}