import {
    app, BrowserWindow, dialog, ipcMain, shell, protocol, ProtocolRequest, ProtocolResponse,
    IpcMainInvokeEvent, OpenDialogReturnValue
} from "electron";
import fs from "fs-extra";
import path from "path";
import extract from "extract-zip";
import { createExtractorFromFile, Extractor, ArcFiles, ArcFile } from "node-unrar-js/esm";
// import sevenZip from "node-7z-archive";
import ini from "ini";
import { execFile } from "child_process";
import {
    Character, CharacterList, CharacterDat, CharacterPalette, CssPage, CssData, Download,
    DownloadState
} from "./interfaces";
import request from "request";
import http from "http";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

require.resolve("./unrar.wasm");
const wasmBinary: Buffer = fs.readFileSync(path.join(__dirname, "unrar.wasm"));

let mainWindow: BrowserWindow;



function isNumber(num: string): boolean {
    return /^\+?(0|[1-9]\d*)$/.test(num);
}

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1120,
        height: 630,
        minWidth: 810,
        minHeight: 600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        autoHideMenuBar: true,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    createHandlers();
    protocol.registerFileProtocol("img", (
        request: ProtocolRequest,
        callback: (response: string | ProtocolResponse) => void
    ) => {
        const url: string = request.url.replace("img://", "");
        return callback(url);
    });
    handleURI(process.argv.find((arg: string) => arg.startsWith("cmcmm:")));
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
    ipcMain.handle("getGameDir", getGameDir);
    ipcMain.handle("getExtractedDir", getExtractedDir);
    ipcMain.handle("getDownloads", getDownloads);
    ipcMain.handle("getGameVersion", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof getGameVersion>) => getGameVersion(...args)
    );
    ipcMain.handle("isValidGameDir", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof isValidGameDir>) => isValidGameDir(...args)
    );
    ipcMain.handle("selectGameDir", selectGameDir);
    ipcMain.handle("openDir", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof openDir>) => openDir(...args)
    );
    ipcMain.handle("runGame", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof runGame>) => runGame(...args)
    );
    ipcMain.handle("pathJoin", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof path.join>) => path.join(...args)
    );
    ipcMain.handle("openExternal", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof shell.openExternal>) => shell.openExternal(...args)
    );
    ipcMain.handle("getCharacters", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof getCharacters>) => getCharacters(...args)
    );
    ipcMain.handle("readCharacterList", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof readCharacterList>) => readCharacterList(...args)
    );
    ipcMain.handle("writeCharacterList", (event: IpcMainInvokeEvent,
        args: Parameters<typeof writeCharacterList>) => writeCharacterList(...args)
    );
    ipcMain.handle("writeCharacterRandom", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof writeCharacterRandom>) => writeCharacterRandom(...args)
    );
    ipcMain.handle("installCharacterDir", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof installCharacterDir>) => installCharacterDir(...args)
    );
    ipcMain.handle("installCharacterArchive", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof installCharacterArchive>) => installCharacterArchive(...args)
    );
    ipcMain.handle("extractCharacter", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof extractCharacter>) => extractCharacter(...args)
    );
    ipcMain.handle("removeCharacter", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof removeCharacter>) => removeCharacter(...args)
    );
    ipcMain.handle("getCharacterDat", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof getCharacterDat>) => getCharacterDat(...args)
    );
    ipcMain.handle("readCharacterDat", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof readCharacterDat>) => readCharacterDat(...args)
    );
    ipcMain.handle("writeCharacterDat", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof writeCharacterDat>) => writeCharacterDat(...args)
    );
    ipcMain.handle("readCssPages", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof readCssPages>) => readCssPages(...args)
    );
    ipcMain.handle("writeCssPages", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof writeCssPages>) => writeCssPages(...args)
    );
    ipcMain.handle("addCssPage", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof addCssPage>) => addCssPage(...args)
    );
    ipcMain.handle("removeCssPage", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof removeCssPage>) => removeCssPage(...args)
    );
    ipcMain.handle("readCssData", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof readCssData>) => readCssData(...args)
    );
    ipcMain.handle("writeCssData", (
        event: IpcMainInvokeEvent,
        args: Parameters<typeof writeCssData>) => writeCssData(...args)
    );
}

// const PROGRAM_DIR = app.getPath("userData");

const SUPPORTED_VERSIONS: string[] = [
    "CMC_v8",
    "CMC+ v8",
];

const CHARACTER_FILES: string[] = [
    "arcade/routes/<fighter>.txt",
    // "data/<fighter>.dat",
    "data/dats/<fighter>.dat",
    "fighter/<fighter>.bin",
    "fighter/<fighter>",
    "gfx/abust/<fighter>.png",
    "gfx/bust/<fighter>.png",
    "gfx/bust/<fighter>_<palette>.png",
    "gfx/cbust/<fighter>.png",
    "gfx/mbust/<fighter>.png",
    "gfx/tbust/<fighter>__*.png",
    "gfx/mugs/<fighter>.png",
    "gfx/hudicon/<series>.png",
    "gfx/name/<fighter>.png",
    "gfx/portrait/<fighter>.png",
    "gfx/portrait/<fighter>_<palette>.png",
    // "gfx/portrait_new/<fighter>.png",
    // "gfx/portrait_new/<fighter>_<palette>.png",
    "gfx/seriesicon/<series>.png",
    "gfx/stock/<fighter>.png",
    "palettes/<fighter>",
    "music/versus/<fighter>_*.<audio>",
    "music/victory/<series>.<audio>",
    "music/victory/individual/<fighter>.<audio>",
    "sfx/announcer/fighter/<fighter>.<audio>",
    "sticker/common/<fighter>.png",
    "sticker/common/desc/<fighter>.txt",
    "sticker/rare/<fighter>.png",
    "sticker/rare/desc/<fighter>.txt",
    "sticker/super/<fighter>.png",
    "sticker/super/desc/<fighter>.txt",
    "sticker/ultra/<fighter>.png",
    "sticker/ultra/desc/<fighter>.txt",
];

const BLANK_CSS_PAGE_DATA: string = "\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000 ";

const DATA_FILE: string = path.join(app.getPath("userData"), "data.json");
if (!fs.existsSync(DATA_FILE)) {
    writeJSON(DATA_FILE, {
        dir: "",
    });
}

let gameDir: string = readJSON(DATA_FILE).dir;

const downloads: Download[] = [];

function readJSON(file: string): any {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeJSON(file: string, data: object): void {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf-8");
}

function getAllFiles(dirPath: string, arrayOfFiles?: string[]): string[] {
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

async function extractArchive(archive: string, destination: string): Promise<string> {
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
                wasmBinary: wasmBinary,
                filepath: archive,
                targetPath: output
            });
            const extracted: ArcFiles = extractor.extract();
            console.log(extracted);
            const files: ArcFile[] = [...extracted.files];
            console.log(files);
            break;
        case ".7z":
            //FIXME: doesn't work
            // await sevenZip.extractArchive(archive, output, {}, true);
            break;
        default:
            //TODO: Throw error
            break;
    }
    return output;
}

async function handleURI(uri: string): Promise<void> {
    if (uri == undefined || gameDir == null) {
        return;
    }
    const downloadId: number = downloads.push({
        filePath: null,
        name: null,
        image: null,
        modType: null,
        fileSize: null,
        state: DownloadState.queued
    }) - 1;
    const url: string = uri.replace("cmcmm:", "").split(",")[0];
    const temp: string = path.join(gameDir, "_temp");
    fs.ensureDirSync(temp);
    fs.emptyDirSync(temp);
    
    const infoPromise: Promise<void> = getDownloadInfo(uri, downloadId);

    request.get(url)
        .on("error", (error: Error) => { console.log(error) })
        .on("response", async (res: request.Response) => {
            let file: string = "download" + downloadId + ".";
            downloads[downloadId].fileSize = parseInt(res.headers["content-length"]);
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
            downloads[downloadId].filePath = filePath;
            await Promise.resolve(infoPromise);
            downloads[downloadId].state = DownloadState.started;
            //TODO: progress tracking via writeStream.bytesWritten
            request.get(
                res.request.uri.href
            ).pipe(fs.createWriteStream(filePath)).on("close", async () => {
                console.log("Image Downloaded");
                const output: string = await extractArchive(filePath, temp);
                fs.removeSync(filePath);
                downloads[downloadId].filePath = output;
                downloads[downloadId].state = DownloadState.finished;
                console.log(output);
                //TODO: switch between character and stage
                // move 'fighters' folder search to more generic function
                installCharacter(output, true, false, gameDir);
            });
        });
    return;
    // const output: string = await extractArchive(selected.filePaths[0], path.join(dir, "_temp"));
}

async function getDownloadInfo(uri: string, downloadId: number): Promise<void> {
    const modId: string = uri.replace("cmcmm:", "").split(",")[2];
    if (uri.replace("cmcmm:", "").split(",")[2] == undefined) {
        //TODO:
        return;
    }
    downloads[downloadId].image = "https://gamebanana.com/mods/embeddables/" +
        modId + "?type=large";
    request.get(
        {
            url: "https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&itemid=" +
                modId + "&fields=name,RootCategory().name"
        },
        (error: string, res: http.IncomingMessage, body: string) => {
            [downloads[downloadId].name, downloads[downloadId].modType] = JSON.parse(body);
            console.log(downloads);
        }
    );
    return;

    // const filePath: string = path.join(gameDir, "_temp", "download" + downloadId + ".png");
    // downloads[downloadId].image = filePath;
    // request(
    //     "https://gamebanana.com/mods/embeddables/" + modId + "?type=large",
    // ).pipe(fs.createWriteStream(filePath)).on("close", () => {
    //     console.log("Image Downloaded");
    // });
}

function getGameDir(): string {
    return gameDir;
}

function getExtractedDir(): string {
    return path.join(gameDir, "extracted");
}

function getDownloads(): Download[] {
    return downloads;
}

function getGameVersion(
    dir: string = gameDir,
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

async function isValidGameDir(dir: string = gameDir): Promise<boolean> {
    return (dir != null && getGameVersion(dir) != null);
}

async function selectGameDir(): Promise<string | null> {
    const dir: OpenDialogReturnValue = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"]
    });
    if (dir.canceled == true) {
        return null;
    }
    if (!await isValidGameDir(dir.filePaths[0])) {
        //TODO: inform the user
        return null;
    }

    getAllFiles(dir.filePaths[0]).forEach((file: string) => {
        fs.chmod(file, 0o777);
    });
    gameDir = dir.filePaths[0];
    const data: any = readJSON(DATA_FILE);
    data.dir = gameDir;
    writeJSON(DATA_FILE, data);
    return gameDir;
}

async function openDir(dir: string): Promise<void> {
    await shell.openPath(dir);
    return;
}

async function runGame(dir: string = gameDir): Promise<void> {
    await execFile(path.join(dir, getGameVersion(gameDir) + ".exe"), {
        cwd: dir,
        windowsHide: true
    });
    return;
}

function getCharacters(dir: string = gameDir): Character[] {
    return readCharacterList(dir).getAllCharacters();
}

function readCharacterList(dir: string = gameDir): CharacterList {
    // console.log(new Date().getTime());
    const characters: CharacterList = new CharacterList();
    const charactersTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighters.txt"),
        "ascii"
    ).split(/\r?\n/);
    charactersTxt.shift(); // Drop the number
    charactersTxt.forEach((character: string, index: number) => {
        if (fs.existsSync(path.join(dir, "data", "dats", character + ".dat"))) {
            const characterDat: CharacterDat = getCharacterDat(character, dir);
            characters.addCharacter({
                name: character,
                displayName: characterDat.displayName,
                series: characterDat.series,
                randomSelection: true, // Assume true and then iterate through false list
                cssNumber: index + 1,
                // alts: []
                mug: path.join(dir, "gfx", "mugs", character + ".png")
            });
        }
    });
    const lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    lockedTxt.forEach((locked: string) => {
        if (locked == "") return;
        characters.updateCharacterByName(locked, { randomSelection: false });
    });
    // console.log(new Date().getTime());
    return characters;
}

async function writeCharacterList(
    characterList: CharacterList,
    dir: string = gameDir
): Promise<void> {
    const characters: Character[] = characterList.getAllCharacters();
    characters.sort((a: Character, b: Character) =>
        (a.cssNumber > b.cssNumber ? 1 : -1)
    );
    const output: string = [
        characters.length,
        characters.map((character: Character) => character.name).join("\r\n")
    ].join("\r\n");
    fs.writeFile(
        path.join(dir, "data", "fighters.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

async function writeCharacterRandom(
    character: string,
    randomSelection: boolean,
    dir: string = gameDir
): Promise<void> {
    let lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    if (randomSelection) {
        lockedTxt = lockedTxt.filter((locked: string) => locked != character);
    } else {
        lockedTxt.push(character);
    }
    let output: string = lockedTxt.length.toString() + "\r\n";
    output += lockedTxt.join("\r\n");
    await fs.writeFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

function getCharacterDat(character: string, dir: string = gameDir): CharacterDat {
    return readCharacterDat(path.join(dir, "data", "dats", character + ".dat"), character);
}

function readCharacterDat(
    datPath: string,
    character: string = path.parse(datPath).name
): CharacterDat {
    const characterDatTxt: string[] = fs.readFileSync(
        datPath,
        "ascii"
    ).split(/\r?\n/);
    // TODO: handle empty v7 names for builtin characters
    const isVanilla: boolean = isNumber(characterDatTxt[3]);
    const isV7: boolean = isVanilla || isNumber(characterDatTxt[4]);

    let displayName: string;
    let menuName: string;
    let battleName: string;
    let series: string;
    // TODO: get input for 
    if (isVanilla) {
        displayName = "TODO";
        menuName = "TODO";
        battleName = "TODO";
        series = "TODO";
    } else {
        displayName = characterDatTxt[0];
        menuName = characterDatTxt[1];
        battleName = characterDatTxt[2];
        series = characterDatTxt[3].toLowerCase();
    }

    const homeStages: string[] = [];
    const randomDatas: string[] = [];
    const palettes: CharacterPalette[] = [];
    if (isV7) {
        homeStages.push("battlefield");
        randomDatas.push("Updated to v8 dat format by CMC Mod Manager");
        const paletteCount: number =
            parseInt(characterDatTxt[isVanilla ? 1 : 5]);
        for (let palette: number = 1; palette <= paletteCount * 6; palette += 6) {
            const paletteLocation: number = isVanilla ? 1 : 5 + palette;
            palettes.push({
                name: characterDatTxt[paletteLocation + 0],
                0: parseInt(characterDatTxt[paletteLocation + 1]),
                1: parseInt(characterDatTxt[paletteLocation + 2]),
                2: parseInt(characterDatTxt[paletteLocation + 3]),
                3: parseInt(characterDatTxt[paletteLocation + 4]),
                4: parseInt(characterDatTxt[paletteLocation + 5])
            });
        }
    } else {
        const homeStageCount: number = parseInt(characterDatTxt[5]);
        for (let stage: number = 1; stage <= homeStageCount; stage++) {
            homeStages.push(characterDatTxt[5 + stage]);
        }

        const randomDataCount: number = parseInt(characterDatTxt[7 + homeStageCount]);
        for (let data: number = 1; data <= randomDataCount; data++) {
            randomDatas.push(characterDatTxt[7 + homeStageCount + data]);
        }

        const paletteCount: number =
            parseInt(characterDatTxt[9 + homeStageCount + randomDataCount]);
        for (let palette: number = 1; palette <= paletteCount * 6; palette += 6) {
            const paletteLocation: number = 10 + homeStageCount + randomDataCount + palette;
            palettes.push({
                name: characterDatTxt[paletteLocation + 0],
                0: parseInt(characterDatTxt[paletteLocation + 1]),
                1: parseInt(characterDatTxt[paletteLocation + 2]),
                2: parseInt(characterDatTxt[paletteLocation + 3]),
                3: parseInt(characterDatTxt[paletteLocation + 4]),
                4: parseInt(characterDatTxt[paletteLocation + 5])
            });
        }
    }
    return {
        name: character,
        displayName: displayName,
        menuName: menuName,
        battleName: battleName,
        series: series,
        homeStages: homeStages,
        randomDatas: randomDatas,
        palettes: palettes
    };
}

async function writeCharacterDat(dat: CharacterDat, destination: string): Promise<void> {
    let output: string = [
        dat.displayName,
        dat.menuName,
        dat.battleName,
        dat.series,
        "---Classic Home Stages Below---",
        dat.homeStages.length,
        dat.homeStages.join("\r\n"),
        "---Random Datas---",
        dat.randomDatas.length,
        dat.randomDatas.join("\r\n"),
        "---Palettes Number---",
        dat.palettes.length,
        "---From Here is Individual Palettes data---"
    ].join("\r\n");
    dat.palettes.forEach((palette: CharacterPalette) => {
        output += [
            "",
            palette.name,
            palette[0],
            palette[1],
            palette[2],
            palette[3],
            palette[4]
        ].join("\r\n");
    });
    fs.ensureFileSync(path.join(destination, dat.name + ".dat"));
    fs.writeFileSync(path.join(destination, dat.name + ".dat"), output, { encoding: "ascii" });
    return;
}

async function installCharacterDir(
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = gameDir
): Promise<void> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"]
    });
    if (selected.canceled == true) {
        return null;
    }
    await installCharacter(selected.filePaths[0], filterInstallation, updateCharacters, dir);
    return;
}

async function installCharacterArchive(
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = gameDir
): Promise<void> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"]
    });
    if (selected.canceled == true) {
        return null;
    }
    fs.ensureDirSync(path.join(dir, "_temp"));
    fs.emptyDirSync(path.join(dir, "_temp"));
    const output: string = await extractArchive(selected.filePaths[0], path.join(dir, "_temp"));
    console.log(output, filterInstallation);
    await installCharacter(output, filterInstallation, updateCharacters, dir);
    return;
}

async function installCharacter(
    characterDir: string,
    filterInstallation: boolean = true,
    updateCharacters: boolean = false,
    dir: string = gameDir
): Promise<void> {
    const retVal: Promise<void>[] = [];
    let correctedDir: string = characterDir;
    const modFiles: string[] = getAllFiles(correctedDir)
        .map((file: string) => file.replace(correctedDir, ""));
    for (let file of modFiles) {
        file = path.posix.join(file);
        const fileDir: string = path.posix.parse(file).dir + "/";
        if (fileDir.includes("/fighter/") && !file.includes("/announcer/")) {
            let topDir: string = file.split("/").shift();
            while (topDir != "fighter") {
                correctedDir = path.join(correctedDir, topDir);
                file = file.replace(topDir + "/", "");
                topDir = file.split("/").shift();
            }
            break;
        }
    }
    if (!fs.readdirSync(correctedDir).includes("fighter")) {
        //TODO: inform user
        return;
    }
    console.log(correctedDir);

    const character: string = fs.readdirSync(path.join(correctedDir, "fighter"))
        .filter((file: string) => {
            return file.endsWith(".bin") || !file.includes(".");
        })[0].split(".")[0];
    console.log(character);

    let characterDat: CharacterDat;
    if (fs.existsSync(path.join(correctedDir, "data", "dats", character + ".dat"))) {
        characterDat = readCharacterDat(
            path.join(correctedDir, "data", "dats", character + ".dat"),
            character
        );
    } else if (fs.existsSync(path.join(correctedDir, "data", character + ".dat"))) {
        characterDat = readCharacterDat(
            path.join(correctedDir, "data", character + ".dat"),
            character
        );
    } else {
        //TODO: inform user
        return;
    }
    console.log(characterDat);

    const characters: CharacterList = readCharacterList(dir);
    if (!updateCharacters && characters.getCharacterByName(character) != undefined) {
        //TODO: inform user
        return;
    }

    if (filterInstallation) {
        filterCharacterFiles(characterDat, true).forEach((file: string) => {
            const subDir: string = path.parse(file).dir;
            if (file.includes("*")) {
                const start: string = path.parse(file).base.split("*")[0].replace(subDir, "");
                const end: string = path.parse(file).base.split("*")[1];
                if (fs.existsSync(path.join(correctedDir, subDir))) {
                    const contents: string[] = fs.readdirSync(path.join(correctedDir, subDir))
                        .filter((i: string) => {
                            return i.startsWith(start) && i.endsWith(end);
                        });
                    contents.forEach((found: string) => {
                        console.log("Copying: " + path.join(correctedDir, subDir, found));
                        retVal.push(fs.copy(
                            path.join(correctedDir, subDir, found),
                            path.join(dir, subDir, found),
                            { overwrite: true }
                        ));
                    });
                }
            } else {
                if (fs.existsSync(path.join(correctedDir, file))) {
                    console.log("Copying: " + path.join(correctedDir, file));
                    retVal.push(fs.copy(
                        path.join(correctedDir, file),
                        path.join(dir, file),
                        { overwrite: !file.startsWith("gfx/seriesicon/") }
                    ));
                }
            }
        });
    } else {
        console.log("Installing All Files");
        retVal.push(fs.copy(correctedDir, dir, { overwrite: true }));
    }

    retVal.push(writeCharacterDat(
        characterDat,
        path.join(dir, "data", "dats")
    ));

    if (characters.getCharacterByName(character) != undefined) {
        return;
    }
    characters.addCharacter({
        name: character,
        displayName: characterDat.displayName,
        series: characterDat.series,
        randomSelection: true,
        cssNumber: characters.getNextCssNumber(),
        // alts: []
        mug: path.join(dir, "gfx", "mugs", character + ".png")
    });
    retVal.push(writeCharacterList(characters, dir));
    await Promise.allSettled(retVal);
    return;
}

async function extractCharacter(extract: string, dir: string = gameDir): Promise<void> {
    const retVal: Promise<void>[] = [];
    const characters: Character[] = getCharacters(dir);
    const similarNames: string[] = [];
    characters.forEach((character: Character) => {
        if (character.name.includes(extract) && character.name != extract) {
            similarNames.push(character.name);
        }
    });

    const characterDat: CharacterDat = getCharacterDat(extract, dir);
    const extractDir: string = path.join(dir, "extracted", extract);
    filterCharacterFiles(characterDat).forEach((file: string) => {
        const subDir: string = path.parse(file).dir;
        if (file.includes("*")) {
            const start: string = path.parse(file).base.split("*")[0].replace(subDir, "");
            const end: string = path.parse(file).base.split("*")[1];
            if (fs.existsSync(path.join(dir, subDir))) {
                const contents: string[] = fs.readdirSync(path.join(dir, subDir))
                    .filter((i: string) => {
                        similarNames.forEach((name: string) => {
                            if (i.startsWith(name)) {
                                console.log(i + " was ignored because it belongs to " + name);
                                return false;
                            }
                        });
                        return i.startsWith(start) && i.endsWith(end);
                    });
                contents.forEach((found: string) => {
                    console.log("Extracting: " + path.join(dir, subDir, found));
                    retVal.push(fs.copy(
                        path.join(dir, subDir, found),
                        path.join(extractDir, subDir, found),
                        { overwrite: true }
                    ));
                });
            }
        } else {
            const target: string = path.join(dir, file);
            if (fs.existsSync(target)) {
                console.log("Extracting: " + target);
                retVal.push(fs.copy(target, path.join(extractDir, file), { overwrite: true }));
            }
        }
    });

    retVal.push(writeCharacterDat(
        characterDat,
        path.join(extractDir, "data", "dats")
    ));
    await Promise.allSettled(retVal);
    return;
}

async function removeCharacter(remove: string, dir: string = gameDir): Promise<void> {
    const retVal: Promise<void>[] = [];
    const characters: CharacterList = readCharacterList(dir);
    const similarNames: string[] = [];
    characters.getAllCharacters().forEach((character: Character) => {
        if (character.name.includes(remove) && character.name != remove) {
            similarNames.push(character.name);
        }
    });

    const characterDat: CharacterDat = getCharacterDat(remove, dir);
    filterCharacterFiles(characterDat, true).forEach((file: string) => {
        const subDir: string = path.parse(file).dir;
        if (file.includes("*")) {
            const start: string = path.parse(file).base.split("*")[0].replace(subDir, "");
            const end: string = path.parse(file).base.split("*")[1];
            if (fs.existsSync(path.join(dir, subDir))) {
                const contents: string[] = fs.readdirSync(path.join(dir, subDir))
                    .filter((i: string) => {
                        similarNames.forEach((name: string) => {
                            if (i.startsWith(name)) {
                                console.log(i + " was ignored because it belongs to " + name);
                                return false;
                            }
                        });
                        return i.startsWith(start) && i.endsWith(end);
                    });
                contents.forEach((found: string) => {
                    console.log("Removing: " + path.join(dir, subDir, found));
                    retVal.push(fs.remove(path.join(dir, subDir, found)));
                });
            }
        } else {
            const target: string = path.join(dir, file);
            if (fs.existsSync(target)) {
                console.log("Removing: " + target);
                retVal.push(fs.remove(target));
            }
        }
    });
    const character: Character = characters.getCharacterByName(remove);

    characters.removeCharacterByName(remove);
    retVal.push(writeCharacterList(characters, dir));
    retVal.push(removeCharacterCss(character, dir));
    await Promise.allSettled(retVal);
    return;    
}

function filterCharacterFiles(characterDat: CharacterDat, ignoreSeries: boolean = false): string[] {
    const files: string[] = [];
    CHARACTER_FILES.forEach((file: string) => {
        const fixedFiles: string[] = [];
        let replaced: string = file.replaceAll("<fighter>", characterDat.name);
        if (!ignoreSeries) replaced = replaced.replaceAll("<series>", characterDat.series);
        fixedFiles.push(replaced);
        if (fixedFiles[0].includes("<audio>")) {
            ["ogg", "wav", "mp3"].forEach((format: string) => {
                fixedFiles.push(fixedFiles[0].replaceAll("<audio>", format));
            });
            fixedFiles.shift();
        }
        fixedFiles.forEach((fixedFile: string) => {
            if (fixedFile.includes("<palette>")) {
                characterDat.palettes.forEach((palette: CharacterPalette, index: number) => {
                    fixedFiles.push(fixedFile.replaceAll("<palette>", String(index)));
                });
                fixedFiles.shift();
            }
        });
        fixedFiles.forEach((fixed: string) => {
            files.push(fixed);
        })
    });
    return files;
}

function readCssPages(dir: string = gameDir): CssPage[] {
    const pages: CssPage[] = [];
    const gameSettings: any = ini.parse(fs.readFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    ));
    if (gameSettings["global.css_customs"] == 0) {
        console.log("CSS customs disabled");
        return [{
            name: "Default",
            path: path.join(gameDir, "data", "css.txt")
        }];
    }
    for (
        let number: number = 1;
        number <= parseInt(gameSettings["global.css_custom_number"]);
        number++
    ) {
        pages.push({
            name: gameSettings["global.css_custom_name[" + number + "]"].replaceAll("\"", ""),
            path: path.join(
                gameDir,
                "data",
                gameSettings["global.css_custom[" + number + "]"].replaceAll("\"", "")
            )
        });
    }
    return pages;
}

async function writeCssPages(pages: CssPage[], dir: string = gameDir): Promise<void> {
    let gameSettings: string[] = fs.readFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    ).split(/\r?\n/);
    if (ini.parse(gameSettings.join("\r\n"))["global.css_customs"] == 0) {
        console.log("CSS customs disabled");
        //TODO: throw error
        return;
    }
    gameSettings = gameSettings.map((line: string) => {
        if (line.startsWith("global.css_custom_number")) {
            return ("global.css_custom_number = " + pages.length + ";");
        } else if (
            line.startsWith("global.css_custom[") ||
            line.startsWith("global.css_custom_name[")
        ) {
            return "\n";
        } else {
            return line;
        }
    }).filter((line: string) => line != "\n");

    pages.forEach((page: CssPage, index: number) => {
        gameSettings.push("global.css_custom[" + (index + 1) + "] = \"" +
            path.relative(path.join(dir, "data"), page.path)
            + "\";"
        );
        gameSettings.push("global.css_custom_name[" + (index + 1) + "] = \"" + page.name + "\";");
    });
    fs.writeFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        gameSettings.join("\r\n"),
        { encoding: "ascii" }
    );
    return;
}

async function removeCssPage(page: CssPage, dir: string = gameDir): Promise<void> {
    const pages: CssPage[] = readCssPages(dir).filter((i: CssPage) => i.path != page.path);
    fs.remove(page.path);
    return writeCssPages(pages, dir);
}

async function addCssPage(pageName: string, dir: string = gameDir): Promise<void> {
    pageName = pageName.replace(/'|"/g, "");
    const pagePath: string = pageName.replace(/[\\/:*?|.]/g, "-") + ".txt";
    const pages: CssPage[] = readCssPages(dir);
    pages.push({ name: pageName, path: pagePath });
    writeCssPages(pages, dir);
    fs.ensureFileSync(pagePath);
    fs.writeFileSync(
        pagePath,
        BLANK_CSS_PAGE_DATA,
        { encoding: "ascii" }
    );
    return;
}

function readCssData(page: CssPage): CssData {
    const cssFile: string[] = fs.readFileSync(page.path, "ascii").split(/\r?\n/);
    const css: CssData = cssFile.map((line: string) => line.split(" "));
    css[css.length - 1].pop();
    return css;
}

async function writeCssData(page: CssPage, data: CssData): Promise<void> {
    const output: string = data.map((row: string[]) => row.join(" ")).join("\r\n") + " ";
    // console.log(output + "EOF");
    fs.writeFileSync(
        page.path,
        output,
        { encoding: "ascii" }
    );
    return;
}

async function removeCharacterCss(character: Character, dir: string = gameDir): Promise<void> {
    const retVal: Promise<void>[] = [];
    const cssPages: CssPage[] = readCssPages(dir);
    cssPages.forEach((page: CssPage) => {
        const cssData: CssData = readCssData(page);
        retVal.push(writeCssData(page, cssData.map((row: string[]) => {
            return row.map((cell: string) => {
                if (parseInt(cell) == character.cssNumber) {
                    return "0000";
                } else if (parseInt(cell) > character.cssNumber && cell != "9999") {
                    return ("0000" + (parseInt(cell) - 1)).slice(-4);
                } else {
                    return cell;
                }
            });
        })));
    });
    await Promise.allSettled(retVal);
    return;
}