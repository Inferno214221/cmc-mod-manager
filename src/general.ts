import {
    BrowserWindow, IpcMainInvokeEvent, OpenDialogReturnValue, app, dialog, ipcMain, shell
} from "electron";
import fs from "fs-extra";
import path from "path";
import extract from "extract-zip";
import { ArcFile, ArcFiles, Extractor, createExtractorFromFile } from "node-unrar-js/esm";
// import sevenZip from "node-7z-archive";
import { execFile, execSync, spawn } from "child_process";
import { AppConfig, AppData, ModType, OpState, Operation } from "./interfaces";
import request from "request";
import http from "http";
import util from "util";
import semver from "semver";

declare const global: {
    win: BrowserWindow,
    gameDir: string,
    log: string,
    appData: AppData,
    temp: string,
    confirmedClose: boolean,
    updateOnExit: boolean
};

require.resolve("./unrar.wasm");
const WASM_BINARY: Buffer = fs.readFileSync(path.join(__dirname, "unrar.wasm"));

import * as customDialogs from "./custom-dialogs";

const SUPPORTED_VERSIONS: string[] = [
    "CMC_v8",
    "CMC+ v8",
];

const DEFAULT_CONFIG: AppConfig = {
    enableLogs: false,
    altsAsCharacters: true,
    useUnbinner: false,
    moveBins: false,
    filterCharacterInstallation: true,
    updateCharacters: false,
    filterStageInstallation: true,
    updateStages: false
};

const DATA_FILE: string = path.join(app.getPath("userData"), "data.json");
if (!fs.existsSync(DATA_FILE)) {
    writeAppData({
        dir: "",
        config: DEFAULT_CONFIG
    });
} else {
    global.appData = readJSON(DATA_FILE);
    if (global.appData.config == undefined) {
        global.appData.config = DEFAULT_CONFIG;
    }
    writeAppData(global.appData);
}
global.appData = readJSON(DATA_FILE);

global.gameDir = global.appData.dir;

export function log(...objs: any[]): void {
    if (!global.appData.config.enableLogs) return;
    // console.log(...objs);
    objs.forEach((obj: any) => {
        global.log += util.inspect(obj) + "\n";
    });
    global.log += "\n--------------------\n\n";
}

export function readJSON(file: string): any {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export async function writeJSON(file: string, data: object): Promise<void> {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf-8");
    return;
}

export function readAppData(): AppData {
    return global.appData;
}

export async function writeAppData(data: AppData): Promise<void> {
    global.appData = data;
    await writeJSON(DATA_FILE, data);
    return;
}

export function isNumber(num: string): boolean {
    return /^\d+$/.test(num);
}

export function getAllFiles(dirPath: string, arrayOfFiles?: string[]): string[] {
    const files: string[] = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file: string) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

export async function extractArchive(archive: string, destination: string): Promise<string> {
    log("Extract Archive - Start:", archive, destination);
    const output: string = path.join(destination, path.parse(archive).name);
    fs.ensureDirSync(destination);
    fs.removeSync(output);
    switch (path.parse(archive).ext.toLowerCase()) {
        case ".zip":
            await extract(archive, {
                dir: output,
                defaultDirMode: 0o777,
                defaultFileMode: 0o777
            });
            break;
        case ".rar":
            const extractor: Extractor = await createExtractorFromFile({
                wasmBinary: WASM_BINARY,
                filepath: archive,
                targetPath: output
            });
            const extracted: ArcFiles = extractor.extract();
            log(extracted);
            const files: ArcFile[] = [...extracted.files];
            log(files);
            break;
        // case ".7z":
            //FIXME: doesn't work
            // await sevenZip.extractArchive(archive, output, {}, true);
            // break;
        default:
            throw new Error("Unsupported archive type: " + path.parse(archive).ext.toLowerCase());
    }
    log("Extract Archive - Return:", output);
    return output;
}

export async function checkForUpdates(): Promise<void> {
    const currentVersion: string = semver.clean(app.getVersion());
    // const currentVersion: string = semver.clean("v2.3.0");
    request.get("https://api.github.com/repos/Inferno214221/cmc-mod-manager/releases/latest", {
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CMC-Mod-Manager",
        }
    }, async (error: any, res: http.IncomingMessage, body: string) => {
        if (error != null) return;
        const latestVersion: string = semver.clean(JSON.parse(body).tag_name);
        console.log("Latest Version: " + latestVersion);
        if (semver.lt(currentVersion, latestVersion)) {
            global.win.webContents.send("addOperation", {
                uid: "update",
                title: "Download Update",
                body: "Downloading the latest version of CMC Mod Manager.",
                state: OpState.queued,
                icon: "update",
                animation: Math.floor(Math.random() * 3),
                dependencies: ["update"],
                call: {
                    name: "downloadUpdate",
                    args: [JSON.parse(body).tag_name]
                }
            });
            return;
        }
    });
}

export async function downloadUpdate(tagName: string): Promise<void> {
    //TODO: cancel/error operation properly
    if (!(await confirm({
        title: "CMC Mod Manager | Program Update",
        body: "CMC Mod Manager requires an update. This update will now be installed " +
            "automatically, please do not close the program. After the update is " +
            "installed the program will need to be launched again manually.",
        okLabel: "Continue"
    }))) return;
    const buildInfo: any = JSON.parse(fs.readFileSync(
        path.join(__dirname, "..", "..", "build.json"),
        "utf-8"
    ));
    const targetPath: string = path.join(global.temp, "update.zip");
    fs.createFileSync(targetPath);
    const targetStream: fs.WriteStream = fs.createWriteStream(targetPath);
    request.get("https://github.com/Inferno214221/cmc-mod-manager/releases/download/" + tagName +
        "/cmc-mod-manager-" + buildInfo.platform + "-" + buildInfo.arch + ".zip")
        .on("error", (error: Error) => {
            console.log(error);
            targetStream.close();
            throw new Error("A stream error occured: \"" + error.message + "\"");
        }).pipe(targetStream).on("close", async () => {
            if (targetStream.errored) return;
            //TODO: download progress
            //TODO: move to install operation which depends on all
            const updateDir: string = path.join(__dirname, "..", "..", "..", "..", "update");
            let updateTemp: string = path.join(global.temp, "update");
            await extractArchive(targetPath, updateTemp);
            while (
                fs.readdirSync(updateTemp).length == 1
            ) {
                updateTemp = path.join(updateTemp, fs.readdirSync(updateTemp)[0]);
            }
            fs.moveSync(updateTemp, updateDir, { overwrite: true });

            global.updateOnExit = true;
            app.quit();
            return;
        });
}

export function runUpdater(): void {
    if (!app.isPackaged) throw new Error("Cannot update in dev mode.");
    const buildInfo: any = JSON.parse(fs.readFileSync(
        path.join(__dirname, "..", "..", "build.json"),
        "utf-8"
    ));
    //FIXME: I should write a better way of finding the parent directory... this
    //could lead to issues
    const updateDir: string = path.join(__dirname, "..", "..", "..", "..", "update");
    const updaterDir: string = path.join(__dirname, "..", "..", "..", "..", "updater");
    if (!fs.existsSync(path.join(updateDir))) throw new Error("Update files not found.");
    if (
        fs.existsSync(path.join(updateDir, "updater")) &&
        fs.existsSync(path.join(updateDir, "updater", "update.sh")) &&
        fs.existsSync(path.join(updateDir, "updater", "update.bat"))
    ) {
        fs.removeSync(updaterDir);
        fs.copySync(path.join(updateDir, "updater"), updaterDir, { overwrite: true });
    }
    
    if (buildInfo.platform == "win32") {
        spawn(path.join(updaterDir, "update.bat"), {
            cwd: updaterDir,
            detached: true,
            stdio: ["ignore", "ignore", "ignore"]
        }).unref();
    } else if (buildInfo.platform == "linux") {
        execSync("chmod +x \"" + path.join(updaterDir, "update.sh")
            .replaceAll("\"", "\\\"").replaceAll("'", "\\'") + "\"");
        spawn(path.join(updaterDir, "update.sh"), {
            cwd: updaterDir,
            detached: true,
            stdio: ["ignore", "ignore", "ignore"]
        }).unref();
    }
    return;
}

export async function handleURI(uri: string): Promise<void> {
    // uri = "cmcmm:https://gamebanana.com/mmdl/1100547,idk,483478";
    // uri = "cmcmm:https://gamebanana.com/mmdl/1137848,idk,495311";
    if (uri == undefined || global.gameDir == null) {
        return;
    }
    const splitUri: string[] = uri.replace("cmcmm:", "").split(",");
    const url: string = splitUri[0];
    const modId: string = splitUri[2];
    global.win.webContents.send("addOperation", {
        uid: url,
        title: "Mod Download",
        body: "Downloading a mod from GameBanana.",
        image: "https://gamebanana.com/mods/embeddables/" + modId + "?type=medium_square",
        state: OpState.queued,
        icon: "download",
        animation: Math.floor(Math.random() * 3),
        dependencies: ["download"],
        call: {
            name: "downloadMod",
            args: [url, modId]
        }
    });
    return;
}

export async function downloadMod(url: string, modId: string): Promise<void> {
    return new Promise((resolve: () => void) => {
        console.log(url);
        const temp: string = global.temp;
        fs.ensureDirSync(temp);
        
        const infoPromise: Promise<string[]> = getDownloadInfo(modId);
        let file: string = "download_" + modId + ".";
        request.get(url)
            .on("error", (error: Error) => { log(error) })
            .on("response", async (res: request.Response) => {
                switch (res.headers["content-type"].split("/")[1]) {
                    case "zip":
                        file += "zip";
                        break;
                    case "rar":
                    case "x-rar-compressed":
                        file += "rar";
                        break;
                    default:
                        throw new Error(
                            "Invalid archive type: " + res.headers["content-type"].split("/")[1]
                        );
                }
                const filePath: string = path.join(temp, file);
                const modInfo: string[] = await Promise.resolve(infoPromise);
                let modType: ModType;
                switch (modInfo[1].toLowerCase()) {
                    case "characters":
                        modType = ModType.character;
                        break;
                    case "stages":
                        modType = ModType.stage;
                        break;
                    default:
                        throw new Error("Unknown mod type.");
                }

                const downloadSize: number = parseInt(res.headers["content-length"]);
                global.win.webContents.send("updateOperation", {
                    uid: url,
                    title: modType + " Download",
                    body: "Downloading mod: '" + modInfo[0] + "' from GameBanana. (0 / " +
                        toMb(downloadSize) + " mb)",
                });

                const downloadStream: fs.WriteStream = fs.createWriteStream(filePath);
                request.get(
                    res.request.uri.href
                ).on("error", (error: Error) => {
                    downloadStream.close();
                    throw error;
                }).pipe(downloadStream).on("close", async () => {
                    if (downloadStream.errored) return;
                    const output: string = await extractArchive(filePath, temp);
                    fs.removeSync(filePath);                    
                    global.win.webContents.send("updateOperation", {
                        uid: url,
                        body: "Downloaded mod: '" + modInfo[0] + "' from GameBanana.",
                        state: OpState.finished,
                    });
                    log(output);
                    resolve();
                    switch (modType) {
                        case ModType.character:
                            global.win.webContents.send("addOperation", {
                                uid: output,
                                title: "Character Installation",
                                body: "Installing character from GameBanana.",
                                image: "https://gamebanana.com/mods/embeddables/" + modId +
                                    "?type=medium_square",
                                state: OpState.queued,
                                icon: "contact_page",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: ["fighters"],
                                call: {
                                    name: "installDownloadedCharacter",
                                    args: [output]
                                }
                            });
                            break;
                        case ModType.stage:
                            global.win.webContents.send("addOperation", {
                                uid: output,
                                title: "Stage Installation",
                                body: "Installing stage from GameBanana.",
                                image: "https://gamebanana.com/mods/embeddables/" + modId +
                                    "?type=medium_square",
                                state: OpState.queued,
                                icon: "note_add",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: ["stages"],
                                call: {
                                    name: "installDownloadedStage",
                                    args: [output]
                                }
                            });
                            break;
                    }
                });

                updateDownloadProgress(url, modInfo, downloadStream, downloadSize);
            });
    });
}

export function updateDownloadProgress(
    url: string,
    modInfo: string[],
    downloadStream: fs.WriteStream,
    downloadSize: number
): void {
    setTimeout(() => {
        if (downloadStream.closed || downloadStream.errored) return;
        if (downloadStream.bytesWritten < downloadSize) {
            global.win.webContents.send("updateOperation", {
                uid: url,
                body: "Downloading mod: '" + modInfo[0] + "' from GameBanana. (" +
                    toMb(downloadStream.bytesWritten) + " / " + toMb(downloadSize) + " mb)",
            });
            updateDownloadProgress(url, modInfo, downloadStream, downloadSize);
        }
    }, 1000);
}

export function toMb(bytes: number): number {
    return Math.floor(bytes / 10000) / 100;
}

export async function getDownloadInfo(modId: string): Promise<string[]> {
    if (modId == undefined) {
        //TODO:
        return;
    }
    return new Promise((resolve: (value: string[]) => void) => {
        request.get(
            {
                url: "https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&itemid=" +
                    modId + "&fields=name,RootCategory().name"
            },
            async (error: any, res: http.IncomingMessage, body: string) => {
                if (error != null) return;
                resolve(JSON.parse(body));
            }
        );
    });
}

export async function getOperations(): Promise<Operation[]> {
    return new Promise((resolve: (value: Operation[]) => void) => {
        ipcMain.removeHandler("getOperationsReturn");
        ipcMain.handleOnce("getOperationsReturn",
            (_event: IpcMainInvokeEvent, args: [string]) => {
                resolve(JSON.parse(args[0]));
            }
        );
        global.win.webContents.send("getOperations");
    });
}

export function getGameDir(): string {
    return global.gameDir;
}

export function getExtractedDir(): string {
    return path.join(global.gameDir, "0extracted");
}

export function getGameVersion(
    dir: string = global.gameDir,
    list: string[] = SUPPORTED_VERSIONS
): string | null {
    if (dir == null) {
        return null;
    }
    for (const game of list) {
        if (fs.existsSync(path.join(dir, game + ".exe"))) {
            return game;
        }
    }
    return null;
}

export async function isValidGameDir(dir: string = global.gameDir): Promise<boolean> {
    return (dir != null && getGameVersion(dir) != null);
}

export async function selectGameDir(): Promise<string | null> {
    log("Select Game Dir - Start");
    const dir: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        properties: ["openDirectory"]
    });
    if (dir.canceled == true) {
        log("Select Game Dir - Exit: Selection Cancelled");
        return null;
    }
    if (!await isValidGameDir(dir.filePaths[0])) {
        //TODO: inform the user
        log("Select Game Dir - Exit: Invalid Game Dir");
        return null;
    }

    getAllFiles(dir.filePaths[0]).forEach((file: string) => {
        fs.chmod(file, 0o777);
    });
    global.gameDir = dir.filePaths[0];
    global.appData = readJSON(DATA_FILE);
    global.appData.dir = global.gameDir;
    writeAppData(global.appData);
    log("Select Game Dir - Return:", global.gameDir);
    return global.gameDir;
}

export async function openDir(dir: string): Promise<void> {
    await shell.openPath(dir);
    return;
}

export async function runGame(dir: string = global.gameDir): Promise<void> {
    execFile(path.join(dir, getGameVersion(global.gameDir) + ".exe"), {
        cwd: dir,
        windowsHide: true
    });
    return;
}

export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function alert(options: customDialogs.AlertOptions): Promise<void> {
    return customDialogs.alert(global.win, options);
}

export async function confirm(options: customDialogs.ConfirmOptions): Promise<boolean> {
    return customDialogs.confirm(global.win, options);
}

export async function prompt(options: customDialogs.PromptOptions): Promise<string> {
    return customDialogs.prompt(global.win, options);
}