import { app, BrowserWindow, dialog, shell, OpenDialogReturnValue } from "electron";
import fs from "fs-extra";
import path from "path";
import extract from "extract-zip";
import { createExtractorFromFile, Extractor, ArcFiles, ArcFile } from "node-unrar-js/esm";
// import sevenZip from "node-7z-archive";
import ini from "ini";
import { execFile } from "child_process";
import {
    Character, CharacterList, CharacterDat, CharacterPalette, CssPage, CssData, Download,
    DownloadState, Alt, AppConfig, AppData
} from "./interfaces";
import request from "request";
import http from "http";
import util from "util";
import semver from "semver";

let win: BrowserWindow = null;

require.resolve("./unrar.wasm");
const wasmBinary: Buffer = fs.readFileSync(path.join(__dirname, "unrar.wasm"));

app.on("browser-window-created", (event: Event, window: BrowserWindow) => {
    win = window;
});

const SUPPORTED_VERSIONS: string[] = [
    "CMC_v8",
    "CMC+ v8",
];

const CHARACTER_FILES: string[] = [
    "arcade/routes/<fighter>.txt",
    "arcade/routes/<series>_series.txt",
    "data/dats/<fighter>.dat",
    "fighter/<fighter>.bin",
    "fighter/<fighter>/<any>",
    "gfx/abust/<fighter>.png",
    "gfx/bust/<fighter>.png",
    "gfx/bust/<fighter>_<palette>.png",
    "gfx/cbust/<fighter>.png",
    "gfx/mbust/<fighter>.png",
    "gfx/tbust/<fighter>__<any>.png",
    "gfx/mugs/<fighter>.png",
    "gfx/hudicon/<series>.png",
    "gfx/name/<fighter>.png",
    "gfx/portrait/<fighter>.png",
    "gfx/portrait/<fighter>_<palette>.png",
    "gfx/seriesicon/<series>.png",
    "gfx/stock/<fighter>.png",
    "palettes/<fighter>/<any>",
    "music/versus/<fighter>_<any>.<audio>",
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

const EXTRA_CHARACTER_FILES: string[] = [...CHARACTER_FILES];
EXTRA_CHARACTER_FILES.push(...[
    "data/<fighter>.dat",
    "gfx/portrait_new/<fighter>.png",
    "gfx/portrait_new/<fighter>_<palette>.png",
]);

const BLANK_CSS_PAGE_DATA: string = "\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000 ";

const DEFAULT_CONFIG: AppConfig = {
    enableLogs: false,
    altsAsCharacters: true,
    useUnbinner: false,
    moveBins: false,
    filterCharacterInstallation: true,
    updateCharacters: false
};

const DATA_FILE: string = path.join(app.getPath("userData"), "data.json");
let appData: AppData;
if (!fs.existsSync(DATA_FILE)) {
    writeAppData({
        dir: "",
        config: DEFAULT_CONFIG
    });
} else {
    appData = readJSON(DATA_FILE);
    if (appData.config == undefined) {
        appData.config = DEFAULT_CONFIG;
    }
    writeAppData(appData);
}
appData = readJSON(DATA_FILE);

let gameDir: string = readJSON(DATA_FILE).dir;

const downloads: Download[] = [];

let LOG: string = "";

function log(...objs: any[]): void {
    if (!appData.config.enableLogs) return;
    // console.log(...objs);
    objs.forEach((obj: any) => {
        LOG += util.inspect(obj) + "\n";
    });
    LOG += "\n--------------------\n\n";
}

app.on("before-quit", () => {
    if (LOG == "") return;
    const LOG_FILE: string = path.join(app.getPath("userData"), "log.txt");
    fs.ensureFileSync(LOG_FILE);
    fs.appendFile(LOG_FILE, LOG);
});

function readJSON(file: string): any {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

async function writeJSON(file: string, data: object): Promise<void> {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf-8");
    return;
}

export function readAppData(): AppData {
    return appData;
}

export async function writeAppData(data: AppData): Promise<void> {
    appData = data;
    await writeJSON(DATA_FILE, data);
    return;
}

function isNumber(num: string): boolean {
    return /^\+?(0|[1-9]\d*)$/.test(num);
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
                wasmBinary: wasmBinary,
                filepath: archive,
                targetPath: output
            });
            const extracted: ArcFiles = extractor.extract();
            log(extracted);
            const files: ArcFile[] = [...extracted.files];
            log(files);
            break;
        case ".7z":
            //FIXME: doesn't work
            // await sevenZip.extractArchive(archive, output, {}, true);
            break;
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
    }, (error: string, res: http.IncomingMessage, body: string) => {
        const latestVersion: string = semver.clean(JSON.parse(body).tag_name)
        if (semver.lt(currentVersion, latestVersion)) {
            console.log("Update Required");
            return;
        }
        handleURI(process.argv.find((arg: string) => arg.startsWith("cmcmm:")));
    });
}

export function isURIAssociated(): boolean {
    return (!app.isPackaged || app.isDefaultProtocolClient("cmcmm"));
}

export async function handleURI(uri: string): Promise<void> {
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
        .on("error", (error: Error) => { log(error) })
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
                const output: string = await extractArchive(filePath, temp);
                fs.removeSync(filePath);
                downloads[downloadId].filePath = output;
                downloads[downloadId].state = DownloadState.finished;
                log(output);
                //TODO: switch between character and stage
                // move 'fighters' folder search to more generic function
                installCharacter(output, true, false, gameDir);
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
    downloads[downloadId].image = "https://gamebanana.com/mods/embeddables/" +
        modId + "?type=large";
    request.get(
        {
            url: "https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&itemid=" +
                modId + "&fields=name,RootCategory().name"
        },
        (error: string, res: http.IncomingMessage, body: string) => {
            [downloads[downloadId].name, downloads[downloadId].modType] = JSON.parse(body);
            log(downloads);
        }
    );
    return;
}

export function getGameDir(): string {
    return gameDir;
}

export function getExtractedDir(): string {
    return path.join(gameDir, "0extracted");
}

export function getDownloads(): Download[] {
    return downloads;
}

export function getGameVersion(
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

export async function isValidGameDir(dir: string = gameDir): Promise<boolean> {
    return (dir != null && getGameVersion(dir) != null);
}

export async function selectGameDir(): Promise<string | null> {
    log("Extract Archive - Start");
    const dir: OpenDialogReturnValue = await dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    });
    if (dir.canceled == true) {
        log("Extract Archive - Exit: Selection Cancelled");
        return null;
    }
    if (!await isValidGameDir(dir.filePaths[0])) {
        //TODO: inform the user
        log("Extract Archive - Exit: Invalid Game Dir");
        return null;
    }

    getAllFiles(dir.filePaths[0]).forEach((file: string) => {
        fs.chmod(file, 0o777);
    });
    gameDir = dir.filePaths[0];
    appData = readJSON(DATA_FILE);
    appData.dir = gameDir;
    writeAppData(appData);
    log("Extract Archive - Return:", gameDir);
    return gameDir;
}

export async function openDir(dir: string): Promise<void> {
    await shell.openPath(dir);
    return;
}

export async function runGame(dir: string = gameDir): Promise<void> {
    execFile(path.join(dir, getGameVersion(gameDir) + ".exe"), {
        cwd: dir,
        windowsHide: true
    });
    return;
}

export function readCharacters(dir: string = gameDir): Character[] {
    return readCharacterList(dir).getAllCharacters();
}

export function readCharacterList(dir: string = gameDir): CharacterList {
    log("Read Character List - Start:", dir);
    const alts: Alt[] = readAlts(dir);
    const characters: CharacterList = new CharacterList();
    const charactersTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighters.txt"),
        "ascii"
    ).split(/\r?\n/);
    charactersTxt.shift(); // Drop the number
    charactersTxt.forEach((character: string, index: number) => {
        if (fs.existsSync(path.join(dir, "data", "dats", character + ".dat"))) {
            const characterDat: CharacterDat = readCharacterDat(character, dir);
            characters.addCharacter({
                name: character,
                menuName: characterDat.menuName,
                series: characterDat.series,
                randomSelection: true, // Assume true and then iterate through false list
                cssNumber: index + 1,
                alts: alts.filter((alt: Alt) => alt.base == character),
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
    log("Read Character List - Return:", characters);
    return characters;
}

export async function writeCharacters(
    characters: Character[],
    dir: string = gameDir
): Promise<void> {
    log("Write Characters - Start:", characters, dir);
    characters.sort((a: Character, b: Character) =>
        (a.cssNumber > b.cssNumber ? 1 : -1)
    );
    const output: string = [
        characters.length,
        characters.map((character: Character) => character.name).join("\r\n")
    ].join("\r\n");
    fs.writeFileSync(
        path.join(dir, "data", "fighters.txt"),
        output,
        { encoding: "ascii" }
    );
    log("Write Characters - Return");
    return;
}

export async function writeCharacterRandom(
    character: string,
    randomSelection: boolean,
    dir: string = gameDir
): Promise<void> {
    log("Write Character Random - Start:", character, randomSelection, dir);
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
    let output: string = lockedTxt.length + "\r\n";
    output += lockedTxt.join("\r\n");
    fs.writeFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        output,
        { encoding: "ascii" }
    );
    log("Write Character Random - Return");
    return;
}

export function readAlts(dir: string = gameDir): Alt[] {
    log("Read Alts - Start:", dir);
    const altsTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "alts.txt"),
        "ascii"
    ).split(/\r?\n/);
    altsTxt.shift(); // Drop the number
    const alts: Alt[] = [];
    for (let alt: number = 0; alt < Math.floor(altsTxt.length / 5); alt++) {
        alts.push({
            base: altsTxt[(alt * 5) + 0],
            alt: altsTxt[(alt * 5) + 2],
            number: parseInt(altsTxt[(alt * 5) + 1]),
            menuName: altsTxt[(alt * 5) + 3],
            battleName: altsTxt[(alt * 5) + 4],
            mug: path.join(dir, "gfx", "mugs", altsTxt[(alt * 5) + 2] + ".png")
        });
    }
    log("Read Alts - Return:", alts);
    return alts;
}

export async function writeAlts(alts: Alt[], dir: string = gameDir): Promise<void> {
    log("Write Alts - Start:", alts, dir);
    //TODO: verify alt numbers
    let output: string = alts.length + "\r\n";
    output += alts.map((alt: Alt) =>
        [
            alt.base,
            alt.number,
            alt.alt,
            alt.menuName,
            alt.battleName
        ].join("\r\n")
    ).join("\r\n");
    fs.writeFileSync(
        path.join(dir, "data", "alts.txt"),
        output,
        { encoding: "ascii" }
    );
    log("Write Alts - Return");
    return;
}

export async function addAlt(
    base: Character,
    newAlt: Character,
    dir: string = gameDir
): Promise<void> {
    log("Add Alt - Start:", base, newAlt, dir);
    const alts: Alt[] = readAlts(dir);
    let altNumber: number = 1;
    alts.filter((alt: Alt) => alt.base == base.name).forEach((alt: Alt) => {
        if (alt.number > altNumber) altNumber = alt.number;
    });
    const newAltDat: CharacterDat = readCharacterDat(newAlt.name, dir);
    alts.push({
        base: base.name,
        alt: newAlt.name,
        number: altNumber + 1,
        menuName: newAlt.menuName,
        battleName: newAltDat.battleName,
        mug: newAlt.mug
    });
    await writeAlts(alts, dir);
    log("Add Alt - Return");
    return;
}

export async function removeAlt(
    alt: Alt,
    ensureAccessible: boolean = true,
    dir: string = gameDir
): Promise<void> {
    log("Remove Alt - Start:", alt, ensureAccessible, dir);
    const alts: Alt[] = readAlts(dir).filter((i: Alt) => !(
        i.base == alt.base &&
        i.alt == alt.alt &&
        i.number == alt.number
    )).map((i: Alt) => {
        if (i.base == alt.base && i.number > alt.number) {
            i.number--;
        }
        return i;
    });
    await writeAlts(alts, dir);
    if (ensureAccessible) {
        await ensureAltAccessible(alt, dir);
    }
    log("Remove Alt - Return");
    return;
}

export async function ensureAltAccessible(alt: Alt, dir: string = gameDir): Promise<void> {
    log("Ensure Alt Accessible - Start:", alt, dir);
    const characterList: CharacterList = readCharacterList(dir);
    if (characterList.getCharacterByName(alt.alt) != undefined) return;

    const characterDat: CharacterDat = readCharacterDat(alt.alt, dir);
    const baseCharacter: Character = characterList.getCharacterByName(alt.base);
    characterList.addCharacter({
        name: alt.alt,
        menuName: characterDat == null ? alt.menuName : characterDat.menuName,
        series: characterDat == null ? baseCharacter.series : characterDat.series,
        randomSelection: true,
        cssNumber: characterList.getNextCssNumber(),
        alts: [],
        mug: path.join(dir, "gfx", "mugs", alt.alt + ".png")
    });

    await writeCharacters(characterList.getAllCharacters(), dir);
    log("Ensure Alt Accessible - Return");
    return;
}

export async function removeAllAlts(character: Character, dir: string = gameDir): Promise<void> {
    log("Remove All Alts - Start:", character, dir);
    // remove each of character's alts
    while (character.alts.length > 0) {
        await removeAlt(character.alts[0], true, dir);
        // all remaining alts experience a decrease in number within the files, so to ensure a match
        // this needs to be reflected in this functions array of alts.
        character.alts.shift();
        character.alts = character.alts.map((alt: Alt) => {
            alt.number--;
            return alt;
        });
    }
    // remove character from other's alts
    for (const alt of readAlts(dir).filter(
        (alt: Alt) => alt.alt == character.name
    )) {
        await removeAlt(alt, false, dir);
    }
    log("Remove All Alts - Return");
    return;
}

export function readCharacterDat(character: string, dir: string = gameDir): CharacterDat {
    return readCharacterDatPath(path.join(dir, "data", "dats", character + ".dat"), character);
}

export function readCharacterDatPath(
    datPath: string,
    character: string = path.parse(datPath).name
): CharacterDat | null {
    log("Read Character Dat Path - Start:", datPath, character);
    if (!fs.existsSync(datPath)) return null;
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
    const characterDat: CharacterDat = {
        name: character,
        displayName: displayName,
        menuName: menuName,
        battleName: battleName,
        series: series,
        homeStages: homeStages,
        randomDatas: randomDatas,
        palettes: palettes
    };
    log("Read Character Dat Path - Return:", characterDat);
    return characterDat;
}

export async function writeCharacterDat(dat: CharacterDat, destination: string): Promise<void> {
    log("Write Character Dat - Start:", dat, destination);
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
    log("Write Character Dat - Return");
    return;
}

export async function installCharacterDir(
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = gameDir
): Promise<void> {
    log("Install Character Dir - Start:", filterInstallation, updateCharacters, dir);
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    });
    if (selected.canceled == true) {
        log("Install Character Dir - Exit: Selection Cancelled");
        return null;
    }
    await installCharacter(selected.filePaths[0], filterInstallation, updateCharacters, dir);
    log("Install Character Dir - Return");
    return;
}

export async function installCharacterArchive(
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = gameDir
): Promise<void> {
    log("Install Character Arch - Start:", filterInstallation, updateCharacters, dir);
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(win, {
        properties: ["openFile"]
    });
    if (selected.canceled == true) {
        log("Install Character Arch - Exit: Selection Cancelled");
        return null;
    }
    fs.ensureDirSync(path.join(dir, "_temp"));
    fs.emptyDirSync(path.join(dir, "_temp"));
    const output: string = await extractArchive(selected.filePaths[0], path.join(dir, "_temp"));
    log(output, filterInstallation);
    await installCharacter(output, filterInstallation, updateCharacters, dir);
    log("Install Character Arch - Return");
    return;
}

export async function installCharacter(
    characterDir: string,
    filterInstallation: boolean = true,
    updateCharacters: boolean = false,
    dir: string = gameDir
): Promise<void> {
    log("Install Character - Start:", characterDir, filterInstallation, updateCharacters, dir);
    const toResolve: Promise<void>[] = [];
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
        log("Install Character - Exit: No Fighter Directory");
        return;
    }
    log(correctedDir);

    const character: string = fs.readdirSync(path.join(correctedDir, "fighter"))
        .filter((file: string) => {
            return file.endsWith(".bin") || !file.includes(".");
        })[0].split(".")[0];
    log(character);

    let characterDat: CharacterDat;
    if (fs.existsSync(path.join(correctedDir, "data", "dats", character + ".dat"))) {
        characterDat = readCharacterDatPath(
            path.join(correctedDir, "data", "dats", character + ".dat"),
            character
        );
    } else if (fs.existsSync(path.join(correctedDir, "data", character + ".dat"))) {
        characterDat = readCharacterDatPath(
            path.join(correctedDir, "data", character + ".dat"),
            character
        );
    } else {
        //TODO: inform user
        log("Install Character - Exit: No Dat File");
        return;
    }
    log(characterDat);

    const characters: CharacterList = readCharacterList(dir);
    if (!updateCharacters && characters.getCharacterByName(character) != undefined) {
        //TODO: inform user
        log("Install Character - Exit: Character Already Installed");
        return;
    }

    if (filterInstallation) {
        getCharacterFiles(correctedDir, characterDat, false, false).forEach((file: string) => {
            const filePath: string = path.join(correctedDir, file);
            const targetPath: string = path.join(dir, file);
            fs.ensureDirSync(path.parse(targetPath).dir);
            if (!updateCharacters && fs.existsSync(targetPath)) return;
            log("Copying: " + filePath);
            toResolve.push(
                fs.copy(
                    filePath,
                    targetPath,
                    { overwrite: !file.startsWith("gfx/seriesicon/") }
                )
            );
        });
    } else {
        log("Copying: All Files");
        toResolve.push(fs.copy(correctedDir, dir, { overwrite: true }));
    }

    toResolve.push(writeCharacterDat(
        characterDat,
        path.join(dir, "data", "dats")
    ));

    if (characters.getCharacterByName(character) != undefined) {
        log("Install Character - Return: Character Already In List");
        return;
    }
    characters.addCharacter({
        name: character,
        menuName: characterDat.menuName,
        series: characterDat.series,
        randomSelection: true,
        cssNumber: characters.getNextCssNumber(),
        alts: [],
        mug: path.join(dir, "gfx", "mugs", character + ".png")
    });
    toResolve.push(writeCharacters(characters.getAllCharacters(), dir));
    await Promise.allSettled(toResolve);
    log("Install Character - Return");
    return;
}

export async function extractCharacter(extract: string, dir: string = gameDir): Promise<void> {
    log("Extract Character - Start:", extract, dir);
    const toResolve: Promise<void>[] = [];
    const characters: Character[] = readCharacters(dir);
    const similarNames: string[] = [];
    const characterDat: CharacterDat = readCharacterDat(extract, dir);
    const extractDir: string = path.join(dir, "0extracted", extract);
    characters.forEach((character: Character) => {
        if (character.name.includes(extract) && character.name != extract) {
            similarNames.push(character.name);
        }
    });
    
    console.log(new Date().getTime());
    getCharacterFiles(dir, characterDat, true, false, similarNames).forEach((file: string) => {
        const filePath: string = path.join(dir, file);
        const targetPath: string = path.join(extractDir, file);
        fs.ensureDirSync(path.parse(targetPath).dir);
        log("Extracting: " + filePath);
        toResolve.push(
            fs.copy(
                filePath,
                targetPath,
                { overwrite: true }
            )
        );
    });
    console.log(new Date().getTime());

    toResolve.push(writeCharacterDat(
        characterDat,
        path.join(extractDir, "data", "dats")
    ));
    await Promise.allSettled(toResolve);
    log("Extract Character - Return");
    return;
}

export async function removeCharacter(remove: string, dir: string = gameDir): Promise<void> {
    log("Remove Character - Start:", remove, dir);
    const toResolve: Promise<void>[] = [];
    const character: Character = readCharacterList(dir).getCharacterByName(remove);
    await removeAllAlts(character, dir);
    const characters: CharacterList = readCharacterList(dir);
    const characterDat: CharacterDat = readCharacterDat(remove, dir);

    const similarNames: string[] = [];
    characters.getAllCharacters().forEach((character: Character) => {
        if (character.name.startsWith(remove) && character.name != remove) {
            similarNames.push(character.name);
        }
    });

    console.log(new Date().getTime());
    getCharacterFiles(dir, characterDat, true, true, similarNames).forEach((file: string) => {
        const filePath: string = path.join(dir, file);
        log("Removing: " + filePath);
        toResolve.push(
            fs.remove(filePath)
        );
    });
    console.log(new Date().getTime());
    
    characters.removeCharacterByName(remove);
    toResolve.push(writeCharacters(characters.getAllCharacters(), dir));
    toResolve.push(removeCharacterCss(character, dir));
    toResolve.push(writeCharacterRandom(character.name, true, dir));
    await Promise.allSettled(toResolve);
    log("Remove Character - Return");
    return;    
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getCharacterRegExps(
    characterDat: CharacterDat,
    includeExtraFiles: boolean,
    ignoreSeries: boolean = false
): RegExp[] {
    log("Filter Character Files - Start:", characterDat, includeExtraFiles, ignoreSeries);
    const files: RegExp[] = [];
    (includeExtraFiles ? EXTRA_CHARACTER_FILES : CHARACTER_FILES).forEach((file: string) => {
        let wipString: string = file.replaceAll("<fighter>", characterDat.name);
        if (!ignoreSeries) wipString = wipString.replaceAll("<series>", characterDat.series);
        wipString = escapeRegex(wipString);
        wipString += "$";
        wipString = wipString.replaceAll("<audio>", "(mp3|wav|ogg)");
        wipString = wipString.replaceAll("<palette>", "\\d+");
        wipString = wipString.replaceAll("<any>", "[^\\/\\\\]+");
        files.push(new RegExp(wipString, "gm"));
    });
    log("Filter Character Files - Return:", files);
    return files;
}

export function getCharacterFiles(
    dir: string,
    characterDat: CharacterDat,
    includeExtraFiles: boolean,
    ignoreSeries: boolean,
    similarNames: string[] = []
): string[] {
    const characterFiles: string[] = getAllFiles(dir)
        .map((file: string) => path.posix.relative(dir, file));
    // (includeExtraFiles ? EXTRA_CHARACTER_FILES : CHARACTER_FILES).forEach((file: string) => {
    //     if (!/.*\.[^/\\]+$/.test(file) && fs.existsSync(path.join(dir, file))) {
    //         //
    //     }
    // });
    let characterFilesString: string = characterFiles.join("\n");
    const validFiles: string[] = [];
    getCharacterRegExps(characterDat, includeExtraFiles, ignoreSeries).forEach((exp: RegExp) => {
        // console.log(exp);
        for (const match of characterFilesString.matchAll(exp)) {
            // console.log(match);
            validFiles.push(match[0]);
            characterFiles.splice(characterFiles.indexOf(match[0]), 1);
        }
        characterFilesString = characterFiles.join("\n");
    });
    similarNames.forEach((name: string) => {
        const validFilesString: string = validFiles.join("\n");
        getCharacterRegExps(readCharacterDat(name, dir), includeExtraFiles, ignoreSeries)
            .forEach((exp: RegExp) => {
                for (const match of validFilesString.matchAll(exp)) {
                    validFiles.splice(validFiles.indexOf(match[0]), 1);
                }
            });
    });
    console.log(validFiles);
    return validFiles;
}

export function readCssPages(dir: string = gameDir): CssPage[] {
    log("Read CSS Pages - Start:", dir);
    const pages: CssPage[] = [];
    const gameSettings: any = ini.parse(fs.readFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    ));
    if (gameSettings["global.css_customs"] == 0) {
        pages.push({
            name: "Default",
            path: path.join(gameDir, "data", "css.txt")
        });
        log("Read CSS Pages - Return: CSS Customs Disabled", pages);
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
    log("Read CSS Pages - Return:", pages);
    return pages;
}

export async function writeCssPages(pages: CssPage[], dir: string = gameDir): Promise<void> {
    log("Write CSS Pages - Start:", pages, dir);
    let gameSettings: string[] = fs.readFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    ).split(/\r?\n/);
    if (ini.parse(gameSettings.join("\r\n"))["global.css_customs"] == 0) {
        //TODO: throw error
        log("Write CSS Pages - Exit: CSS Customs Disabled");
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
    log("Write CSS Pages - Return");
    return;
}

export async function removeCssPage(page: CssPage, dir: string = gameDir): Promise<void> {
    log("Remove CSS Page - Start:", page, dir);
    const pages: CssPage[] = readCssPages(dir).filter((i: CssPage) => i.path != page.path);
    fs.remove(page.path);
    await writeCssPages(pages, dir);
    log("Remove CSS Page - Return");
    return;
}

export async function addCssPage(pageName: string, dir: string = gameDir): Promise<void> {
    log("Add CSS Page - Start:", pageName, dir);
    pageName = pageName.replace(/'|"/g, "");
    const pagePath: string = path.join(
        dir, "data", "css",
        pageName.replace(/[\\/:*?|. ]/g, "-") + ".txt"
    );
    const pages: CssPage[] = readCssPages(dir);
    pages.push({ name: pageName, path: pagePath });
    writeCssPages(pages, dir);
    fs.ensureFileSync(pagePath);
    fs.writeFileSync(
        pagePath,
        BLANK_CSS_PAGE_DATA,
        { encoding: "ascii" }
    );
    log("Add CSS Page - Return");
    return;
}

export function readCssData(page: CssPage): CssData {
    log("Read CSS Data - Start:", page);
    const cssFile: string[] = fs.readFileSync(page.path, "ascii").split(/\r?\n/);
    const css: CssData = cssFile.map((line: string) => line.split(" "));
    css[css.length - 1].pop();
    log("Read CSS Data - Return:", css);
    return css;
}

export async function writeCssData(page: CssPage, data: CssData): Promise<void> {
    log("Write CSS Data - Start:", page, data);
    const output: string = data.map((row: string[]) => row.join(" ")).join("\r\n") + " ";
    fs.writeFileSync(
        page.path,
        output,
        { encoding: "ascii" }
    );
    log("Write CSS Data - Return");
    return;
}

export async function removeCharacterCss(
    character: Character,
    dir: string = gameDir
): Promise<void> {
    log("Remove Character CSS - Start:", character, dir);
    const toResolve: Promise<void>[] = [];
    const cssPages: CssPage[] = readCssPages(dir);
    cssPages.forEach((page: CssPage) => {
        const cssData: CssData = readCssData(page);
        toResolve.push(writeCssData(page, cssData.map((row: string[]) => {
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
    await Promise.allSettled(toResolve);
    log("Remove Character CSS - Return");
    return;
}

export async function removeSeries(series: string, dir: string = gameDir): Promise<void> {
    const charactersToRemove: Character[] = readCharacters(dir)
        .filter((character: Character) => character.series == series);
    const altsToRemove: Alt[] = [];
    charactersToRemove.forEach((character: Character) => {
        character.alts.forEach((alt: Alt) => {
            if (alt.alt != alt.base) altsToRemove.push(alt);
        });
    });
    console.log(new Date().getTime());
    for (const character of charactersToRemove) {
        console.log(character);
        await removeCharacter(character.name, dir);
    }
    for (const alt of altsToRemove) {
        console.log(alt);
        await removeCharacter(alt.alt, dir);
    }
    console.log(new Date().getTime());
    return;
}