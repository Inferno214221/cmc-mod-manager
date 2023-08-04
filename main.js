const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require("path");
// const fs = require("fs");
const fs = require("fs-extra");
const childProcess = require("child_process");
require('array.prototype.move');
const extract = require('extract-zip');
const strftime = require('strftime');
const unrar = require("node-unrar-js");
var win;

const SUPPORTED_VERSIONS = [
    "CMC+ v8",
    "CMC Plus Open"
];

const PERSIST = [
    "controls.ini",
    "settings.ini",
    "data/cmc_stuff.bin",
    "data/records.bin",
    "data/stats/general.bin",
    "data/css.txt",
    "data/css",
    "data/unlock.bin",
    "data/GAME_SETTINGS.txt"//FIXME:
];

const BLOAT = [
    "/.png",
    "/.txt",
    "/.md",
    "/gfx/.png",
    "/gfx/.gif",
    "/tools",
    "/character guides"
];

const CHARACTER_FILES = [
    "arcade/routes/<fighter>.txt",
    "data/<fighter>.dat",
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
    "gfx/portrait_new/<fighter>.png",
    "gfx/portrait_new/<fighter>_<palette>.png",
    "gfx/seriesicon/<series>.png",
    "gfx/stock/<fighter>.png",
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

var version = getGameVersion(__dirname + "/cmc/");

const createWindow = () => {
    win = new BrowserWindow({
        width: 1120,
        height: 630,
        minWidth: 810,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        autoHideMenuBar: true
    });

    win.loadFile('index.html');
}

function reRequire(file) {
    return JSON.parse(fs.readFileSync(file));
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    /*if (process.platform !== 'darwin') */
    app.quit();
});

// General

ipcMain.on("openDir", (event, dir) => {
    shell.openPath(path.join(__dirname, dir));
});

function getGameVersion(dir) {
    for(let game of SUPPORTED_VERSIONS) {
        if (fs.existsSync(path.join(dir, game + ".exe"))) {
            return game;
        }
    }
    return null;
}

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            // arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    })

    return arrayOfFiles;
}

function getCharacters() {
    let fighters = [];
    let fightersTxt = fs.readFileSync(path.join(__dirname, "cmc", "data", "fighters.txt"), "ascii").split(/\r?\n/);
    fightersTxt.shift();
    fightersTxt.forEach((fighter) => {
        if (fs.existsSync(path.join(__dirname, "cmc", "data", "dats", fighter + ".dat"))) {
            let fighterDat = fs.readFileSync(path.join(__dirname, "cmc", "data", "dats", fighter + ".dat"), "ascii").split(/\r?\n/);
            fighters.push({
                name: fighter,
                displayName: fighterDat[1],
                series: fighterDat[3].toLowerCase(),
            });
        } else {
            //TODO: throw error?
        }
    });
    return fighters;
}

function appendCharacter(add) {
    let characters = getCharacters();
    let output = (characters.length + 1) + "\r\n";
    characters.forEach((character) => {
        output += character.name + "\r\n";
    });
    output += add + "\r\n";
    fs.writeFileSync(path.join(__dirname, "cmc", "data", "fighters.txt"), output, "ascii");
}

function dropCharacter(drop) {
    let characters = getCharacters();
    characters.filter((character) => {
       return character.name != drop;
    });
    let output = (characters.length + 1) + "\r\n";
    characters.forEach((character) => {
        output += character.name + "\r\n";
    });
    fs.writeFileSync(path.join(__dirname, "cmc", "data", "fighters.txt"), output, "ascii");
    //TODO: remove from css
}

// Index

ipcMain.on("checkGameInstalled", (event, args) => {
    win.webContents.send("from_checkGameInstalled", version != null);
});

ipcMain.on("importUnmodded", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        if (getGameVersion(path.join(dir.filePaths[0])) == null) {
            win.webContents.send("throwError", "No recognised .exe file in the selected directory.");
            return;
        }
        //The new version has horrible permissions so give everything xwr
        getAllFiles(dir.filePaths[0]).forEach((file) => {
            fs.chmodSync(file, 0o777);
        });
        fs.ensureDirSync(path.join(__dirname, "cmc"));
        fs.emptyDirSync(path.join(__dirname, "cmc"));
        
        fs.copySync(dir.filePaths[0], path.join(__dirname, "cmc"), { overwrite: true });
        version = getGameVersion(path.join(__dirname, "cmc"));

        win.webContents.send("from_importUnmodded", true);
    });
});

ipcMain.on("runGame", (event, args) => {
    childProcess.execFile(path.join(__dirname, "cmc", version + ".exe"), {
        cwd: path.join(__dirname, "cmc"),
        windowsHide: true
    });
});

// Characters

ipcMain.on("getCharacterList", (event, args) => {
    win.webContents.send("from_getCharacterList", getCharacters());
});

ipcMain.on("installCharacterDir", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        installCharacter(dir.filePaths[0], args);
    });
});

ipcMain.on("installCharacterArch", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openFile"]
    }).then(async (file) => {
        if (file.canceled === true) {
            return;
        }
        let filePath = file.filePaths[0];
        let modName = path.parse(filePath).name;
        let dir = path.join(__dirname + "_temp");
        dir = path.join(dir, modName);
        console.log(path.parse(filePath).ext.toLowerCase());
        switch (path.parse(filePath).ext.toLowerCase()) {
            case ".zip":
                await extract(filePath, {
                    dir: dir,
                    defaultDirMode: 0o777,
                    defaultFileMode: 0o777,
                });
                break;
            case ".rar"://TODO: Error handling
                let buf = Uint8Array.from(fs.readFileSync(filePath)).buffer;
                let extractor = await unrar.createExtractorFromData({ data: buf });
                const extracted = extractor.extract();
                const files = [...extracted.files];
                files.forEach(fileE => {// Make All Folders First
                    if (fileE.fileHeader.flags.directory) {
                        fs.ensureDirSync(path.join(dir, fileE.fileHeader.name));
                    }
                });
                files.forEach(fileE => {// Make All Folders First
                    if (!fileE.fileHeader.flags.directory) {
                        fs.writeFileSync(path.join(dir, + fileE.fileHeader.name), Buffer.from(fileE.extraction));
                    }
                });
                break;
            case ".7z":
            default:
                return;
                break;
        }
        await installCharacter(dir, args);
        fs.removeSync(path.join(__dirname, "_temp"));
    });
});

function installCharacter(dir, filteredInstall) {
    if (!fs.existsSync(path.join(dir, "fighter"))) {
        dir += path.join(path.parse(dir).base);
    }
    if (!fs.existsSync(path.join(dir, "fighter"))) {
        win.webContents.send("throwError", "Can't find the target character's ./fighter/ directory.");
        return;
    }
    let characterName = fs.readdirSync(path.join(dir, "fighter"))[0].split(".")[0];
    if (!fs.existsSync(path.join(dir, "data", "dats", characterName + ".dat"))) {
        win.webContents.send("throwError", "The character's dat file is not in the ./data/dats/ directory.");
        return;
    }
    for (let character of getCharacters()) {
        if (character.name == characterName) {
            win.webContents.send("throwError", "The selected character is already installed.");
            return;
        }
    };
    let characterDat = fs.readFileSync(path.join(dir, "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);

    let datMod = !characterDat[4].includes("---Classic Home Stages Below---");
    let characterDatTxt = "";
    if (datMod) {
        characterDat.splice(4, 1, "---Classic Home Stages Below---", "1", "battlefield", "---Random Datas---", "0", "---Palettes Number---");
        characterDat.splice(11, 0, "---From Here is Individual Palettes data---");
        characterDat.forEach((line) => {
            characterDatTxt += line + "\r\n";
        });
    }

    if (filteredInstall) {
        filterCharacterFiles(characterName, characterDat).forEach((file) => {
            let subDir = path.parse(file).dir;
            if (file.includes("*")) {
                let start = path.parse(file).base.split("*")[0].replace(subDir, "");
                let end = path.parse(file).base.split("*")[1];
                if (fs.existsSync(path.join(dir, subDir))) {
                    let contents = fs.readdirSync(path.join(dir, subDir)).filter((i) => {
                        return i.startsWith(start) && i.endsWith(end);
                    });
                    contents.forEach((found) => {
                        console.log("Copying: " + path.join(dir, subDir, found));
                        fs.copySync(path.join(dir, subDir, found), path.join(__dirname, "cmc", subDir, found), {overwrite: true});
                    });
                }
            } else {
                if (fs.existsSync(path.join(dir, file))) {
                    console.log("Copying: " + path.join(dir, file));
                    fs.copySync(path.join(dir, file), path.join(__dirname, "cmc", file), {overwrite: true});
                }
            }
        });
    } else {
        fs.copySync(dir, path.join(__dirname, "cmc"), {overwrite: true});
    }

    appendCharacter(characterName);

    if (datMod) {
        fs.writeFileSync(
            path.join(__dirname, "cmc", "data", "dats", characterName + ".dat"),
            characterDatTxt,
            "ascii"
        );
    }

    win.webContents.send("from_installCharacter");
}

ipcMain.on("removeCharacter", (event, args) => {
    let characters = getCharacters();
    let characterName = characters[args].name;
    let similarName = [];
    characters.forEach((character) => {
        if (character.name != characterName && character.name.startsWith(characterName)) {
            similarName.push(character.name);
        }
    });
    let characterDat = fs.readFileSync(path.join(__dirname, "cmc", "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);
    filterCharacterFiles(characters[args].name, characterDat).forEach((file) => {
        let subDir = path.parse(file).dir;
        if (file.includes("*")) {
            let start = path.parse(file).base.split("*")[0].replace(subDir, "");
            let end = path.parse(file).base.split("*")[1];
            if (fs.existsSync(path.join(__dirname, "cmc", subDir))) {
                let contents = fs.readdirSync(path.join(__dirname, "cmc", subDir)).filter((i) => {
                    similarName.forEach((name) => {
                        if (i.startsWith(name)) {
                            console.log(i + " was ignored because it belongs to " + name);
                            return false;
                        }
                    });
                    return i.startsWith(start) && i.endsWith(end);
                });
                contents.forEach((found) => {
                    console.log("Removing: " + path.join(__dirname, "cmc", subDir, found));
                    fs.removeSync(path.join(__dirname, "cmc", subDir, found));
                });
            }
        } else {
            if (fs.existsSync(path.join(__dirname, "cmc", file))) {
                console.log("Removing: " + path.join(__dirname, "cmc", file));
                fs.removeSync(path.join(__dirname, "cmc", file));
            }
        }
    });
    dropCharacter(characterName);

    win.webContents.send("from_removeCharacter");
});

ipcMain.on("extractCharacter", (event, args) => {
    let characters = getCharacters();
    let characterName = characters[args].name;
    let similarName = [];
    characters.forEach((character) => {
        if (character.name != characterName && character.name.startsWith(characterName)) {
            similarName.push(character.name);
        }
    });
    let characterDat = fs.readFileSync(path.join(__dirname, "cmc", "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);
    filterCharacterFiles(characters[args].name, characterDat).forEach((file) => {
        let subDir = path.parse(file).dir;
        fs.ensureDirSync(path.join(__dirname, "extracted", characterName, subDir));
        if (file.includes("*")) {
            let start = path.parse(file).base.split("*")[0].replace(subDir, "");
            let end = path.parse(file).base.split("*")[1];
            if (fs.existsSync(path.join(__dirname, "cmc", subDir))) {
                let contents = fs.readdirSync(path.join(__dirname, "cmc", subDir)).filter((i) => {
                    similarName.forEach((name) => {
                        if (i.startsWith(name)) {
                            console.log(i + " was ignored because it belongs to " + name);
                            return false;
                        }
                    });
                    return i.startsWith(start) && i.endsWith(end);
                });
                contents.forEach((found) => {
                    console.log("Extracting: " + path.join(__dirname, "cmc", subDir, found));
                    fs.copySync(path.join(__dirname, "cmc", subDir, found), path.join(__dirname, "extracted", characterName, subDir, found), {overwrite: true});
                    fs.removeSync(path.join(__dirname, "cmc", subDir, found));
                });
            }
        } else {
            if (fs.existsSync(path.join(__dirname, "cmc", file))) {
                console.log("Extracting: " + path.join(__dirname, "cmc", file));
                fs.copySync(path.join(__dirname, "cmc", file), path.join(__dirname, "extracted", characterName, file), {overwrite: true});
                fs.removeSync(path.join(__dirname, "cmc", file));
            }
        }
    });
    dropCharacter(characterName);

    win.webContents.send("from_removeCharacter");
});

function filterCharacterFiles(characterName, characterDat = null) {
    let palettes;
    if (characterDat == null) {
        palettes = 20;
    } else {
        palettes = parseInt(characterDat[11]) - 1;
    }

    let files = [];
    CHARACTER_FILES.forEach((file) => {
        let fixedFiles = [];
        fixedFiles.push(file.replace("<fighter>", characterName).replace("<series>", characterDat[3]));
        if (fixedFiles[0].includes("<audio>")) {
            ["ogg", "wav", "mp3"].forEach((format) => {
                fixedFiles.push(fixedFiles[0].replace("<audio>", format));
            });
            fixedFiles.shift();
        }
        fixedFiles.forEach((fixedFile) => {
            if (fixedFile.includes("<palette>")) {
                for (let p = 0; p < palettes; p++) {
                    fixedFiles.push(fixedFile.replace("<palette>", p + 1));
                }
                fixedFiles.shift();
            }
        });

        fixedFiles.forEach((fixed) => {
            files.push(fixed);
        });
    });
    return files;
}

// Character Selection Screen

ipcMain.on("getPages", (event, args) => {
    let pages = [];
    pages.push("css.txt");
    getAllFiles(path.join(__dirname, "cmc", "data", "css")).forEach((file) => {
        pages.push(path.join("css", path.parse(file).base));
    });
    console.log(pages);
    win.webContents.send("fromGetPages", pages);
});

ipcMain.on("getCSS", (event, args) => {
    let cssFile = fs.readFileSync(path.join(__dirname, "cmc", "data", args), "ascii").split(/\r?\n/);
    let css = [];
    cssFile.forEach((line) => {
        css.push(line.split(" "))
    });
    css[css.length - 1].pop();
    win.webContents.send("fromGetCSS", {
        css: css,
        characters: getCharacters(),
    });
});

ipcMain.on("writeCSS", (event, args) => {
    let css = args.css;
    let cssFile = "";
    css.forEach((row) => {
        row.forEach((cell) => {
            cssFile += cell + " ";
        });
        cssFile = cssFile.slice(0, -1);
        cssFile += "\r\n";
    });
    cssFile = cssFile.slice(0, -2);
    cssFile += " ";
    console.log(cssFile + "EOF");
    fs.writeFileSync(path.join(__dirname, "cmc", "data", args.page), cssFile, "ascii");
});

////////
////////
////////
////////
////////
////////
////////
////////
////////
////////
////////
////////
////////
////////
////////

ipcMain.on("checkGameSourceInstalled", (event, args) => {
    win.webContents.send("fromCheckGameSourceInstalled", version != null);
});

ipcMain.on("getGameSource", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        if (getGameVersion(dir.filePaths[0] + "/") == null) {
            win.webContents.send("throwError", "No recognised .exe file in the selected directory. (88)");
            return;
        }
        //The new version has horrible permissions so give everything xwr
        getAllFiles(dir.filePaths[0]).forEach((file) => {
            fs.chmodSync(file, 0o777);
        });
        fs.emptyDirSync(__dirname + "/merged/");
        fs.emptyDirSync(__dirname + "/basegame/");
        
        fs.copySync(dir.filePaths[0], __dirname + "/basegame/", { overwrite: true });
        fs.copyFileSync(__dirname + "/basegame/controls.ini", __dirname + "/profiles/controls/default.ini");
        // fs.copyFileSync(__dirname + "/basegame/data/css.txt", __dirname + "/profiles/css/default.txt");
        version = getGameVersion(__dirname + "/basegame/");

        let builtinFighters = reRequire(__dirname + "/characters/default.json").versions[version].builtin;
        let builtinNumber = reRequire(__dirname + "/characters/default.json").versions[version].number;

        let cmcFightersTxt = fs.readFileSync(__dirname + "/basegame/data/fighters.txt", "utf-8").split(/\r?\n/);
        let cmcFighters = {};
        let installed = reRequire(__dirname + "/characters/installed.json");
        for (let fighter = 0; fighter in cmcFightersTxt; fighter++) {
            if (fighter != 0) {
                let fighterDat = fs.readFileSync(__dirname + "/basegame/data/dats/" + cmcFightersTxt[fighter] + ".dat", "utf-8")
                .split(/\r?\n/);
                let fighterData = {
                    // name: cmcFightersTxt[fighter],
                    displayName: fighterDat[1],
                    franchise: fighterDat[3],
                    number: fighter + builtinNumber
                    // Easier than working it out later
                };
                cmcFighters[cmcFightersTxt[fighter]] = fighterData;
                installed.number = fighter;
                // cmcFighters.push(fighterData);
            }
        }
        installed.number += builtinNumber;

        //FIXME:? assumes that all alts are not fighters - toon link
        //FIXME:? some alts are an alt of themselves (resolved differently)
        let altFightersTxt = fs.readFileSync(__dirname + "/basegame/data/alts.txt", "utf-8").split(/\r?\n/);
        let altFighters = {};
        let noAlts = parseInt(altFightersTxt[0]);
        altFightersTxt.shift();
        for (let fighter = 0; fighter < noAlts; fighter++) {
            let baseFighter = altFightersTxt[fighter * 5];
            let franchise = "";
            let altNumber = parseInt(altFightersTxt[(fighter * 5) + 1]);
            
            try {
                let fighterDat = fs.readFileSync(__dirname + "/basegame/data/dats/" + altFightersTxt[(fighter * 5) + 2] + ".dat", "utf-8")
                    .split(/\r?\n/);
                if (fighterDat[3] != "") {
                    altNumber = fighterDat[3];
                }
            } catch (error) {}

            if (builtinFighters[baseFighter] != undefined) {
                franchise = builtinFighters[baseFighter].franchise;
            } else if (cmcFighters[baseFighter] != undefined) {
                franchise = cmcFighters[baseFighter].franchise;
            }

            let fighterData = {
                // name: altFightersTxt[(fighter * 5) + 2],
                displayName: altFightersTxt[(fighter * 5) + 3],
                franchise: franchise,
                altNumber: parseInt(altFightersTxt[(fighter * 5) + 1]),
                baseFighter: baseFighter,
            }
            altFighters[altFightersTxt[(fighter * 5) + 2]] = fighterData;
            // altFighters.push(fighterData);
        }

        let versions = reRequire(__dirname + "/characters/default.json").versions;
        fs.writeFileSync(
            __dirname + "/characters/default.json",
            JSON.stringify({
                versions: versions,
                cmc: cmcFighters,
                alts: altFighters
            }, null, 4),
            "utf-8"
        );

        installed.number += installed.priority.length;
        let oldInstalled = reRequire(__dirname + "/characters/installed.json");
        let numberDifference = installed.number - oldInstalled.number;
        for (let character of installed.priority) {
            installed.characters[character].number += numberDifference;
        }

        fs.writeFileSync(
            __dirname + "/characters/installed.json",
            JSON.stringify(installed, null, 4),
            "utf-8"
        );

        win.webContents.send("fromGetGameSource", true);
    });
});

ipcMain.on("mergeInstalledMods", async (event, args) => {
    if (version == null) {
        win.webContents.send("throwError", "No recognised .exe file in the basegame directory. (193)");
        return;
    }

    if (!fs.existsSync(__dirname + "/tmp/")) {
        fs.mkdirSync(__dirname + "/tmp/");
        fs.mkdirSync(__dirname + "/tmp/data/");
        fs.mkdirSync(__dirname + "/tmp/stats/");
    }
    for (let file of PERSIST) {
        if (fs.existsSync(__dirname + "/merged/" + file)) {
            fs.copySync(__dirname + "/merged/" + file, __dirname + "/tmp/" + file, { overwrite: true });
        }
    }

    fs.emptyDirSync(__dirname + "/merged/");
    fs.copySync(__dirname + "/basegame/", __dirname + "/merged/", { overwrite: true });

    for (let file of PERSIST) {
        if (fs.existsSync(__dirname + "/tmp/" + file)) {
            fs.copySync(__dirname + "/tmp/" + file, __dirname + "/merged/" + file, { overwrite: true });
        }
    }

    //TODO: for each stage
    let installed = reRequire(__dirname + "/characters/installed.json");
    for (let character of installed.priority.toReversed()) {
        let files = [];
        fs.readdirSync(__dirname + "/characters/" + character).forEach((file) => {
            if (file.includes(".txt")) {
                files.push(file);
                fs.moveSync(__dirname + "/characters/" + character + "/" + file, __dirname + "/tmp/" + character + "/" + file, { overwrite: true });
            }
        });
        fs.copySync(__dirname + "/characters/" + character, __dirname + "/merged/", { overwrite: true });
        files.forEach((file) => {
            fs.moveSync(__dirname + "/tmp/" + character + "/" + file, __dirname + "/characters/" + character + "/" + file, { overwrite: true });
        });
    }
    fs.removeSync(__dirname + "/tmp/");
    let cmcFighters = reRequire(__dirname + "/characters/default.json").cmc;
    let installedFighters = reRequire(__dirname + "/characters/installed.json");
    let builtinNumber = reRequire(__dirname + "/characters/default.json").versions[version].number;
    let fightersTxt = "";
    fightersTxt += installedFighters.number - builtinNumber + "\r\n";
    for (let number = builtinNumber; number <= (installedFighters.number - installedFighters.priority.length); number++) {
        for (let fighter of Object.keys(cmcFighters)) {
            if (cmcFighters[fighter].number == number) {
                fightersTxt += fighter + "\r\n";
                break;
            }
        }
    }
    
    let installedList = Object.keys(installedFighters.characters).toSorted((a, b) => (installedFighters.characters[a].number > installedFighters.characters[b].number ? 1 : -1));
    // console.log(installedList);
    for (let fighter of installedList) {// not installedFighters.priority because css numbers are not related to priority
        fightersTxt += fighter + "\r\n";
    }
    fs.writeFileSync(
        __dirname + "/merged/data/fighters.txt",
        fightersTxt,
        "ascii"
    );

    let miscInstalled = reRequire(__dirname + "/misc/installed.json");
    miscInstalled.misc.forEach((mod) => {
        fs.copySync(__dirname + "/misc/" + mod, __dirname + "/merged/", { overwrite: true });
    });

    let date = new Date();
    let time = strftime("%I:%M %p %x", date);
    fs.writeFileSync(
        __dirname + "/program/info.json", JSON.stringify({
            time: date
        }, null, 4), "utf-8"
    );
    win.webContents.send("fromMergeInstalledMods", time);
});

ipcMain.on("removeMergedBloat", (event, args) => {
    getAllFiles(__dirname + "/merged/").forEach(file => {
        file = file.replace(__dirname + "/merged", "");
        splitFile = file.split('\\').pop().split('/').pop();
        for (let bloat of BLOAT) {
            let splitBloat = bloat.split('\\').pop().split('/').pop();
            let match = 0;
            for (let number = 0; number < splitBloat.length; number++) {
                if (splitFile[number] == undefined) break;
                if (splitFile[number].includes(splitBloat[number])) {
                    match++;
                }
            }
            if (match == splitBloat.length) {
                fs.rmSync(__dirname + "/merged/" + file);
            }
        }
    });
});

ipcMain.on("getLastMerge", async (event, args) => {
    let date = new Date(reRequire(__dirname + "/program/info.json").time);//require wasn't updating
    let time = strftime("%I:%M %p %x", date);
    win.webContents.send("fromGetLastMerge", time);
});

ipcMain.on("runCMC", async (event, args) => {
    dir = args.path;
    //Additionally the exe doesn't have execute perms on linux
    //sudo chmod a+x ./* -R
    childProcess.execFile(__dirname + dir + "/" + version, {
        cwd: __dirname + dir,
        windowsHide: true
    });
    //TODO: Catch fails e.g. merged empty
    // app.quit();
});

ipcMain.on("saveControls", (event, args) => {
    fs.copyFileSync(__dirname + "/merged/controls.ini", __dirname + "/profiles/controls/" + args.name + ".ini");
    updateControlProfiles();
    win.webContents.send("fromSaveControls");
});

ipcMain.on("loadControls", (event, args) => {
    fs.copyFileSync(__dirname + "/profiles/controls/" + args.name + ".ini", __dirname + "/merged/controls.ini");
    win.webContents.send("fromLoadControls");
});

ipcMain.on("updateControlProfiles", (event, args) => {
    updateControlProfiles();
});

function updateControlProfiles () {
    win.webContents.send("fromUpdateControlProfiles", fs.readdirSync(__dirname + "/profiles/controls/"));
}

ipcMain.on("saveCSS", (event, args) => {
    fs.copyFileSync(__dirname + "/merged/data/css.txt", __dirname + "/profiles/css/" + args.name + ".txt");
    updateCSSProfiles();
    win.webContents.send("fromSaveCSS");
});

ipcMain.on("loadCSS", (event, args) => {
    fs.copyFileSync(__dirname + "/profiles/css/" + args.name + ".txt", __dirname + "/merged/data/css.txt");
    win.webContents.send("fromLoadCSS");
});

ipcMain.on("updateCSSProfiles", (event, args) => {
    updateCSSProfiles();
});

function updateCSSProfiles () {
    win.webContents.send("fromUpdateCSSProfiles", fs.readdirSync(__dirname + "/profiles/css/"));
}

ipcMain.on("openFolder", (event, args) => {
    shell.openPath(path.join(__dirname + args));
});

ipcMain.on("openCharacterFolder", (event, args) => {
    shell.openPath(path.join(__dirname + "/characters/" + args));
});

ipcMain.on("installCharacter", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        // let modName = dir.filePaths[0].split('\\').pop().split('/').pop();
        installCharacter(dir.filePaths[0], args);
    });
});

ipcMain.on("installCharacterZip", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openFile"]
    }).then(async (file) => {
        if (file.canceled === true) {
            return;
        }
        let dir = __dirname + "/characters/_temp";
        let modName = "";
        let fileP = file.filePaths[0];
        let fileName = fileP.split('\\').pop().split('/').pop().split(".");
        fileName.pop();
        modName = fileName[0];
        dir = dir + "/" + modName;
        switch (fileP.split(".").pop().toLowerCase()) {
            case "zip":
                await extract(fileP, {
                    dir: dir,
                    defaultDirMode: 0o777,
                    defaultFileMode: 0o777,
                });
                break;
            case "rar"://TODO: Error handling
                let buf = Uint8Array.from(fs.readFileSync(fileP)).buffer;
                let extractor = await unrar.createExtractorFromData({ data: buf });
                const extracted = extractor.extract();
                const files = [...extracted.files];
                files.forEach(fileE => {// Make All Folders First
                    if (fileE.fileHeader.flags.directory) {
                        fs.ensureDirSync(dir + "/" + fileE.fileHeader.name);
                    }
                });
                files.forEach(fileE => {// Make All Folders First
                    if (!fileE.fileHeader.flags.directory) {
                        fs.writeFileSync(dir + "/" + fileE.fileHeader.name, Buffer.from(fileE.extraction));
                    }
                });
                break;
            case "7z":
            default:
                return;
                break;
        }
        await installCharacter(dir, args);
        fs.removeSync(__dirname + "/characters/_temp");
    });
});

// function installCharacter(dir, convertFormat) {
//     if (!fs.existsSync(dir + "/fighter/")) {
//         dir += "/" + dir.split('\\').pop().split('/').pop();
//     }
//     if (!fs.existsSync(dir + "/fighter/")) {
//         win.webContents.send("throwError", "Can't find the target character's ./fighter/ directory. (439)");
//         return;
//     }
//     let characterName = fs.readdirSync(dir + "/fighter/")[0].split(".")[0];

//     fs.copySync(dir, __dirname + "/characters/" + characterName, { overwrite: true });
//     //FIXME: if it overwrites a directory it will cause issue later

//     let characterDat = [];
//     //TODO: errors on no dat
//     if (!fs.existsSync(__dirname + "/characters/" + characterName + "/data/dats/")) {
//         fs.moveSync(__dirname + "/characters/" + characterName + "/data/" + characterName + ".dat", __dirname + "/data/dats/" + characterName + ".dat", { overwrite: true });
//     }
//     characterDat = fs.readFileSync(__dirname + "/characters/" + characterName + "/data/dats/" + characterName + ".dat", "utf-8").split(/\r?\n/);
    
//     let installed = reRequire(__dirname + "/characters/installed.json");
//     installed.number += 1;
//     let characterData = {
//         "displayName": characterDat[1],
//         "franchise": characterDat[3],
//         "number": installed.number
//     };
//     installed.characters[characterName] = characterData;
//     installed.priority.push(characterName);
//     fs.writeFileSync(
//         __dirname + "/characters/installed.json",
//         JSON.stringify(installed, null, 4),
//         "utf-8"
//     );

//     if (convertFormat && !characterDat[4].includes("---Classic Home Stages Below---")) {
//         characterDat.splice(4, 1, "---Classic Home Stages Below---", "1", "battlefield", "---Random Datas---", "0", "---Palettes Number---");
//         characterDat.splice(11, 0, "---From Here is Individual Palettes data---");
//         let characterDatTxt = "";
//         characterDat.forEach((line) => {
//             characterDatTxt += line + "\r\n";
//         });
//         fs.writeFileSync(
//             __dirname + "/characters/" + characterName + "/data/dats/" + characterName + ".dat",
//             characterDatTxt,
//             "ascii"
//         );
//     }

//     win.webContents.send("fromInstallCharacter", installed);
// }

ipcMain.on("getInstalledCharList", (event, args) => {
    let installed = reRequire(__dirname + "/characters/installed.json");
    win.webContents.send("fromGetInstalledCharList", {
        installed: installed,
        basegame: Object.keys(reRequire(__dirname + "/characters/default.json").cmc),
        version: version,
    });
});

// ipcMain.on("extractCharacter", (event, args) => {
//     let basegame = reRequire(__dirname + "/characters/default.json");
//     let files = [];
//     CHARACTER_FILES.forEach((file) => {
//         let fixedFiles = [];
//         fixedFiles.push(file.replace("<fighter>", args.character).replace("<series>", basegame.cmc[args.character].franchise));
//         if (fixedFiles[0].includes("<audio>")) {
//             ["ogg", "wav", "mp3"].forEach((format) => {
//                 fixedFiles.push(fixedFiles[0].replace("<audio>", format));
//             });
//             fixedFiles.shift();
//         }

//         fixedFiles.forEach((fixed) => {
//             files.push(fixed);
//         });
//     });

//     files.forEach((file) => {
//         let dir = file.replace(file.split('\\').pop().split('/').pop(), "");
//         fs.ensureDirSync(__dirname + "/extracted/" + args.character + "/" + dir);
//         if (file.includes("*")) {
//             let start = file.split("*")[0].replace(dir, "");
//             let end = file.split("*")[1];
//             if (fs.existsSync(__dirname + "/basegame/" + dir)) {
//                 let contents = fs.readdirSync(__dirname + "/basegame/" + dir).filter((i) => {
//                     return i.replace(start, "").replace(end, "") === parseInt(i.replace(start, "").replace(end, "")).toString();
//                 });
//                 contents.forEach((found) => {
//                     console.log(found);
//                     if (args.deleteExtraction) {
//                         fs.moveSync(__dirname + "/basegame/" + dir + found, __dirname + "/extracted/" + args.character + "/" + dir + found, {overwrite : true});
//                     } else {
//                         fs.copySync(__dirname + "/basegame/" + dir + found, __dirname + "/extracted/" + args.character + "/" + dir + found, {overwrite : true});
//                     }
//                 });
//             }
//         } else {
//             if (fs.existsSync(__dirname + "/basegame/" + file)) {
//                 if (args.deleteExtraction) {
//                     fs.moveSync(__dirname + "/basegame/" + file, __dirname + "/extracted/" + args.character + "/" + file, {overwrite : true});
//                 } else {
//                     fs.copySync(__dirname + "/basegame/" + file, __dirname + "/extracted/" + args.character + "/" + file, {overwrite : true});
//                 }
//             }
//         }
//     });
//     console.log(files);
//     if (args.deleteExtraction) {
//         let removeNumber = basegame.cmc[args.character].number;
//         delete basegame.cmc[args.character];
//         Object.keys(basegame.cmc).forEach((character) => {
//             if (basegame.cmc[character].number > removeNumber) {
//             basegame.cmc[character].number -= 1;
//             }
//         });
//         fs.writeFileSync(
//             __dirname + "/characters/default.json",
//             JSON.stringify(basegame, null, 4),
//             "utf-8"
//         );
//         let installed = reRequire(__dirname + "/characters/installed.json");
//         installed.number -= 1;
//         installed.priority.forEach((character) => {
//             if (installed.characters[character].number > removeNumber) {
//                 installed.characters[character].number -= 1;
//             }
//         });
//         fs.writeFileSync(
//             __dirname + "/characters/installed.json",
//             JSON.stringify(installed, null, 4),
//             "utf-8"
//         );
//     }
//     win.webContents.send("fromExtractCharacter");
// });

// ipcMain.on("removeCharacter", (event, args) => {
//     let installed = reRequire(__dirname + "/characters/installed.json");
//     let removeNumber = installed.characters[args].number;
//     delete installed.characters[args];
//     installed.priority = installed.priority.filter((character) => {
//         return character !== args;
//     });
//     installed.priority.forEach((character) => {
//         if (installed.characters[character].number > removeNumber) {
//             installed.characters[character].number -= 1;
//         }
//     });
//     fs.removeSync(__dirname + "/characters/" + args);
//     fs.writeFileSync(
//         __dirname + "/characters/installed.json",
//         JSON.stringify(installed, null, 4),
//         "utf-8"
//     );

//     // NOTE: Bad practice, as although it is unlikely a remove character is wanted in the css, changes are not saved when a character is removed
//     // let cssFile;
//     // try {
//     //     // cssFile = fs.readFileSync(__dirname + "/merged/data/css.txt", "utf-8").split(/\r?\n/);
//     //     cssFile = fs.readFileSync(__dirname + "/merged/data/css.txt", "ascii");
//     // } catch (error) {
//     //     win.webContents.send("fromRemoveCharacter", installed);
//     // }
//     // if (cssFile == undefined) win.webContents.send("fromRemoveCharacter", installed);

//     // cssFile.replace(new RegExp(('0000' + removeNumber).slice(-4), 'g'), "0000");

//     win.webContents.send("fromRemoveCharacter", installed);
// });

ipcMain.on("increaseMergePriority", (event, args) => {
    let installed = reRequire(__dirname + "/characters/installed.json");
    let index = installed.priority.indexOf(args);
    if (index == 0) {
        return;
    }
    installed.priority.move(index, index - 1);
    //TODO: error handling eg outside of range
    fs.writeFileSync(
        __dirname + "/characters/installed.json",
        JSON.stringify(installed, null, 4),
        "utf-8"
    );
    win.webContents.send("fromIncreaseMergePriority", installed);
});

ipcMain.on("openModFolder", (event, args) => {
    shell.openPath(__dirname + "/misc/" + args);
});

ipcMain.on("installMod", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        let modName = dir.filePaths[0].split('\\').pop().split('/').pop();
        installMod(dir.filePaths[0], modName);
    });
});

ipcMain.on("installModZip", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openFile"]
    }).then(async (file) => {
        if (file.canceled === true) {
            return;
        }
        let dir = __dirname + "/misc/_temp";
        let fileP = file.filePaths[0];
        let fileName = fileP.split('\\').pop().split('/').pop().split(".");
        fileName.pop();
        modName = fileName[0];
        dir = dir + "/" + modName;
        switch (fileP.split(".").pop().toLowerCase()) {
            case "zip":
                await extract(fileP, {
                    dir: dir,
                    defaultDirMode: 0o777,
                    defaultFileMode: 0o777,
                });
                break;
            case "rar"://TODO: Error handling
                let buf = Uint8Array.from(fs.readFileSync(fileP)).buffer;
                let extractor = await unrar.createExtractorFromData({ data: buf });
                const extracted = extractor.extract();
                const files = [...extracted.files];
                files.forEach(fileE => {// Make All Folders First
                    if (fileE.fileHeader.flags.directory) {
                        fs.ensureDirSync(dir + "/" + fileE.fileHeader.name);
                    }
                });
                files.forEach(fileE => {// Make All Folders First
                    if (!fileE.fileHeader.flags.directory) {
                        fs.writeFileSync(dir + "/" + fileE.fileHeader.name, Buffer.from(fileE.extraction));
                    }
                });
                break;
            case "7z":
            default:
                return;
                break;
        }
        await installMod(dir, modName);
        fs.removeSync(__dirname + "/misc/_temp");
    });
});

function installMod(dir, modName) {
    if (fs.existsSync(dir + "/" + dir.split('\\').pop().split('/').pop())) {
        dir += "/" + dir.split('\\').pop().split('/').pop();
    }
    fs.copySync(dir, __dirname + "/misc/" + modName, { overwrite: true });
    
    let installed = reRequire(__dirname + "/misc/installed.json");
    installed.misc.push(modName);
    fs.writeFileSync(
        __dirname + "/misc/installed.json",
        JSON.stringify(installed, null, 4),
        "utf-8"
    );

    win.webContents.send("fromInstallMod", installed);
}

ipcMain.on("getInstalledModList", (event, args) => {
    let installed = reRequire(__dirname + "/misc/installed.json");
    win.webContents.send("fromGetInstalledModList", installed);
});

ipcMain.on("removeMod", (event, args) => {
    let installed = reRequire(__dirname + "/misc/installed.json");
    installed.misc = installed.misc.filter(mod => mod != args);
    fs.removeSync(__dirname + "/misc/" + args);
    fs.writeFileSync(
        __dirname + "/misc/installed.json",
        JSON.stringify(installed, null, 4),
        "utf-8"
    );
    win.webContents.send("fromRemoveMod", installed);
});

ipcMain.on("increaseModMergePriority", (event, args) => {
    let installed = reRequire(__dirname + "/misc/installed.json");
    let index = installed.misc.indexOf(args);
    if (index == 0) {
        return;
    }
    installed.misc.move(index, index - 1);
    //TODO: error handling eg outside of range
    fs.writeFileSync(
        __dirname + "/misc/installed.json",
        JSON.stringify(installed, null, 4),
        "utf-8"
    );
    win.webContents.send("fromIncreaseModMergePriority", installed);
});

// ipcMain.on("getCSS", (event, args) => {
//     let cssFiles = [];
//     if (version == "CMC+ v8.exe") {
//         cssFiles = getAllFiles(__dirname + "/merged/data/css/");
//     }
//     cssFiles.push(__dirname + "/merged/data/css.txt");
//     var css = {};
//     cssFiles.forEach((file) => {
//         let cssFile;
//         try {
//             // cssFile = fs.readFileSync(__dirname + "/merged/data/css.txt", "utf-8").split(/\r?\n/);
//             cssFile = fs.readFileSync(file, "ascii").split(/\r?\n/);
//         } catch (error) {
//             if (error.code == "ENOENT") {
//                 win.webContents.send("errorGetCSS");
//             }
//         }
//         if (cssFile != undefined) {
//             let cssName = "";
//             if (file == __dirname + "/merged/data/css.txt") {
//                 cssName = "css.txt";
//             } else {
//                 cssName = "css/" + file.split('\\').pop().split('/').pop();
//             }
//             css[cssName] = [];
//             for (let line = 0; line < cssFile.length; line++) {
//                 css[cssName].push(cssFile[line].split(" "));
//             }
//         }
//     });
//     let basegame = reRequire(__dirname + "/characters/default.json");
//     let installed = reRequire(__dirname + "/characters/installed.json");
//     win.webContents.send("fromGetCSS", {
//         css: css,
//         version: version,
//         basegame: basegame,
//         installed: installed
//     });
// });

// ipcMain.on("writeCSS", (event, css) => {
//     Object.keys(css).forEach((file) => {
//         let maxY = css[file].length;
//         let maxX = css[file][0].length;
//         let output = "";

//         for (let y = 0; y < maxY; y++) {
//             for (let x = 0; x < maxX; x++) {
//                 if (version == "CMC+ v8.exe" && y == maxY - 1) {
//                     output += css[file][y][x] + " ";
//                 } else {
//                     output += css[file][y][x] + (x == maxX - 1 ? "\r\n" : " ");
//                 }
//             }
//         }
//         // if (version == "CMC+ v8.exe") {
//         //     output += " ";
//         // }

//         fs.writeFileSync(
//             __dirname + "/merged/data/" + file,
//             output,
//             "ascii"
//         );
//     });
// });