import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import styles from "./custom-dialogs.css";

declare const dialog: typeof import("./api").default;

const root: Root = createRoot(document.body);
root.render(
    <Body/>
);

function Body(): JSX.Element {
    const [options, setOptions]:
    [AlertOptions, Dispatch<SetStateAction<AlertOptions>>]
    = useState(null);

    dialog.onStart((options: AlertOptions) => {
        setOptions(options);
    });

    useEffect(() => {
        console.log(options);
        if (options == null) return;
        if (options.title != undefined) {
            document.title = options.title;
        }
    }, [options]);

    useEffect(() => {
        window.requestAnimationFrame(() => {
            console.log(options, document.documentElement.getBoundingClientRect().height);
            if (options != undefined && options.id != undefined)
                dialog.resize(options.id, document.documentElement.getBoundingClientRect().height);
        });
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
                    {
                        (options == undefined) ?
                            "Body" :
                            options.body
                    }
                </span>
            </div>
            <br/>
            <div className={styles.right}>
                <button onClick={() => ok(options.id)}>
                    {
                        (options == undefined || options.okLabel == undefined) ?
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