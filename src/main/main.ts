import {
    BrowserWindow, IpcMainInvokeEvent, ProtocolRequest, ProtocolResponse, app, ipcMain, protocol,
    shell
} from "electron";
import path from "path";
import fs from "fs-extra";
import { OpState } from "../global/global";
import CMCMM from "../assets/icon.svg";
import * as buildInfo from "../../build.json";

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

import * as general from "./general";
import * as characters from "./characters";
import * as stages from "./stages";
import * as customDialogs from "./custom-dialogs";

general.loadAppData().then(() => global.gameDir = global.appData.dir);

if (!app.requestSingleInstanceLock()) {
    console.log("No App Single Instance Lock");
    app.exit();
} else {
    app.on("second-instance", (_event: Event, argv: string[]) => {
        general.handleURI(argv.find((arg: string) => arg.startsWith("cmcmm:")));
    });
}

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
            if (!(await customDialogs.confirm({
                id: "closeUnfinishedOperations",
                title: "CMC Mod Manager | Unfinished Operations",
                body: "Are you sure you want to close CMC Mod Manager? Some operations are " +
                    "unfinished and will be canceled if you close (or reload) the program.",
                okLabel: "Close Anyway",
                cancelLabel: "Cancel"
            }))) {
                return;
            }
        }
        global.confirmedClose = true;
        app.quit();
    });

    if (didUpdate) {
        customDialogs.alert({
            id: "postUpdate",
            title: "CMC Mod Manager | Post Update Message",
            body: "Thanks for updating CMC Mod Manager! The CMC Mod Manager website has also " +
                "been updated, so please consider checking it out: " +
                "https://inferno214221.com/cmc-mod-manager/ (a link is also available in the " +
                "'Home' tab). I've also setup a 'Buy Me A Coffee' page if you'd like to support " +
                "the project!"
        });
    }

    app.setAsDefaultProtocolClient("cmcmm");
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
