import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import path from "path";

const WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
    resizable: false,
    modal: true,
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    darkTheme: true,
    webPreferences: {
        devTools: false
    }
}

export function alert(
    parentWindow: BrowserWindow,
    options: {
        body: string,
        title?: string // ?
    }
): void {
    const alertOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 85, // 115, //TODO: Constant sizing wont work for windows with more than one line
        parent: parentWindow,
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, alertOptions)
    );
    customDialogWin.loadFile(path.join(
        __dirname,
        "custom-dialogs/alert.html"
    ));
    console.log(options);
}

export function confirm(
    parentWindow: BrowserWindow,
    options: {
        body: string,
        title?: string // ?
        callback?: ((result: boolean) => void),
    }
): void {
    const alertOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 85, // 115, //TODO: Constant sizing wont work for windows with more than one line
        parent: parentWindow,
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, alertOptions)
    );
    customDialogWin.loadFile(path.join(
        __dirname,
        "custom-dialogs/confirm.html"
    ));
    console.log(options);
}

export function prompt(
    parentWindow: BrowserWindow,
    options: {
        body: string,
        title?: string // ?
        placeholder?: string,
        callback?: ((result: string) => void),
        invalidCharacters?: RegExp,
    }
): void {
    const alertOptions: BrowserWindowConstructorOptions = {
        width: 360,
        height: 107, //TODO: Constant sizing wont work for windows with more than one line
        parent: parentWindow,
    };
    const customDialogWin: BrowserWindow = new BrowserWindow(
        Object.assign({}, WINDOW_OPTIONS, alertOptions)
    );
    customDialogWin.loadFile(path.join(
        __dirname,
        "custom-dialogs/prompt.html"
    ));
    console.log(options);
}