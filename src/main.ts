import {
    BrowserWindow, IpcMainInvokeEvent, ProtocolRequest, ProtocolResponse, app, ipcMain, protocol,
    shell
} from "electron";
import path from "path";
import fs from "fs-extra";
import { AppData, OpState, Operation } from "./interfaces";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

declare const global: {
    win: BrowserWindow,
    gameDir: string,
    log: string,
    appData: AppData,
    temp: string,
    confirmedClose: boolean
};

global.win = null;
global.gameDir = "";
global.log = "";
global.appData = null;
global.temp = path.join(app.getPath("temp"), "cmc-mod-manager");
global.confirmedClose = false;

import * as general from "./general";
import * as characters from "./characters";
import * as stages from "./stages";

if (!app.requestSingleInstanceLock()) {
    console.log("No App Single Instance Lock");
    app.exit();
} else {
    app.on("second-instance", (_event: Event, argv: string[]) => {
        general.handleURI(argv.find((arg: string) => arg.startsWith("cmcmm:")));
    });
    if (global.win) {
        if (global.win.isMinimized()) {
            global.win.restore();
        }
        global.win.focus();
    }
}

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
    ipcMain.handle(
        "pathJoin", (
            event: IpcMainInvokeEvent,
            args: Parameters<typeof path.join>
        ) => path.join(...args)
    );
    ipcMain.handle(
        "openExternal", (
            event: IpcMainInvokeEvent,
            args: Parameters<typeof shell.openExternal>
        ) => shell.openExternal(...args)
    );

    protocol.registerFileProtocol("img", (
        request: ProtocolRequest,
        callback: (response: string | ProtocolResponse) => void
    ) => {
        const url: string = request.url.replace("img://", "");
        return callback(url);
    });

    general.checkForUpdates();
    ipcMain.handleOnce(
        "handleProcessArgs", () => {
            console.log("handleProcessArgs");
            general.handleURI(process.argv.find((arg: string) => arg.startsWith("cmcmm:")));
            ipcMain.handle("handleProcessArgs", () => null);
        }
    );

    global.win.on("close", async (event: Event) => {
        if (global.confirmedClose) return;
        event.preventDefault();
        console.log(event);
        const operations: Operation[] = await getOperations();
        if (operations.filter((operation: Operation) =>
            operation.state == OpState.started || operation.state == OpState.queued
        ).length > 0) {
            if ((await general.confirm({
                title: "CMC Mod Manager | Unfinished Operations",
                body: "Are you sure you want to close CMC Mod Manager? Some operations are " +
                    "unfinished and will be cancelled if you close (or reload) the program.",
                okLabel: "Cancel",
                cancelLabel: "Close Anyway"
            }))) {
                return;
            }
        }
        global.confirmedClose = true;
        app.quit();
    });
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

app.on("before-quit", async () => {
    const toResolve: Promise<void>[] = [];
    toResolve.push(fs.remove(global.temp));
    if (global.log == "") return;
    const LOG_FILE: string = path.join(app.getPath("userData"), "log.txt");
    fs.ensureFileSync(LOG_FILE);
    toResolve.push(fs.appendFile(LOG_FILE, global.log));
    await Promise.allSettled(toResolve);
    // return?
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

export async function getOperations(): Promise<Operation[]> {
    return new Promise((resolve: (value: Operation[]) => void) => {
        ipcMain.removeHandler("getOperationsReturn");
        ipcMain.handleOnce("getOperationsReturn",
            (_event: IpcMainInvokeEvent, args: [Operation[]]) => {
                resolve(...args);
            }
        );
        global.win.webContents.send("getOperations");
    });
}