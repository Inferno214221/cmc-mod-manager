import {
    IpcMainInvokeEvent, OpenDialogReturnValue, app, dialog, ipcMain, shell
} from "electron";
import fs from "fs-extra";
import path from "path";
import extract from "extract-zip";
import { ArcFile, ArcFiles, Extractor, createExtractorFromFile } from "node-unrar-js/esm";
// import sevenZip from "node-7z-archive";
import { execSync, spawn } from "child_process";
import request from "request";
import http from "http";
import util from "util";
import semver from "semver";
import { ModType, OpDep, OpState } from "../global/global";

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
    filterCharacterInstallation: true,
    updateCharacters: false,
    filterStageInstallation: true,
    updateStages: false
};

const DATA_FILE: string = path.join(app.getPath("userData"), "data.json");

export function loadAppData(): void {
    if (!fs.existsSync(DATA_FILE)) {
        writeAppData({
            dir: "",
            config: DEFAULT_CONFIG
        });
    } else {
        global.appData = readJSON(DATA_FILE);
        if (global.appData.config == undefined) {
            global.appData.config = DEFAULT_CONFIG;
        } else {
            Object.keys(DEFAULT_CONFIG).forEach((key: keyof AppConfig) => {
                if (global.appData.config[key] == undefined) {
                    global.appData.config[key] = DEFAULT_CONFIG[key];
                }
            });
        }
        writeAppData(global.appData);
    }
    global.appData = readJSON(DATA_FILE);
}

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
    request.get("https://api.github.com/repos/Inferno214221/cmc-mod-manager/releases", {
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CMC-Mod-Manager",
        }
    }, async (error: any, res: http.IncomingMessage, body: string) => {
        if (error != null) return;
        const releases: any[] = JSON.parse(body).toSorted((a: any, b: any) => {
            if (!semver.valid(a.tag_name)) {
                return 1;
            } else if (!semver.valid(b.tag_name)) {
                return -1;
            }
            return (semver.gte(a.tag_name, b.tag_name) ? -1 : 1);
        });
        const latestVersion: string = semver.clean(releases[0].tag_name);
        console.log("Latest Version: " + latestVersion);
        const id: string = new Date().getTime() + "_downloadUpdate";
        if (semver.lt(currentVersion, latestVersion)) {
            if (semver.prerelease(latestVersion)) {
                if (!semver.prerelease(currentVersion)) {
                    return;
                }
            }
            global.win.webContents.send("addOperation", {
                id: id,
                title: "Download Update",
                body: "Downloading the latest version of CMC Mod Manager.",
                state: OpState.queued,
                icon: "download",
                animation: Math.floor(Math.random() * 3),
                dependencies: [],
                call: {
                    name: "downloadUpdate",
                    args: [releases[0].tag_name, id]
                }
            });
            return;
        }
    });
}

export async function downloadUpdate(tagName: string, id: string): Promise<void> {
    if (!(await customDialogs.confirm({
        id: "confirmUpdate",
        title: "CMC Mod Manager | Program Update",
        body: "CMC Mod Manager requires an update. This update will now be installed " +
            "automatically. This update will remove all files within CMC Mod Manager's " +
            "directory, if this is problematic, please cancel this update and remove any " +
            "affected files.",
        okLabel: "Continue"
    })) || await dirContainedWithinSelf()) {
        global.win.webContents.send("updateOperation", {
            id: id,
            state: OpState.canceled
        });
        return;
    }
    const buildInfo: any = JSON.parse(fs.readFileSync(
        path.join(__dirname, "..", "..", "build.json"),
        "utf-8"
    ));
    const targetPath: string = path.join(global.temp, "update.zip");
    fs.createFileSync(targetPath);
    const targetStream: fs.WriteStream = fs.createWriteStream(targetPath);
    const url: string = "https://github.com/Inferno214221/cmc-mod-manager/releases/download/" +
        tagName + "/cmc-mod-manager-" + buildInfo.platform + "-" + buildInfo.arch + ".zip";
    request.get(url)
        .on("error", (error: Error) => {
            console.log(error);
            targetStream.close();
            throw new Error("A stream error occured: \"" + error.message + "\"");
        }).on("response", (res: request.Response) => {
            const downloadSize: number = parseInt(res.headers["content-length"]);
            updateDownloadProgress(
                id,
                "Downloading the latest version of CMC Mod Manager.",
                targetStream,
                downloadSize
            );
        }).pipe(targetStream).on("close", async () => {
            if (targetStream.errored) return;
            global.win.webContents.send("updateOperation", {
                id: id,
                title: "Update Downloaded",
                body: "Downloaded the latest version of CMC Mod Manager.",
                state: OpState.finished
            });
            if (app.isPackaged) {
                const updateDir: string = path.join(global.appDir, "update");
                let updateTemp: string = path.join(global.temp, "update");
                await extractArchive(targetPath, updateTemp);
                while (
                    fs.readdirSync(updateTemp).length == 1
                ) {
                    updateTemp = path.join(updateTemp, fs.readdirSync(updateTemp)[0]);
                }
                fs.moveSync(updateTemp, updateDir, { overwrite: true });
            }

            const installId: string = new Date().getTime() + "_installUpdate";
            global.win.webContents.send("addOperation", {
                id: installId,
                title: "Install Update",
                body: "Installing the latest version of CMC Mod Manager.",
                state: OpState.queued,
                icon: "install_desktop",
                animation: Math.floor(Math.random() * 3),
                dependencies: [],
                call: {
                    name: "installUpdate",
                    args: [installId]
                }
            });
            return;
        });
}

export function installUpdate(id: string): void {
    if (!app.isPackaged) throw new Error("Cannot update in dev mode.");
    const updateDir: string = path.join(global.appDir, "update");
    const updaterDir: string = path.join(global.appDir, "updater");
    if (!fs.existsSync(path.join(updateDir))) throw new Error("Update files not found.");
    if (
        fs.existsSync(path.join(updateDir, "updater")) &&
        fs.existsSync(path.join(updateDir, "updater", "update.sh")) &&
        fs.existsSync(path.join(updateDir, "updater", "update.bat"))
    ) {
        fs.removeSync(updaterDir);
        fs.copySync(path.join(updateDir, "updater"), updaterDir, { overwrite: true });
    }
    global.updateOnExit = true;
    global.win.webContents.send("updateOperation", {
        id: id,
        body: "Please close CMC Mod Manager to finish the update.",
        state: OpState.finished
    });
    return;
}

export function runUpdater(): void {
    if (!app.isPackaged) throw new Error("Cannot update in dev mode.");
    const buildInfo: any = JSON.parse(fs.readFileSync(
        path.join(__dirname, "..", "..", "build.json"),
        "utf-8"
    ));
    const updaterDir: string = path.join(global.appDir, "updater");
    
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
    if (uri == undefined || global.gameDir == null) {
        return;
    }
    const splitUri: string[] = uri.replace("cmcmm:", "").split(",");
    if (splitUri[1].toLowerCase() != "mod") return;
    const url: string = splitUri[0];
    const modId: string = splitUri[2];
    const id: string = modId + "_" + new Date().getTime();

    global.win.webContents.send("showNotification", "1-Click Download Initialised", {
        body: "Downloading mod with id: '" + modId + "' from GameBanana."
    }, {
        name: "focusWindow",
        args: []
    });

    global.win.webContents.send("addOperation", {
        id: id + "_download",
        title: "Mod Download",
        body: "Downloading a mod from GameBanana.",
        image: "https://gamebanana.com/mods/embeddables/" + modId + "?type=medium_square",
        state: OpState.queued,
        icon: "download",
        animation: Math.floor(Math.random() * 3),
        dependencies: [],
        call: {
            name: "downloadMod",
            args: [url, modId, id]
        }
    });
    return;
}

export function focusWindow(): void {
    if (global.win) {
        if (global.win.isMinimized()) {
            global.win.restore();
        }
        global.win.setAlwaysOnTop(true);
        global.win.show();
        global.win.focus();
        app.focus();
        global.win.setAlwaysOnTop(false);
    }
}

//TODO: split this function up
export async function downloadMod(url: string, modId: string, id: string): Promise<void> {
    return new Promise((resolve: () => void) => {
        console.log(url);
        fs.ensureDirSync(global.temp);
        
        const infoPromise: Promise<string[]> = getDownloadInfo(modId);
        let file: string = id + "_download.";
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
                const filePath: string = path.join(global.temp, file);
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
                    id: id + "_download",
                    title: modType + " Download",
                    body: "Downloading mod: '" + modInfo[0] + "' from GameBanana. (0 / " +
                        toMb(downloadSize) + " mb)",
                });

                const downloadStream: fs.WriteStream = fs.createWriteStream(filePath);
                let canceled: boolean = false;
                const req: any = request.get(
                    res.request.uri.href
                ).on("error", (error: Error & { code: string }) => {
                    downloadStream.close();
                    if (canceled) return;
                    throw error;
                });

                global.cancelFunctions[id + "_download"] = (() => {
                    req.abort();
                    canceled = true;
                    global.win.webContents.send("updateOperation", {
                        id: id + "_download",
                        state: OpState.canceled,
                    });
                    delete global.cancelFunctions[id + "_download"];
                });
                global.win.webContents.send("updateOperation", {
                    id: id + "_download",
                    cancelable: true,
                });

                req.pipe(downloadStream).on("close", async () => {
                    delete global.cancelFunctions[id + "_download"];
                    if (downloadStream.errored || canceled) return;
                    const output: string = await extractArchive(filePath, global.temp);
                    fs.removeSync(filePath);                    
                    global.win.webContents.send("updateOperation", {
                        id: id + "_download",
                        body: "Downloaded mod: '" + modInfo[0] + "' from GameBanana.",
                        state: OpState.finished,
                    });
                    log(output);
                    resolve();
                    switch (modType) {
                        case ModType.character:
                            global.win.webContents.send("addOperation", {
                                id: id + "_install",
                                title: "Character Installation",
                                body: "Installing character from GameBanana.",
                                image: "https://gamebanana.com/mods/embeddables/" + modId +
                                    "?type=medium_square",
                                state: OpState.queued,
                                icon: "contact_page",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [OpDep.fighters],
                                call: {
                                    name: "installDownloadedCharacter",
                                    args: [output, id]
                                }
                            });
                            break;
                        case ModType.stage:
                            global.win.webContents.send("addOperation", {
                                id: id + "_install",
                                title: "Stage Installation",
                                body: "Installing stage from GameBanana.",
                                image: "https://gamebanana.com/mods/embeddables/" + modId +
                                    "?type=medium_square",
                                state: OpState.queued,
                                icon: "note_add",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [OpDep.stages],
                                call: {
                                    name: "installDownloadedStage",
                                    args: [output, id]
                                }
                            });
                            break;
                    }
                });

                updateDownloadProgress(
                    id + "_download",
                    "Downloading mod: '" + modInfo[0] + "' from GameBanana.",
                    downloadStream,
                    downloadSize
                );
            });
    });
}

export function updateDownloadProgress(
    id: string,
    body: string,
    downloadStream: fs.WriteStream,
    downloadSize: number
): void {
    setTimeout(() => {
        if (downloadStream.closed || downloadStream.errored) return;
        if (downloadStream.bytesWritten < downloadSize) {
            global.win.webContents.send("updateOperation", {
                id: id,
                body: body + " (" + toMb(downloadStream.bytesWritten) + " / " +
                    toMb(downloadSize) + " mb)",
            });
            updateDownloadProgress(id, body, downloadStream, downloadSize);
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
        ipcMain.removeHandler("getOperations");
        ipcMain.handleOnce("getOperations",
            (_event: IpcMainInvokeEvent, args: [string]) => {
                resolve(JSON.parse(args[0]));
            }
        );
        global.win.webContents.send("getOperations");
    });
}

export function cancelOperation(id: string): void {
    if (id == undefined || global.cancelFunctions[id] == undefined) return;
    return global.cancelFunctions[id]();
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

export async function dirContainedWithinSelf(dir: string = global.gameDir): Promise<boolean> {
    const relativePath: string = path.relative(global.appDir, path.resolve(dir));
    if (!relativePath || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))) {
        customDialogs.alert({
            id: "modManagerContainedDirWarning",
            body: "The selected game directory is contained within CMC Mod Manager's own " +
                "directory. CMC Mod Manager deletes all files within this directory when " +
                "updating, so it cannot be used to store your game files, please move them to " +
                "a different location.",
            title: "Invalid Game Location Warning",
        });
        return true;
    }
    return false;
}

export async function isValidGameDir(dir: string = global.gameDir): Promise<boolean> {
    return (dir == null || getGameVersion(dir) != null || !await dirContainedWithinSelf(dir));
}

export async function selectGameDir(): Promise<string | null> {
    log("Select Game Dir - Start");
    const dir: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        properties: ["openDirectory"]
    });
    if (dir.canceled == true) {
        log("Select Game Dir - Exit: Selection Canceled");
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
    spawn(path.join(dir, getGameVersion(global.gameDir) + ".exe"), {
        cwd: dir,
        windowsHide: true,
        detached: true
    }).unref();
    return;
}

export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}