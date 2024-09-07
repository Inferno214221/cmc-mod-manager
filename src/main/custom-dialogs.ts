import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from "electron";

const DEV_TOOLS_ENABLED: boolean = true;

abstract class Dialog<OptionsType extends Options, ReturnType> {
    options: OptionsType;
    window: BrowserWindow;
    callback: ((result?: ReturnType) => void);

    abstract readonly PRELOAD_ENTRY: string;
    abstract readonly REACT_ENTRY: string;

    readonly DEFAULT_WIDTH: number = 360;

    constructor(options: OptionsType) {
        this.options = options;
    }

    async show(): Promise<ReturnType> {
        return new Promise((resolve: (result?: ReturnType) => void) => {
            this.showSync(resolve);
        });
    }

    showSync(callback: ((result?: ReturnType) => void)): void {
        this.options.id = new Date().getTime() + "_" + this.options.id;
        this.callback = callback;

        this.window = new BrowserWindow({
            resizable: true,
            modal: true,
            autoHideMenuBar: true,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
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
        this.window.loadURL(this.REACT_ENTRY);

        this.window.on("close", () => {
            this.clearHandlers();
            if (callback != undefined) callback(undefined);
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
        this.callback();
    }
    cancel(): void {
        super.cancel();
        this.callback();
    }
}

export async function alert(options: AlertOptions): Promise<void> {
    return new AlertDialog(options).show();
}

declare const DIALOG_CONFIRM_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_CONFIRM_WEBPACK_ENTRY: string;

export class ConfirmDialog extends Dialog<ConfirmOptions, boolean> {
    readonly PRELOAD_ENTRY: string = DIALOG_CONFIRM_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_CONFIRM_WEBPACK_ENTRY;

    ok(value: boolean): void {
        super.ok(value);
        this.callback(true);
    }
    cancel(): void {
        super.cancel();
        this.callback(false);
    }
}

export async function confirm(options: ConfirmOptions): Promise<boolean> {
    return new ConfirmDialog(options).show();
}

declare const DIALOG_PROMPT_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_PROMPT_WEBPACK_ENTRY: string;

export class PromptDialog extends Dialog<PromptOptions, string> {
    readonly PRELOAD_ENTRY: string = DIALOG_PROMPT_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_PROMPT_WEBPACK_ENTRY;

    ok(value: string): void {
        super.ok(value);
        this.callback(value);
    }
    cancel(): void {
        super.cancel();
        this.callback(undefined);
    }
}

export async function prompt(options: PromptOptions): Promise<string> {
    return new PromptDialog(options).show();
}

declare const DIALOG_CHARACTER_INSTALL_PRELOAD_WEBPACK_ENTRY: string;
declare const DIALOG_CHARACTER_INSTALL_WEBPACK_ENTRY: string;

export class CharacterInstallDialog extends Dialog<CharacterInstallOptions, null> {
    readonly PRELOAD_ENTRY: string = DIALOG_CHARACTER_INSTALL_PRELOAD_WEBPACK_ENTRY;
    readonly REACT_ENTRY: string = DIALOG_CHARACTER_INSTALL_WEBPACK_ENTRY;

    readonly DEFAULT_WIDTH: number = 600;

    ok(value: null): void {
        super.ok(value);
        this.callback();
    }
    cancel(): void {
        super.cancel();
        this.callback();
    }
}

export async function characterInstallation(options: CharacterInstallOptions): Promise<void> {
    return new CharacterInstallDialog(options).show();
}