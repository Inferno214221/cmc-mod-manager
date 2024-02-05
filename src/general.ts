import { BrowserWindow, OpenDialogReturnValue, app, dialog, shell } from "electron";
import fs from "fs-extra";
import path from "path";
import extract from "extract-zip";
import { ArcFile, ArcFiles, Extractor, createExtractorFromFile } from "node-unrar-js/esm";
// import sevenZip from "node-7z-archive";
import { execFile } from "child_process";
import { AppConfig, AppData, Download, DownloadState } from "./interfaces";
import request from "request";
import http from "http";
import util from "util";
import semver from "semver";

declare const global: {
    win: BrowserWindow,
    gameDir: string,
    log: string,
    appData: AppData,
    downloads: Download[]
};

require.resolve("./unrar.wasm");
const WASM_BINARY: Buffer = fs.readFileSync(path.join(__dirname, "unrar.wasm"));

// import * as customDialogs from "./custom-dialogs";
import * as characters from "./characters";

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
            //TODO: Throw error
            break;
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
    }, (error: any, res: http.IncomingMessage, body: string) => {
        if (error != null) return;
        const latestVersion: string = semver.clean(JSON.parse(body).tag_name);
        console.log("Latest Version: " + latestVersion);
        if (semver.lt(currentVersion, latestVersion)) {
            console.log("Update Required");
            //TODO:
            return;
        }
        handleURI(process.argv.find((arg: string) => arg.startsWith("cmcmm:")));
    });
}

export function isURIAssociated(): boolean {
    return (!app.isPackaged || app.isDefaultProtocolClient("cmcmm"));
}

export async function handleURI(uri: string): Promise<void> {
    if (uri == undefined || global.gameDir == null) {
        return;
    }
    const downloadId: number = global.downloads.push({
        filePath: null,
        name: null,
        image: null,
        modType: null,
        fileSize: null,
        state: DownloadState.queued
    }) - 1;
    const url: string = uri.replace("cmcmm:", "").split(",")[0];
    const temp: string = path.join(global.gameDir, "_temp");
    fs.ensureDirSync(temp);
    fs.emptyDirSync(temp);
    
    const infoPromise: Promise<void> = getDownloadInfo(uri, downloadId);

    request.get(url)
        .on("error", (error: Error) => { log(error) })
        .on("response", async (res: request.Response) => {
            let file: string = "download" + downloadId + ".";
            global.downloads[downloadId].fileSize = parseInt(res.headers["content-length"]);
            //FIXME: array might not work because removed elements will screw up later downloads
            switch (res.headers["content-type"].split("/")[1]) {
                case "zip":
                    file += "zip";
                    break;
                case "rar":
                case "x-rar-compressed":
                    file += "rar";
                    break;
                default:
                    //TODO: inform the user
                    return;
            }
            const filePath: string = path.join(temp, file);
            global.downloads[downloadId].filePath = filePath;
            await Promise.resolve(infoPromise);
            global.downloads[downloadId].state = DownloadState.started;
            //TODO: progress tracking via writeStream.bytesWritten
            request.get(
                res.request.uri.href
            ).pipe(fs.createWriteStream(filePath)).on("close", async () => {
                const output: string = await extractArchive(filePath, temp);
                fs.removeSync(filePath);
                global.downloads[downloadId].filePath = output;
                global.downloads[downloadId].state = DownloadState.finished;
                log(output);
                //TODO: switch between character and stage
                // move 'fighters' folder search to more generic function
                characters.installCharacter(output, true, false, global.gameDir);
            });
        });
    return;
    // const output: string = await extractArchive(selected.filePaths[0], path.join(dir, "_temp"));
}

export async function getDownloadInfo(uri: string, downloadId: number): Promise<void> {
    const modId: string = uri.replace("cmcmm:", "").split(",")[2];
    if (uri.replace("cmcmm:", "").split(",")[2] == undefined) {
        //TODO:
        return;
    }
    global.downloads[downloadId].image = "https://gamebanana.com/mods/embeddables/" +
        modId + "?type=large";
    request.get(
        {
            url: "https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&itemid=" +
                modId + "&fields=name,RootCategory().name"
        },
        (error: string, res: http.IncomingMessage, body: string) => {
            [
                global.downloads[downloadId].name,
                global.downloads[downloadId].modType
            ] = JSON.parse(body);
            log(global.downloads);
        }
    );
    return;
}

export function getGameDir(): string {
    return global.gameDir;
}

export function getExtractedDir(): string {
    return path.join(global.gameDir, "0extracted");
}

export function getDownloads(): Download[] {
    return global.downloads;
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