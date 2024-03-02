import {
    BrowserWindow, BrowserWindowConstructorOptions, IpcMainInvokeEvent, ipcMain
} from "electron";
import path from "path";

const WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
    resizable: false,
    modal: true,
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    darkTheme: true
}

const PRELOAD_SCRIPT: string = path.join(__dirname, "custom-dialogs/custom-dialogs-preload.js");

export type AlertOptions = {
    id: string,
    body: string,
    title?: string,
    okLabel?: string
};

export async function alert(
    parentWindow: BrowserWindow,
    options: AlertOptions
): Promise<void> {
    return new Promise((resolve: () => void) => {
        alertSync(parentWindow, options, resolve);
    });
}

export function alertSync(
    parentWindow: BrowserWindow,
    options: AlertOptions,
    callback?: (() => void)
): void {
    options.id = new Date().getTime() + "_" + options.id;
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 0,
        parent: parentWindow,
        webPreferences: {
            devTools: false,
            preload: PRELOAD_SCRIPT
        }
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, windowOptions)
    );
    customDialogWin.loadFile(path.join(
        __dirname,
        "custom-dialogs/alert.html"
    ));

    customDialogWin.on("ready-to-show", () => {
        customDialogWin.webContents.send("dialogOnStart", options);
    });

    customDialogWin.on("close", () => {
        if (callback != undefined) callback();
    });

    ipcMain.removeHandler(options.id + "_dialogResize");
    ipcMain.handleOnce(options.id + "_dialogResize",
        (_event: IpcMainInvokeEvent, height: number) => {
            customDialogWin.setContentSize(360, height);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogOk");
    ipcMain.handleOnce(options.id + "_dialogOk", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback();
    });
}

export type ConfirmOptions = {
    id: string,
    body: string,
    title?: string,
    okLabel?: string,
    cancelLabel?: string
};

export async function confirm(
    parentWindow: BrowserWindow,
    options: ConfirmOptions
): Promise<boolean> {
    return new Promise((resolve: (result: boolean) => void) => {
        confirmSync(parentWindow, options, resolve);
    });
}

export function confirmSync(
    parentWindow: BrowserWindow,
    options: ConfirmOptions,
    callback?: ((result: boolean) => void)
): void {
    options.id = new Date().getTime() + "_" + options.id;
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 0,
        parent: parentWindow,
        webPreferences: {
            devTools: false,
            preload: PRELOAD_SCRIPT
        }
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, windowOptions)
    );
    customDialogWin.loadFile(path.join(
        __dirname,
        "custom-dialogs/confirm.html"
    ));

    customDialogWin.on("ready-to-show", () => {
        customDialogWin.webContents.send("dialogOnStart", options);
    });

    customDialogWin.on("close", () => {
        if (callback != undefined) callback(undefined);
    });

    ipcMain.removeHandler(options.id + "_dialogResize");
    ipcMain.handleOnce(options.id + "_dialogResize",
        (_event: IpcMainInvokeEvent, height: number) => {
            customDialogWin.setContentSize(360, height);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogOk");
    ipcMain.handleOnce(options.id + "_dialogOk", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback(true);
    });

    ipcMain.removeHandler(options.id + "_dialogCancel");
    ipcMain.handleOnce(options.id + "_dialogCancel", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback(false);
    });
}

export type PromptOptions = {
    id: string,
    body: string,
    title?: string,
    placeholder?: string,
    invalidCharacters?: RegExp,
    okLabel?: string,
    cancelLabel?: string
};

export async function prompt(
    parentWindow: BrowserWindow,
    options: PromptOptions,
): Promise<string> {
    return new Promise((resolve: (result: string) => void) => {
        promptSync(parentWindow, options, resolve);
    });
}

export function promptSync(
    parentWindow: BrowserWindow,
    options: PromptOptions,
    callback?: ((result: string) => void)
): void {
    options.id = new Date().getTime() + "_" + options.id;
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 0,
        parent: parentWindow,
        webPreferences: {
            devTools: false,
            preload: PRELOAD_SCRIPT
        }
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, windowOptions)
    );
    customDialogWin.loadFile(path.join(
        __dirname,
        "custom-dialogs/prompt.html"
    ));

    customDialogWin.on("ready-to-show", () => {
        customDialogWin.webContents.send("dialogOnStart", options);
    });

    customDialogWin.on("close", () => {
        if (callback != undefined) callback(undefined);
    });

    ipcMain.removeHandler(options.id + "_dialogResize");
    ipcMain.handleOnce(options.id + "_dialogResize",
        (_event: IpcMainInvokeEvent, height: number) => {
            customDialogWin.setContentSize(360, height);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogOk");
    ipcMain.handleOnce(options.id + "_dialogOk",
        (_event: IpcMainInvokeEvent, value: string) => {
            customDialogWin.destroy();
            if (callback != undefined) callback(value);
        }
    );

    ipcMain.removeHandler(options.id + "_dialogCancel");
    ipcMain.handleOnce(options.id + "_dialogCancel", () => {
        customDialogWin.destroy();
        if (callback != undefined) callback(undefined);
    });
}