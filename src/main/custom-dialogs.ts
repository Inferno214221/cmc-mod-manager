import {
    BrowserWindow, BrowserWindowConstructorOptions, IpcMainInvokeEvent, ipcMain
} from "electron";

const DEV_TOOLS_ENABLED: boolean = false;

const WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
    resizable: DEV_TOOLS_ENABLED,
    modal: true,
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    darkTheme: true
}

declare const DIALOG_ALERT_WEBPACK_ENTRY: string;
declare const DIALOG_ALERT_PRELOAD_WEBPACK_ENTRY: string;

export async function alert(
    options: AlertOptions
): Promise<void> {
    return new Promise((resolve: () => void) => {
        alertSync(options, resolve);
    });
}

export function alertSync(
    options: AlertOptions,
    callback?: (() => void)
): void {
    options.id = new Date().getTime() + "_" + options.id;
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 100,
        parent: global.win,
        webPreferences: {
            devTools: DEV_TOOLS_ENABLED,
            preload: DIALOG_ALERT_PRELOAD_WEBPACK_ENTRY,
            additionalArguments: [JSON.stringify(options)]
        }
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, windowOptions)
    );
    customDialogWin.loadURL(DIALOG_ALERT_WEBPACK_ENTRY);

    customDialogWin.on("close", () => {
        if (callback != undefined) callback();
    });

    ipcMain.removeHandler(options.id + "_dialogResize");
    ipcMain.handle(options.id + "_dialogResize",
        (_event: IpcMainInvokeEvent, height: number) => {
            customDialogWin.setContentSize(360, height);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogOk");
    ipcMain.handle(options.id + "_dialogOk", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback();
    });
}

declare const DIALOG_CONFIRM_WEBPACK_ENTRY: string;
declare const DIALOG_CONFIRM_PRELOAD_WEBPACK_ENTRY: string;

export async function confirm(
    options: ConfirmOptions
): Promise<boolean> {
    return new Promise((resolve: (result: boolean) => void) => {
        confirmSync(options, resolve);
    });
}

export function confirmSync(
    options: ConfirmOptions,
    callback?: ((result: boolean) => void)
): void {
    options.id = new Date().getTime() + "_" + options.id;
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 100,
        parent: global.win,
        webPreferences: {
            devTools: DEV_TOOLS_ENABLED,
            preload: DIALOG_CONFIRM_PRELOAD_WEBPACK_ENTRY,
            additionalArguments: [JSON.stringify(options)]
        }
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, windowOptions)
    );
    customDialogWin.loadURL(DIALOG_CONFIRM_WEBPACK_ENTRY);

    customDialogWin.on("close", () => {
        if (callback != undefined) callback(undefined);
    });

    ipcMain.removeHandler(options.id + "_dialogResize");
    ipcMain.handle(options.id + "_dialogResize",
        (_event: IpcMainInvokeEvent, height: number) => {
            customDialogWin.setContentSize(360, height);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogOk");
    ipcMain.handle(options.id + "_dialogOk", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback(true);
    });

    ipcMain.removeHandler(options.id + "_dialogCancel");
    ipcMain.handle(options.id + "_dialogCancel", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback(false);
    });
}

declare const DIALOG_PROMPT_WEBPACK_ENTRY: string;
declare const DIALOG_PROMPT_PRELOAD_WEBPACK_ENTRY: string;

export async function prompt(
    options: PromptOptions,
): Promise<string> {
    return new Promise((resolve: (result: string) => void) => {
        promptSync(options, resolve);
    });
}

export function promptSync(
    options: PromptOptions,
    callback?: ((result: string) => void)
): void {
    options.id = new Date().getTime() + "_" + options.id;
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 100,
        parent: global.win,
        webPreferences: {
            devTools: DEV_TOOLS_ENABLED,
            preload: DIALOG_PROMPT_PRELOAD_WEBPACK_ENTRY,
            additionalArguments: [JSON.stringify(options)]
        }
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, windowOptions)
    );
    customDialogWin.loadURL(DIALOG_PROMPT_WEBPACK_ENTRY);

    customDialogWin.on("close", () => {
        if (callback != undefined) callback(undefined);
    });

    ipcMain.removeHandler(options.id + "_dialogResize");
    ipcMain.handle(options.id + "_dialogResize",
        (_event: IpcMainInvokeEvent, height: number) => {
            customDialogWin.setContentSize(360, height);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogOk");
    ipcMain.handle(options.id + "_dialogOk",
        (_event: IpcMainInvokeEvent, value: string) => {
            customDialogWin.destroy();
            if (callback != undefined) callback(value);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogCancel");
    ipcMain.handle(options.id + "_dialogCancel", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback(undefined);
    });
}