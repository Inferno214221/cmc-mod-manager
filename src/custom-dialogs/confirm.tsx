import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import styles from "./custom-dialogs.css";
import { error, message, tryMessage } from "../global/translations";

declare const dialog: typeof import("./api").default;
declare const options: {
    id: string,
    name: string,
    extra: null
};

const root: Root = createRoot(document.body);
console.log(options);
if (!options) error("missingDialogOptions");
document.title = tryMessage("dialog.confirm." + options.name + ".title")!;
root.render(<Body/>);

async function requestNextFrame(height: number, depth: number = 0): Promise<number> {
    return new Promise((resolve: (result: number) => void) => {
        window.requestAnimationFrame(async () => {
            if (document.documentElement.getBoundingClientRect().height == height) {
                console.log(depth);
                if (depth == 60) {
                    resolve(height);
                } else {
                    resolve(await requestNextFrame(height, depth + 1));
                }
            } else {
                dialog.resize(
                    options.id,
                    document.documentElement.getBoundingClientRect().height
                );
                resolve(document.documentElement.getBoundingClientRect().height);
            }
        });
    });
}

function Body(): JSX.Element {
    const [height, setHeight]:
    [number, Dispatch<SetStateAction<number>>]
    = useState(0);

    dialog.on("updateCharacterPages", () => null);
    dialog.on("updateStagePages", () => null);

    useEffect(() => {
        (async () => setHeight(await requestNextFrame(height)))();
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
                <span
                    dangerouslySetInnerHTML={{
                        __html: tryMessage("dialog.confirm." + options.name + ".body")!
                    }}
                />
            </div>
            <br/>
            <div className={styles.right}>
                <button onClick={() => cancel(options.id)}>
                    {
                        tryMessage("dialog.confirm." + options.name + ".cancelLabel") ??
                        message("dialog.defaults.cancelLabel")
                    }
                </button>
                <button onClick={() => ok(options.id)}>
                    {
                        tryMessage("dialog.confirm." + options.name + ".okLabel") ??
                        message("dialog.defaults.okLabel")
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