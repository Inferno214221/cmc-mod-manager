import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from "electron";

const DEV_TOOLS_ENABLED: boolean = true;

abstract class Dialog<ExtraOptions, ReturnType> {
    id: string;
    name: string;
    options: ExtraOptions;
    window: BrowserWindow;
    resolve: ((result?: ReturnType) => void);

    abstract readonly PRELOAD_ENTRY: string;
    abstract readonly REACT_ENTRY: string;

    readonly DEFAULT_WIDTH: number = 360;
    readonly IS_MODAL: boolean = true;

    constructor(name: string, options: ExtraOptions) {
        this.id = name + "_" + Date.now();
        this.name = name;
        this.options = options;
    }

    async show(): Promise<ReturnType | undefined> {
        return new Promise((resolve: (result?: ReturnType) => void) => {
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
                    additionalArguments: [JSON.stringify({
                        id: this.id,
                        name: this.name,
                        extra: this.options
                    })]
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

            ipcMain.handle(this.id + "_dialogResize",
                (_event: IpcMainInvokeEvent, height: number) => this.resize(height)
            );
            ipcMain.handle(this.id + "_dialogOk",
                (_event: IpcMainInvokeEvent, value: ReturnType) => this.ok(value)
            );
            ipcMain.handle(this.id + "_dialogCancel",
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
        ipcMain.removeHandler(this.id + "_dialogResize");
        ipcMain.removeHandler(this.id + "_dialogOk");
        ipcMain.removeHandler(this.id + "_dialogCancel");
    }
}

declare const DIALOG_ALERT_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_ALERT_WEBPACK_ENTRY: string;

export class AlertDialog extends Dialog<null, null> {
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

export async function alert(id: string): Promise<void> {
    await new AlertDialog(id, null).show(); return;
}

declare const DIALOG_CONFIRM_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_CONFIRM_WEBPACK_ENTRY: string;

export class ConfirmDialog extends Dialog<null, boolean> {
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

export async function confirm(id: string): Promise<boolean> {
    return !!(await new ConfirmDialog(id, null).show());
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

export async function prompt(id: string, extraOptions: PromptOptions): Promise<string | undefined> {
    return new PromptDialog(id, extraOptions).show();
}

declare const DIALOG_CHARACTER_INSTALL_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_CHARACTER_INSTALL_WEBPACK_ENTRY: string;

export class CharacterInstallDialog extends Dialog<InstallOptions, null> {
    readonly PRELOAD_ENTRY: string = DIALOG_CHARACTER_INSTALL_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_CHARACTER_INSTALL_WEBPACK_ENTRY;

    readonly DEFAULT_WIDTH: number = 600;
    readonly IS_MODAL: boolean = false;

    constructor(targetDir: string) {
        super("characterInstallation", { targetDir: targetDir });
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

export class StageInstallDialog extends Dialog<InstallOptions, null> {
    readonly PRELOAD_ENTRY: string = DIALOG_STAGE_INSTALL_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_STAGE_INSTALL_WEBPACK_ENTRY;

    readonly DEFAULT_WIDTH: number = 600;
    readonly IS_MODAL: boolean = false;

    constructor(targetDir: string) {
        super("stageInstallation", { targetDir: targetDir });
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