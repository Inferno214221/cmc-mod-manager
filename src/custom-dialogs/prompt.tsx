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
    [PromptOptions, Dispatch<SetStateAction<PromptOptions>>]
    = useState(null);

    const [inputValue, setInputValue]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    dialog.onStart((options: PromptOptions) => {
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
                    ok(options.id, inputValue);
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
            <input
                type={"text"}
                placeholder={
                    (options == undefined || options.placeholder == undefined) ?
                        "" :
                        options.placeholder
                }
                onInput={
                    (options == undefined || options.invalidCharacters == undefined) ?
                        (() => null) :
                        ((event: any) => {
                            event.target.value =
                                event.target.value.replace(options.invalidCharacters, "");
                            setInputValue(event.target.value);
                        })
                }
            />
            <br/>
            <div className={styles.right}>
                <button onClick={() => cancel(options.id)}>
                    {
                        (options == undefined || options.cancelLabel == undefined) ?
                            "Cancel" :
                            options.cancelLabel
                    }
                </button>
                <button onClick={() => ok(options.id, inputValue)}>
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

function ok(id: string, input: string): void {
    if (id == undefined) return;
    dialog.ok(id, input);
}

function cancel(id: string): void {
    if (id == undefined) return;
    dialog.cancel(id);
}