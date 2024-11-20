import {
    BrowserWindow, IpcMainInvokeEvent, OpenDialogReturnValue, app, dialog, ipcMain, shell
} from "electron";
import fs from "fs-extra";
import path from "path";
import extract from "extract-zip";
import { ArcFile, ArcFiles, Extractor, createExtractorFromFile } from "node-unrar-js/esm";
import { execSync, spawn } from "child_process";
import request from "request";
import http from "http";
import semver from "semver";
import { ModTypes, OpDep, OpState, error } from "../global/global";

require.resolve("./unrar.wasm");
const WASM_BINARY: Buffer = fs.readFileSync(path.join(__dirname, "unrar.wasm"));

import * as characters from "./characters";
import * as stages from "./stages";
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

export function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const contents: string[] = fs.readdirSync(dirPath);

    contents.forEach((file: string) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

export async function extractArchive(archive: string, destination: string): Promise<string> {
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
            // None of the following code can be removed
            const extracted: ArcFiles = extractor.extract();
            const files: ArcFile[] = [...extracted.files];
            console.log(files);
            // This log statement included because of how the generator works
            break;
        default:
            throw new Error("Unsupported archive type: " + path.parse(archive).ext.toLowerCase());
    }
    return output;
}

export async function selectPathsArch(): Promise<string[]> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        filters: [
            { name: "Archives", extensions: ["zip", "rar"] },
            { name: "All Files", extensions: ["*"] }
        ],
        properties: ["openFile", "multiSelections"]
    });
    if (selected.filePaths == undefined) return [];
    const promises: Promise<string>[] = selected.filePaths.map(
        (archive: string) => extractArchive(
            archive,
            global.temp
        )
    );
    const resolved: string[] = await Promise.all(promises);
    // This is probably the same as awaiting in the map, but I'm not sure about unrar
    return resolved;
}

export async function selectPathsDir(): Promise<string[]> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        properties: ["openDirectory", "multiSelections"]
    });
    return selected.filePaths || [];
}

export async function checkForUpdates(): Promise<void> {
    const currentVersion: string = semver.clean(app.getVersion()) ??
        error("Invalid semver string: '" + app.getVersion() + "'");
    request.get("https://api.github.com/repos/Inferno214221/cmc-mod-manager/releases", {
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CMC-Mod-Manager",
        }
    }, async (err: any, _res: http.IncomingMessage, body: string) => {
        if (err != null) return;
        const releases: any[] = JSON.parse(body).toSorted((a: any, b: any) => {
            if (!semver.valid(a.tag_name)) {
                return 1;
            } else if (!semver.valid(b.tag_name)) {
                return -1;
            }
            return (semver.gte(a.tag_name, b.tag_name) ? -1 : 1);
        });
        const latestVersion: string = semver.clean(releases[0].tag_name) ??
            error("Invalid semver string: '" + app.getVersion() + "'");
        console.log("Latest Version: " + latestVersion);
        const id: string = "downloadUpdate_" + Date.now();
        if (semver.lt(currentVersion, latestVersion)) {
            if (semver.prerelease(latestVersion)) {
                if (!semver.prerelease(currentVersion)) {
                    return;
                }
            }

            try {
                fs.accessSync(global.appDir, fs.constants.W_OK | fs.constants.X_OK);
            } catch (error: any) {
                addOperation({
                    id: id,
                    title: "Download Update",
                    body: `Due to the way CMC Mod Manager has been installed, it can't be updated
                        automatically. Please download the latest version from GitHub or GameBanana.
                        (Check the Home tab for links.)`,
                    state: OpState.ERROR,
                    icon: "download",
                    animation: Math.floor(Math.random() * 3),
                    dependencies: [],
                    call: undefined
                });
                return;
            }

            addOperation({
                id: id,
                title: "Download Update",
                body: "Downloading the latest version of CMC Mod Manager.",
                state: OpState.QUEUED,
                icon: "download",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.USER],
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
    })) || isSelfContainedDir()) {
        if (isSelfContainedDir()) alertSelfContainedDir();
        updateOperation({
            id: id,
            state: OpState.CANCELED
        });
        return;
    }
    const targetPath: string = path.join(global.temp, "update.zip");
    fs.createFileSync(targetPath);
    const targetStream: fs.WriteStream = fs.createWriteStream(targetPath);
    const url: string = "https://github.com/Inferno214221/cmc-mod-manager/releases/download/" +
        tagName + "/cmc-mod-manager-" + global.platform + "-" + global.arch + ".zip";
    request.get(url)
        .on("error", (err: Error) => {
            console.log(err);
            targetStream.close();
            throw new Error("A stream error occurred: \"" + err.message + "\"");
        }).on("response", (res: request.Response) => {
            const downloadSize: number = parseInt(res.headers["content-length"] ?? "");
            updateDownloadProgress(
                id,
                "Downloading the latest version of CMC Mod Manager.",
                targetStream,
                downloadSize
            );
        }).pipe(targetStream).on("close", async () => {
            if (targetStream.errored) return;
            updateOperation({
                id: id,
                title: "Update Downloaded",
                body: "Downloaded the latest version of CMC Mod Manager.",
                state: OpState.FINISHED
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

            const installId: string = "installUpdate_" + Date.now();
            addOperation({
                id: installId,
                title: "Install Update",
                body: "Installing the latest version of CMC Mod Manager.",
                state: OpState.QUEUED,
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
        fs.existsSync(path.join(updateDir, "updater", "update.sh")) ||
        fs.existsSync(path.join(updateDir, "updater", "update.bat"))
    ) {
        fs.removeSync(updaterDir);
        fs.copySync(path.join(updateDir, "updater"), updaterDir, { overwrite: true });
    }
    global.updateOnExit = true;
    updateOperation({
        id: id,
        body: "Please close CMC Mod Manager to finish the update.",
        state: OpState.FINISHED
    });
    return;
}

export function runUpdater(): void {
    if (!app.isPackaged) throw new Error("Cannot update in dev mode.");
    const updaterDir: string = path.join(global.appDir, "updater");

    if (global.platform == "win32") {
        spawn(path.join(updaterDir, "update.bat"), {
            cwd: updaterDir,
            detached: true,
            stdio: ["ignore", "ignore", "ignore"]
        }).unref();
    } else if (global.platform == "linux") {
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

export async function handleURI(uri: string | undefined): Promise<void> {
    if (uri == undefined || global.gameDir == null) {
        return;
    }
    const splitUri: string[] = uri.replace("cmcmm:", "").split(",");
    if (splitUri[1].toLowerCase() != "mod") return;
    const url: string = splitUri[0];
    const modId: string = splitUri[2];
    const id: string = modId + "_" + Date.now();

    showNotification("1-Click Download Initialised", {
        body: "Downloading mod with id: '" + modId + "' from GameBanana."
    }, {
        name: "focusWindow",
        args: []
    });

    addOperation({
        id: "download_" + id,
        title: "Mod Download",
        body: "Downloading a mod from GameBanana.",
        image: "https://gamebanana.com/mods/embeddables/" + modId + "?type=medium_square",
        state: OpState.QUEUED,
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

// TODO: split this function up
export async function downloadMod(url: string, modId: string, id: string): Promise<void> {
    return new Promise((resolve: () => void) => {
        console.log(url);
        fs.ensureDirSync(global.temp);

        const infoPromise: Promise<string[]> = getDownloadInfo(modId);
        const operationId: string = "download_" + id;
        let file: string = operationId;
        request.get(url)
            .on("error", (err: Error) => {
                throw err;
            }).on("response", async (res: request.Response) => {
                switch (res.headers["content-type"]?.split("/")[1]) {
                    case "zip":
                        file += "zip";
                        break;
                    case "rar":
                    case "x-rar-compressed":
                        file += "rar";
                        break;
                    default:
                        throw new Error(
                            "Invalid archive type: " + res.headers["content-type"]?.split("/")[1]
                        );
                }
                const filePath: string = path.join(global.temp, file);
                const modInfo: string[] = await Promise.resolve(infoPromise);
                let modType: ModTypes;
                switch (modInfo[1].toLowerCase()) {
                    case "characters":
                        modType = ModTypes.CHARACTER;
                        break;
                    case "stages":
                        modType = ModTypes.STAGE;
                        break;
                    default:
                        throw new Error("Unknown mod type.");
                }

                const downloadSize: number = parseInt(res.headers["content-length"] ?? "");
                updateOperation({
                    id: operationId,
                    title: modType + " Download",
                    body: "Downloading mod: '" + modInfo[0] + "' from GameBanana. (0 / " +
                        toMb(downloadSize) + " mb)",
                });

                const downloadStream: fs.WriteStream = fs.createWriteStream(filePath);
                let canceled: boolean = false;
                const req: any = request.get(
                    res.request.uri.href
                ).on("error", (err: Error & { code: string }) => {
                    downloadStream.close();
                    if (canceled) return;
                    throw err;
                });

                global.cancelFunctions[operationId] = (() => {
                    req.abort();
                    canceled = true;
                    updateOperation({
                        id: operationId,
                        state: OpState.CANCELED,
                    });
                    delete global.cancelFunctions[operationId];
                });
                updateOperation({
                    id: operationId,
                    cancelable: true,
                });

                req.pipe(downloadStream).on("close", async () => {
                    delete global.cancelFunctions[operationId];
                    if (downloadStream.errored || canceled) return;
                    const output: string = await extractArchive(filePath, global.temp);
                    fs.removeSync(filePath);
                    updateOperation({
                        id: operationId,
                        body: "Downloaded mod: '" + modInfo[0] + "' from GameBanana.",
                        state: OpState.FINISHED,
                    });
                    resolve();
                    switch (modType) {
                        case ModTypes.CHARACTER:
                            characters.installDownloadedCharacters(output);
                            break;
                        case ModTypes.STAGE:
                            stages.installDownloadedStages(output);
                            break;
                    }
                });

                updateDownloadProgress(
                    operationId,
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
            updateOperation({
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
    return new Promise((resolve: (value: string[]) => void) => {
        request.get(
            {
                url: "https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&itemid=" +
                    modId + "&fields=name,RootCategory().name"
            },
            async (err: any, _res: http.IncomingMessage, body: string) => {
                if (err != null) return;
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

export function addOperation(operation: Operation): void {
    global.win.webContents.send("addOperation", operation);
}

export function updateOperation(update: OperationUpdate): void {
    global.win.webContents.send("updateOperation", update);
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

export function isSelfContainedDir(dir: string = global.gameDir): boolean {
    const relativePath: string = path.relative(global.appDir, path.resolve(dir));
    return (!relativePath || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)));
}

async function alertSelfContainedDir(): Promise<void> {
    customDialogs.alert({
        id: "modManagerContainedDirWarning",
        body: "The selected game directory is contained within CMC Mod Manager's own " +
            "directory. CMC Mod Manager deletes all files within this directory when " +
            "updating, so it cannot be used to store your game files, please move them to " +
            "a different location.",
        title: "Invalid Game Location Warning",
    });
    return;
}

export async function isValidGameDir(dir: string = global.gameDir): Promise<boolean> {
    return ((dir == null || getGameVersion(dir) != null) && !isSelfContainedDir(dir));
}

export async function selectGameDir(): Promise<string | null> {
    const dir: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        properties: ["openDirectory"]
    });
    if (dir.canceled == true) {
        return null;
    }
    if (!await isValidGameDir(dir.filePaths[0])) {
        if (isSelfContainedDir(dir.filePaths[0])) {
            alertSelfContainedDir();
        } else {
            customDialogs.alert({
                id: "invalidGameDir",
                body: "The selected directory is invalid as it does not contain one of the " +
                "following identifying executables: " +
                SUPPORTED_VERSIONS.map((val: string) => val + ".exe").join(", ") +
                ".",
                title: "Invalid Directory Selected",
            });
        }
        return null;
    }

    getAllFiles(dir.filePaths[0]).forEach((file: string) => {
        fs.chmod(file, 0o777);
    });
    global.gameDir = dir.filePaths[0];
    global.appData = readJSON(DATA_FILE);
    global.appData.dir = global.gameDir;
    writeAppData(global.appData);
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

export async function confirmDestructiveAction(): Promise<boolean> {
    return await customDialogs.confirm({
        id: "confirmDestructiveAction",
        body: "This action is destructive and cannot be undone. Are you sure that you want to " +
            "continue?",
        title: "Destructive Action Confirmation",
        okLabel: "Continue",
    });
}

export function updateCharacterPages(): void {
    global.win.webContents.send("updateCharacterPages");
    global.dialogs.forEach(
        (window: BrowserWindow) => window.webContents.send("updateCharacterPages")
    );
}

export function updateStagePages(): void {
    global.win.webContents.send("updateStagePages");
    global.dialogs.forEach(
        (window: BrowserWindow) => window.webContents.send("updateStagePages")
    );
}

export function showNotification(
    title: string,
    options?: NotificationOptions,
    onclick?: MainCall
): void {
    global.win.webContents.send("showNotification", title, options, onclick);
}

export async function createUniqueFileName(
    dir: string,
    base: string,
    ext: string
): Promise<string> {
    const files: string[] = (await fs.readdir(dir))
        .map((file: string) => file.toLocaleLowerCase());
    let i: number = 1;
    while (files.includes((base + "-" + i + ext).toLocaleLowerCase())) {
        i++;
    }
    return path.join(dir, base + "-" + i + ext);
}