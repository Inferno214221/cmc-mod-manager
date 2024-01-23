import {
    app, BrowserWindow, ipcMain, shell, protocol, ProtocolRequest, ProtocolResponse,
    IpcMainInvokeEvent
} from "electron";
import * as main from "./main";
import path from "path";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let win: BrowserWindow;

function createWindow(): void {
    win = new BrowserWindow({
        width: 1120,
        height: 630,
        minWidth: 810,
        minHeight: 600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        autoHideMenuBar: true,
    });
    win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    createHandlers();
    protocol.registerFileProtocol("img", (
        request: ProtocolRequest,
        callback: (response: string | ProtocolResponse) => void
    ) => {
        const url: string = request.url.replace("img://", "");
        return callback(url);
    });

    main.checkForUpdates();
}

if (require("electron-squirrel-startup")) {
    app.quit();
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function createHandlers(): void {
    Object.keys(main).forEach((func: keyof typeof import("./main")) => {
        // console.log("Creating Handler For: " + func);
        /* eslint-disable import/namespace */
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        if (typeof main[func] != "function") return;
        if (main[func].length == 0) {
            ipcMain.handle(
                func,
                // @ts-ignore: Expected 4-5 arguments, but got 0.
                (): Promise<ReturnType<typeof main[keyof typeof main]>> => main[func]()
            );
            return;
        }
        ipcMain.handle(
            func,
            (
                event: IpcMainInvokeEvent,
                args: Parameters<typeof main[keyof typeof main]>
            ): Promise<ReturnType<typeof main[keyof typeof main]>> => {
                // @ts-ignore: A spread argument must either have a tuple type or be passed to a
                // rest parameter.
                return main[func](...args);
            }
        );
    });
    ipcMain.handle("pathJoin", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof path.join>) => path.join(...args)
    );
    ipcMain.handle("openExternal", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof shell.openExternal>) => shell.openExternal(...args)
    );
}