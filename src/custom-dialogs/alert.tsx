import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import styles from "./custom-dialogs.css";
import { MessageMap, translations } from "../global/translations";

let error: (key: string, ...args: any) => never;
let message: (key: keyof MessageMap, ...args: any) => string;
let tryMessage: (key: string, ...args: any) => string | undefined;

function setupTranslations(): void {
    const funcs: ReturnType<typeof translations> = translations(global.language);
    error = funcs.error;
    message = funcs.message;
    tryMessage = funcs.tryMessage;
}

declare const dialog: typeof import("./api").default;
declare const options: {
    id: string,
    name: string,
    extra: null
};

dialog.readAppData().then(async (appData: AppData) => {
    global.language = appData.config.language;
    setupTranslations();

    const root: Root = createRoot(document.body);
    console.log(options);
    if (!options) error("missingDialogOptions");
    document.title = tryMessage("dialog.alert." + options.name + ".title")!;
    root.render(<Body/>);
});

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
                case "Escape":
                    ok(options.id);
                    break;
            }
        }}>
            <div className={styles.center}>
                <span
                    dangerouslySetInnerHTML={{
                        __html: tryMessage("dialog.alert." + options.name + ".body")!
                    }}
                />
            </div>
            <br/>
            <div className={styles.right}>
                <button onClick={() => ok(options.id)}>
                    {
                        tryMessage("dialog.alert." + options.name + ".okLabel") ??
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