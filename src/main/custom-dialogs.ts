import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from "electron";

const DEV_TOOLS_ENABLED: boolean = true;

abstract class Dialog<OptionsType extends Options, ReturnType> {
    options: OptionsType;
    window: BrowserWindow;
    resolve: ((result?: ReturnType) => void);

    abstract readonly PRELOAD_ENTRY: string;
    abstract readonly REACT_ENTRY: string;

    readonly DEFAULT_WIDTH: number = 360;
    readonly IS_MODAL: boolean = true;

    constructor(options: OptionsType) {
        this.options = options;
    }

    async show(): Promise<ReturnType | undefined> {
        return new Promise((resolve: (result?: ReturnType) => void) => {
            this.options.id = this.options.id + "_" + Date.now();
            this.resolve = resolve;

            this.window = new BrowserWindow({
                resizable: true,
                modal: this.IS_MODAL,
                autoHideMenuBar: true,
                minimizable: !this.IS_MODAL,
                maximizable: !this.IS_MODAL,
                alwaysOnTop: !this.IS_MODAL,
                fullscreenable: false,
                darkTheme: true,
                width: 360,
                height: 100,
                parent: global.win,
                webPreferences: {
                    devTools: DEV_TOOLS_ENABLED,
                    preload: this.PRELOAD_ENTRY,
                    additionalArguments: [JSON.stringify(this.options)]
                }
            });

            this.window.on("close", () => {
                this.clearHandlers();
                resolve();
            });

            // Calls even when destroyed
            this.window.on("closed", () => {
                global.dialogs.splice(global.dialogs.indexOf(this.window), 1);
            });

            ipcMain.handle(this.options.id + "_dialogResize",
                (_event: IpcMainInvokeEvent, height: number) => this.resize(height)
            );
            ipcMain.handle(this.options.id + "_dialogOk",
                (_event: IpcMainInvokeEvent, value: ReturnType) => this.ok(value)
            );
            ipcMain.handle(this.options.id + "_dialogCancel",
                () => this.cancel()
            );

            this.window.loadURL(this.REACT_ENTRY);
            global.dialogs.push(this.window);
        });
    }

    resize(height: number): void {
        this.window.setContentSize(this.DEFAULT_WIDTH, height);
    }

    ok(_value: ReturnType): void {
        this.clearHandlers();
        this.window.destroy();
    }
    
    cancel(): void {
        this.clearHandlers();
        this.window.destroy();
    }

    clearHandlers(): void {
        ipcMain.removeHandler(this.options.id + "_dialogResize");
        ipcMain.removeHandler(this.options.id + "_dialogOk");
        ipcMain.removeHandler(this.options.id + "_dialogCancel");
    }
}

declare const DIALOG_ALERT_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_ALERT_WEBPACK_ENTRY: string;

export class AlertDialog extends Dialog<AlertOptions, null> {
    readonly PRELOAD_ENTRY: string = DIALOG_ALERT_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_ALERT_WEBPACK_ENTRY;

    ok(value: null): void {
        super.ok(value);
        this.resolve();
    }
    cancel(): void {
        super.cancel();
        this.resolve();
    }
}

export async function alert(options: AlertOptions): Promise<void> {
    await new AlertDialog(options).show(); return;
}

declare const DIALOG_CONFIRM_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_CONFIRM_WEBPACK_ENTRY: string;

export class ConfirmDialog extends Dialog<ConfirmOptions, boolean> {
    readonly PRELOAD_ENTRY: string = DIALOG_CONFIRM_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_CONFIRM_WEBPACK_ENTRY;

    ok(value: boolean): void {
        super.ok(value);
        this.resolve(true);
    }
    cancel(): void {
        super.cancel();
        this.resolve(false);
    }
}

export async function confirm(options: ConfirmOptions): Promise<boolean> {
    return !!(await new ConfirmDialog(options).show());
}

declare const DIALOG_PROMPT_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_PROMPT_WEBPACK_ENTRY: string;

export class PromptDialog extends Dialog<PromptOptions, string> {
    readonly PRELOAD_ENTRY: string = DIALOG_PROMPT_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_PROMPT_WEBPACK_ENTRY;

    ok(value: string): void {
        super.ok(value);
        this.resolve(value);
    }
    cancel(): void {
        super.cancel();
        this.resolve(undefined);
    }
}

export async function prompt(options: PromptOptions): Promise<string | undefined> {
    return new PromptDialog(options).show();
}

declare const DIALOG_CHARACTER_INSTALL_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_CHARACTER_INSTALL_WEBPACK_ENTRY: string;

export class CharacterInstallDialog extends Dialog<CharacterInstallOptions, null> {
    readonly PRELOAD_ENTRY: string = DIALOG_CHARACTER_INSTALL_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_CHARACTER_INSTALL_WEBPACK_ENTRY;

    readonly DEFAULT_WIDTH: number = 600;
    readonly IS_MODAL: boolean = false;

    constructor(targetDir: string) {
        super({
            id: "characterInstallation",
            body: "",
            title: "Select Characters To Install",
            targetDir: targetDir
        });
    }

    ok(value: null): void {
        super.ok(value);
        this.resolve();
    }
    cancel(): void {
        super.cancel();
        this.resolve();
    }
}

declare const DIALOG_STAGE_INSTALL_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_STAGE_INSTALL_WEBPACK_ENTRY: string;

export class StageInstallDialog extends Dialog<StageInstallOptions, null> {
    readonly PRELOAD_ENTRY: string = DIALOG_STAGE_INSTALL_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_STAGE_INSTALL_WEBPACK_ENTRY;

    readonly DEFAULT_WIDTH: number = 600;
    readonly IS_MODAL: boolean = false;

    constructor(targetDir: string) {
        super({
            id: "stageInstallation",
            body: "",
            title: "Select Stages To Install",
            targetDir: targetDir
        });
    }

    ok(value: null): void {
        super.ok(value);
        this.resolve();
    }
    cancel(): void {
        super.cancel();
        this.resolve();
    }
}

export function closeDialog(winId: number): void {
    global.dialogs.filter((win: BrowserWindow) => win.id == winId)[0].close();
}