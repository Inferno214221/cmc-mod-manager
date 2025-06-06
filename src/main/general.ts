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
import { ModTypes, OpDep, OpState } from "../global/global";
import { translations } from "../global/translations";
const {
    displayEnum, error, message
}: ReturnType<typeof translations> = translations(global.language);

require.resolve("./unrar.wasm");
const WASM_BINARY: Buffer = fs.readFileSync(path.join(__dirname, "unrar.wasm"));

import * as basic from "./basic-fs";
import * as characters from "./characters";
import * as stages from "./stages";
import * as customDialogs from "./custom-dialogs";

const SUPPORTED_VERSIONS: string[] = [
    "CMC_v8",
    "CMC+ v8",
];

export * from "./basic-fs";

export function isNumber(num: string): boolean {
    return /^\d+$/.test(num);
}

export async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
    const contents: string[] = await fs.readdir(dirPath);

    for (const file of contents) {
        if ((await fs.stat(dirPath + "/" + file)).isDirectory()) {
            arrayOfFiles = await getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    }

    return arrayOfFiles;
}

export async function extractArchive(archive: string, destination: string): Promise<string> {
    const output: string = path.join(destination, path.parse(archive).name);
    await fs.ensureDir(destination);
    await fs.remove(output);
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
                // @ts-ignore: I didn't change anything, but now this is throwing a type error.
                // ! still works, so I'll just leave it.
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
            error("unsupportedArchiveType", path.parse(archive).ext.toLowerCase());
    }
    return output;
}

export async function selectPathsArch(): Promise<string[]> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        filters: [
            { name: message("other.selector.archives"), extensions: ["zip", "rar"] },
            { name: message("other.selector.all"), extensions: ["*"] }
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
        error("invalidSemverString", app.getVersion());
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
            error("invalidSemverString", releases[0].tag_name);
        if (semver.lt(currentVersion, latestVersion)) {
            if (semver.prerelease(latestVersion)) {
                if (!semver.prerelease(currentVersion)) {
                    return;
                }
            }
            const id: string = "downloadUpdate_" + Date.now();

            try {
                await fs.access(global.appDir, fs.constants.W_OK | fs.constants.X_OK);
            } catch (error: any) {
                addOperation({
                    id: id,
                    title: message("operation.update.download.started.title"),
                    body: message("other.autoUpdateFailed"),
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
                title: message("operation.update.download.started.title"),
                body: message("operation.update.download.started.body"),
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
    if (!(await customDialogs.confirm("programUpdate")) || isSelfContainedDir()) {
        if (isSelfContainedDir()) alertSelfContainedDir();
        updateOperation({
            id: id,
            state: OpState.CANCELED
        });
        return;
    }
    const targetPath: string = path.join(global.temp, "update.zip");
    await fs.createFile(targetPath);
    const targetStream: fs.WriteStream = fs.createWriteStream(targetPath);
    const url: string = "https://github.com/Inferno214221/cmc-mod-manager/releases/download/" +
        tagName + "/cmc-mod-manager-" + global.platform + "-" + global.arch + ".zip";
    request.get(url)
        .on("error", (err: Error) => {
            console.log(err);
            targetStream.close();
            error("streamError", err.message);
        }).on("response", (res: request.Response) => {
            const downloadSize: number = parseInt(res.headers["content-length"] ?? "");
            updateDownloadProgress(
                id,
                message("operation.update.download.started.body"),
                targetStream,
                downloadSize
            );
        }).pipe(targetStream).on("close", async () => {
            if (targetStream.errored) return;
            updateOperation({
                id: id,
                title: message("operation.update.download.finished.title"),
                body: message("operation.update.download.finished.body"),
                state: OpState.FINISHED
            });
            if (app.isPackaged) {
                const updateDir: string = path.join(global.appDir, "update");
                let updateTemp: string = path.join(global.temp, "update");
                await extractArchive(targetPath, updateTemp);
                while (
                    (await fs.readdir(updateTemp)).length == 1
                ) {
                    updateTemp = path.join(updateTemp, (await fs.readdir(updateTemp))[0]);
                }
                await fs.move(updateTemp, updateDir, { overwrite: true });
            }

            const installId: string = "installUpdate_" + Date.now();
            addOperation({
                id: installId,
                title: message("operation.update.install.started.title"),
                body: message("operation.update.install.started.body"),
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

export async function installUpdate(id: string): Promise<void> {
    if (!app.isPackaged) error("cantUpdateDevMode");
    const updateDir: string = path.join(global.appDir, "update");
    const updaterDir: string = path.join(global.appDir, "updater");
    if (!(await fs.exists(path.join(updateDir)))) error("missingUpdateFiles");
    if (
        await fs.exists(path.join(updateDir, "updater", "update.sh")) ||
        await fs.exists(path.join(updateDir, "updater", "update.bat"))
    ) {
        await fs.remove(updaterDir);
        await fs.copy(path.join(updateDir, "updater"), updaterDir, { overwrite: true });
    }
    global.updateOnExit = true;
    updateOperation({
        id: id,
        body: message("operation.update.install.finished.body"),
        state: OpState.FINISHED
    });
    return;
}

export function runUpdater(): void {
    if (!app.isPackaged) error("cantUpdateDevMode");
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

    showNotification(message("dialog.notification.oneClickDownload.title"), {
        body: message("dialog.notification.oneClickDownload.body", modId)
    }, {
        name: "focusWindow",
        args: []
    });

    addOperation({
        id: "download_" + id,
        title: message("operation.mod.download.started.title"),
        body: message("operation.mod.download.started.body"),
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
    console.log(url);
    await fs.ensureDir(global.temp);

    return new Promise((resolve: () => void, reject: (reason: any) => void) => {
        const infoPromise: Promise<string[]> = getDownloadInfo(modId);
        const operationId: string = "download_" + id;
        let file: string = operationId;
        request.get(url)
            .on("error", (err: Error) => {
                return reject(err);
            }).on("response", async (res: request.Response) => {
                const archiveType: string = res.headers["content-type"]?.split("/")[1] ?? "";
                switch (archiveType) {
                    case "zip":
                        file += ".zip";
                        break;
                    case "rar":
                    case "x-rar-compressed":
                        file += ".rar";
                        break;
                    default:
                        return reject(
                            new Error(message("error.unsupportedArchiveType", archiveType))
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
                        return reject(
                            new Error(message("error.unsupportedArchiveType", modInfo[1]))
                        );
                }

                const downloadSize: number = parseInt(res.headers["content-length"] ?? "");
                updateOperation({
                    id: operationId,
                    title: message("operation.mod.download.progress.0.title", displayEnum(modType)),
                    body: message("operation.mod.download.progress.0.body", modInfo[0]) +
                        " (0 / " + toMb(downloadSize) + " mb)",
                });

                const downloadStream: fs.WriteStream = fs.createWriteStream(filePath);
                let canceled: boolean = false;
                const req: any = request.get(
                    res.request.uri.href
                ).on("error", (err: Error & { code: string }) => {
                    downloadStream.close();
                    if (canceled) return;
                    return reject(err);
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
                    try {
                        updateOperation({
                            id: operationId,
                            body: message("operation.mod.download.progress.1.body"),
                        });
                        const output: string = await extractArchive(filePath, global.temp);
                        await fs.remove(filePath);
                        updateOperation({
                            id: operationId,
                            body: message("operation.mod.download.finished.body", modInfo[0]),
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
                    } catch (err: any) {
                        return reject(err);
                    }
                });

                updateDownloadProgress(
                    operationId,
                    message("operation.mod.download.progress.0.body", modInfo[0]),
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

export function getGameDir(): string | null {
    return global.gameDir || null;
}

export function getExtractedDir(): string {
    return path.join(global.gameDir, "0extracted");
}

export async function getGameVersion(
    dir: string = global.gameDir,
    list: string[] = SUPPORTED_VERSIONS
): Promise<string | null> {
    if (dir == null) {
        return null;
    }
    for (const game of list) {
        if (await fs.exists(path.join(dir, game + ".exe"))) {
            return game;
        }
    }
    return null;
}

export function isSelfContainedDir(dir: string = global.gameDir): boolean {
    const relativePath: string = path.relative(global.appDir, path.resolve(dir));
    return !(
        relativePath && (
            relativePath.startsWith("..") ||
            path.isAbsolute(relativePath)
        )
    );
}

async function alertSelfContainedDir(): Promise<void> {
    customDialogs.alert("selfContainedDir");
    return;
}

export async function isValidGameDir(dir: string = global.gameDir): Promise<boolean> {
    return ((dir == null || await getGameVersion(dir) != null) && !isSelfContainedDir(dir));
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
            customDialogs.alert("invalidGameDir");
        }
        return null;
    }

    (await getAllFiles(dir.filePaths[0])).forEach((file: string) => {
        fs.chmod(file, 0o777);
    });
    global.gameDir = dir.filePaths[0];
    global.appData = await basic.readJSON(basic.DATA_FILE);
    global.appData.dir = global.gameDir;
    // I feel that not awaiting this could be bad, its already cause one problem.
    await basic.writeAppData(global.appData);
    return global.gameDir;
}

export async function openDir(dir: string): Promise<void> {
    await shell.openPath(dir);
    return;
}

export async function runGame(dir: string = global.gameDir): Promise<void> {
    spawn(path.join(dir, await getGameVersion(global.gameDir) + ".exe"), {
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
    return await customDialogs.confirm("destructiveAction");
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

export async function matchFs(
    nodes: RegExpNode[],
    dir: { name: string, full: string }
): Promise<string[]> {
    for (let i: number = 0; i < nodes.length; i++) {
        const node: RegExpNode = nodes[i];
        if (!node.pattern.test(dir.name)) continue;
        if (!node.contents) {
            if (!node.nonExhaustive) {
                // If its exhaustive, remove it from the list
                nodes.splice(i, 1);
                i--;
            }
            return [dir.full];
        }
        try {
            const contents: string[] = await fs.readdir(dir.full);
            const retVal: string[] = [];
            for (const subDir of contents) {
                retVal.push(...(await matchFs(
                    node.contents!,
                    { name: subDir, full: path.join(dir.full, subDir) }
                )));
            }
            return retVal;
        } catch (e: any) {
            console.log(e);
            break;
        }
    }
    return [];
}

export async function matchContents(
    nodes: RegExpNode[],
    dir: string
): Promise<string[]> {
    const toResolve: Promise<string[]>[] = [];
    (await fs.readdir(dir)).forEach((subDir: string) =>
        toResolve.push(matchFs(
            nodes,
            { name: subDir, full: path.join(dir, subDir) }
        ))
    );
    return (await Promise.all(toResolve)).flat();
}