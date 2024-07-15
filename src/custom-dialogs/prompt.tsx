import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import styles from "./custom-dialogs.css";

declare const dialog: typeof import("./api").default;
declare const options: PromptOptions;

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

    const [inputValue, setInputValue]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    useEffect(() => {
        window.requestAnimationFrame(() => {
            if (document.documentElement.getBoundingClientRect().height == height) return;
            console.log(options, document.documentElement.getBoundingClientRect().height);
            if (options.id != undefined) {
                dialog.resize(options.id, document.documentElement.getBoundingClientRect().height);
                setHeight(document.documentElement.getBoundingClientRect().height);
            }
        });
    });

    return (
        <div onKeyUp={(event: any) => {
            switch (event.key) {
                case "Enter":
                    ok(options.id, inputValue);
                    break;
                case "Escape":
                    cancel(options.id);
                    break;
            }
        }}>
            <div className={styles.center}>
                <span>
                    {options.body}
                </span>
            </div>
            <input
                autoFocus
                type={"text"}
                placeholder={
                    (options.placeholder == undefined) ?
                        "" :
                        options.placeholder
                }
                onInput={
                    (options.invalidCharacters == undefined) ?
                        ((event: any) => setInputValue(event.target.value)) :
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
                        (options.cancelLabel == undefined) ?
                            "Cancel" :
                            options.cancelLabel
                    }
                </button>
                <button onClick={() => ok(options.id, inputValue)}>
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

function ok(id: string, input: string): void {
    if (id == undefined) return;
    dialog.ok(id, input);
}

function cancel(id: string): void {
    if (id == undefined) return;
    dialog.cancel(id);
}