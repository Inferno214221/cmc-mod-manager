import {
    BrowserWindow, IpcMainInvokeEvent, ProtocolRequest, ProtocolResponse, app, ipcMain, protocol,
    shell
} from "electron";
import path from "path";
import fs from "fs-extra";
import { AppData, Download } from "./interfaces";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

declare const global: {
    win: BrowserWindow,
    gameDir: string,
    log: string,
    appData: AppData,
    downloads: Download[]
};

global.win = null;
global.gameDir = "";
global.log = "";
global.appData = null;
global.downloads = [];

import * as general from "./general";
import * as characters from "./characters";
import * as stages from "./stages";

function createWindow(): void {
    global.win = new BrowserWindow({
        width: 1120,
        height: 630,
        minWidth: 810,
        minHeight: 600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        autoHideMenuBar: true,
        darkTheme: true
    });
    global.win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    createHandlers(general);
    createHandlers(characters);
    createHandlers(stages);
    ipcMain.handle("pathJoin", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof path.join>) => path.join(...args)
    );
    ipcMain.handle("openExternal", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof shell.openExternal>) => shell.openExternal(...args)
    );

    protocol.registerFileProtocol("img", (
        request: ProtocolRequest,
        callback: (response: string | ProtocolResponse) => void
    ) => {
        const url: string = request.url.replace("img://", "");
        return callback(url);
    });

    general.checkForUpdates();
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

app.on("before-quit", () => {
    fs.removeSync(path.join(app.getPath("userData"), "_temp"));
    if (global.log == "") return;
    const LOG_FILE: string = path.join(app.getPath("userData"), "log.txt");
    fs.ensureFileSync(LOG_FILE);
    fs.appendFile(LOG_FILE, global.log);
});

function createHandlers(module: any): void {
    Object.keys(module).forEach((func: string & keyof typeof module) => {
        // console.log("Creating Handler For: " + func);
        /* eslint-disable import/namespace */
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        if (typeof module[func] != "function") return;
        if (module[func].length == 0) {
            ipcMain.handle(
                func,
                // @ts-ignore: Expected 4-5 arguments, but got 0.
                (): Promise<ReturnType<typeof module[keyof typeof module]>> => module[func]()
            );
            return;
        }
        ipcMain.handle(
            func,
            (
                event: IpcMainInvokeEvent,
                args: Parameters<typeof module[keyof typeof module]>
            ): Promise<ReturnType<typeof module[keyof typeof module]>> => {
                // @ts-ignore: A spread argument must either have a tuple type or be passed to a
                // rest parameter.
                return module[func](...args);
            }
        );
    });
}