import {
    BrowserWindow, IpcMainInvokeEvent, ProtocolRequest, ProtocolResponse, app, ipcMain, protocol,
    shell
} from "electron";
import path from "path";
import fs from "fs-extra";
import { OpState } from "../global/global";
import CMCMM from "../assets/icon.svg";
import * as buildInfo from "../../build.json";
import { translations } from "../global/translations";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

global.win = null;
global.dialogs = [];
global.gameDir = "";
global.appDir = app.isPackaged ?
    path.parse(app.getPath("exe")).dir :
    path.join(path.parse(app.getPath("exe")).dir, "..", "..", "..");
global.temp = path.join(app.getPath("temp"), "cmc-mod-manager");
global.confirmedClose = false;
global.updateOnExit = false;
global.cancelFunctions = {};
global.platform = buildInfo.platform;
global.arch = buildInfo.arch;

import * as appData from "./basic-fs";

let general: typeof import("./general");
let characters: typeof import("./characters");
let stages: typeof import("./stages");
let customDialogs: typeof import("./custom-dialogs");

appData.loadAppData().then(async () => {
    global.gameDir = global.appData.dir;
    global.language = global.appData.config.language;

    general = await import("./general");
    characters = await import("./characters");
    stages = await import("./stages");
    customDialogs = await import("./custom-dialogs");
    
    const { message }: ReturnType<typeof translations> = translations(global.language);

    if (!app.requestSingleInstanceLock()) {
        console.log(message("error.noSingleInstanceLock"));
        app.exit();
    } else {
        app.on("second-instance", (_event: Event, argv: string[]) => {
            general.handleURI(argv.find((arg: string) => arg.startsWith("cmcmm:")));
        });
    }

    if (app.isReady()) {
        createWindow()
    } else {
        app.on("ready", createWindow);
    }
});

async function createWindow(): Promise<void> {
    const updateDir: string = path.join(global.appDir, "update");
    const didUpdate: boolean = await fs.exists(updateDir);
    if (didUpdate) {
        fs.remove(updateDir);
    }

    global.win = new BrowserWindow({
        width: 1120,
        height: 630,
        minWidth: 810,
        minHeight: 600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        autoHideMenuBar: true,
        darkTheme: true,
        icon: CMCMM
    });
    global.win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    createHandlers(general);
    createHandlers(characters);
    createHandlers(stages);
    createHandlers(customDialogs);
    ipcMain.handle(
        "pathJoin", (
            _event: IpcMainInvokeEvent,
            args: Parameters<typeof path.join>
        ) => path.join(...args)
    );
    ipcMain.handle(
        "openExternal", (
            _event: IpcMainInvokeEvent,
            args: Parameters<typeof shell.openExternal>
        ) => shell.openExternal(...args)
    );

    protocol.registerFileProtocol("img", async (
        request: ProtocolRequest,
        callback: (response: string | ProtocolResponse) => void
    ) => {
        const url: string = request.url.replace("img://", "");
        if (await fs.pathExists(url)) return callback(url);
        const parsedUrl: path.ParsedPath = path.parse(url);
        if (!(await fs.pathExists(parsedUrl.dir))) return callback("MISSING");

        const dirContents: string[] = await fs.readdir(parsedUrl.dir);
        const filePat: RegExp = new RegExp("^" + general.escapeRegex(parsedUrl.base) + "$", "i");
        const filtered: string[] = dirContents.filter((file: string) => filePat.test(file));
        if (filtered.length > 0) return callback(path.join(parsedUrl.dir, filtered[0]));
        return callback("MISSING");
    });

    general.checkForUpdates();
    ipcMain.handleOnce(
        "handleProcessArgs", () => {
            general.handleURI(process.argv.find((arg: string) => arg.startsWith("cmcmm:")));
            ipcMain.handle("handleProcessArgs", () => null);
        }
    );

    global.win.on("close", async (event: Event) => {
        if (global.updateOnExit) {
            general.runUpdater();
            return;
        }
        if (global.confirmedClose) return;
        event.preventDefault();
        const operations: Operation[] = await general.getOperations();
        if (operations.filter((operation: Operation) =>
            operation.state == OpState.STARTED || operation.state == OpState.QUEUED
        ).length > 0) {
            if (!(await customDialogs.confirm("closeUnfinishedOperations"))) {
                return;
            }
        }
        global.confirmedClose = true;
        app.quit();
    });

    if (didUpdate) {
        customDialogs.alert("postUpdate");
    }

    app.setAsDefaultProtocolClient("cmcmm");
}

if (require("electron-squirrel-startup")) {
    app.quit();
}

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
    await fs.remove(global.temp);
});

function createHandlers(module: any): void {
    /* eslint-disable import/namespace */
    Object.keys(module).forEach((func: string & keyof typeof module) => {
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
                _event: IpcMainInvokeEvent,
                args: Parameters<typeof module[keyof typeof module]>
            ): Promise<ReturnType<typeof module[keyof typeof module]>> => {
                // @ts-ignore: A spread argument must either have a tuple type or be passed to a
                // rest parameter.
                return module[func](...args);
            }
        );
    });
}
