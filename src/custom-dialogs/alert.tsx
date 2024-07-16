import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import styles from "./custom-dialogs.css";

declare const dialog: typeof import("./api").default;
declare const options: AlertOptions;

const root: Root = createRoot(document.body);
console.log(options);
if (!options) throw new Error("Options not found.");
if (options.title != undefined) {
    document.title = options.title;
}
root.render(<Body/>);

function Body(): JSX.Element {
    const [height, setHeight]:
    [number, Dispatch<SetStateAction<number>>]
    = useState(0);

    useEffect(() => {
        // Request second frame
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
            if (document.documentElement.getBoundingClientRect().height == height) return;
            if (options.id != undefined) {
                dialog.resize(options.id, document.documentElement.getBoundingClientRect().height);
                setHeight(document.documentElement.getBoundingClientRect().height);
            }
        }));
    });

    return (
        <div onKeyUp={(event: any) => {
            switch (event.key) {
                case " ":
                case "Enter":
                case "Escape":
                    ok(options.id);
                    break;
            }
        }}>
            <div className={styles.center}>
                <span>
                    {options.body}
                </span>
            </div>
            <br/>
            <div className={styles.right}>
                <button onClick={() => ok(options.id)}>
                    {
                        (options.okLabel == undefined) ?
                            "OK" :
                            options.okLabel
                    }
                </button>
            </div>
        </div>
    );
}

function ok(id: string): void {
    if (id == undefined) return;
    dialog.ok(id, undefined);
}