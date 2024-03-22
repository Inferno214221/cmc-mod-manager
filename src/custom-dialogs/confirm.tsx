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
    [ConfirmOptions, Dispatch<SetStateAction<ConfirmOptions>>]
    = useState(null);

    const [height, setHeight]:
    [number, Dispatch<SetStateAction<number>>]
    = useState(0);

    dialog.onStart((options: ConfirmOptions) => {
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
            if (document.documentElement.getBoundingClientRect().height == height) return;
            console.log(options, document.documentElement.getBoundingClientRect().height);
            if (options != undefined && options.id != undefined) {
                dialog.resize(options.id, document.documentElement.getBoundingClientRect().height);
                setHeight(document.documentElement.getBoundingClientRect().height);
            }
        });
    });

    return (
        <div onKeyUp={(event: any) => {
            switch (event.key) {
                case " ":
                case "Enter":
                    ok(options.id);
                    break;
                case "Escape":
                    cancel(options.id);
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
                <button onClick={() => cancel(options.id)}>
                    {
                        (options == undefined || options.cancelLabel == undefined) ?
                            "Cancel" :
                            options.cancelLabel
                    }
                </button>
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

function cancel(id: string): void {
    if (id == undefined) return;
    dialog.cancel(id);
}