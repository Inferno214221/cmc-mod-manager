const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require("path");
const https = require("https");
const request = require("request");
const fs = require("fs-extra");
const childProcess = require("child_process");
require('array.prototype.move');
const extract = require('extract-zip');
const unrar = require("node-unrar-js");
var win;

const SUPPORTED_VERSIONS = [
    "CMC_v8",
    "CMC+ v8",
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

const STAGE_FILES = [
    "stage/<stage>.bin",
    "stage/<stage>",
    "music/stage/<stage>",
    "gfx/stgicons/<stage>.png",
    "gfx/stgprevs/<stage>.png",
];

var cmcDir = readJSON(path.join(__dirname, "program", "data.json")).dir;
var sourceDir;
var version = getGameVersion(cmcDir);
var foundUri = process.argv.find((arg) => arg.startsWith("cmcmm://"));
handleUri();

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
    checkUpdates();
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
} else {
    app.on("second-instance", (e, argv) => {
        foundUri = argv.find((arg) => arg.startsWith("cmcmm://"));
    });
    if (win) {
        if (win.isMinimized()) {
            win.restore();
        }
        window.focus();
    }
}

function checkUpdates() {
    https.get("https://api.github.com/repos/Inferno214221/cmc-mod-manager/releases/latest", {
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CMC-Mod-Manager",
        }
    }, (res) => {
        res.setEncoding("utf8");
        let result = "";
        res.on("data", (data) => {
            result += data;
        });
        res.on("end", () => {
            result = JSON.parse(result);
            let latest = result.tag_name.replace("v", "").split(".");
            let current = app.getVersion().split(".");
            // if (result.tag_name != "v" + app.getVersion()) {
            console.log(latest, current);
            if (
                result != undefined && (
                    (
                        parseInt(latest[0]) > parseInt(current[0])
                    ) ||
                    (
                        parseInt(latest[0]) == parseInt(current[0]) &&
                        parseInt(latest[1]) > parseInt(current[1])
                    ) ||
                    (
                        parseInt(latest[0]) == parseInt(current[0]) &&
                        parseInt(latest[1]) == parseInt(current[1]) &&
                        parseInt(latest[2]) > parseInt(current[2])
                    )
                )
            ) {
                dialog.showMessageBox({
                    message: "Update required: This update will be installed automatically, \
please do not close the program. When finished, the program will close and need to be \
launched again manually.",
                });
                console.log("Update required.");
                downloadUpdate(result.tag_name);
                // downloadUpdate("auto"); //FOR TESTS
            } else {
                console.log("No update required.");
            }
        });
    }).on("error", function(error) {
        console.log(error);
        return;
    });
}

function downloadUpdate(tag) {
    console.log("Downloading update.");
    let request = require("request");
    let platform = readJSON(path.join(__dirname, "program", "data.json")).platform;
    let filePath = path.join(__dirname, "update.zip");
    request("https://github.com/Inferno214221/cmc-mod-manager/releases/download/"
    + tag + "/cmc-mod-manager-" + platform + ".zip")
    .pipe(fs.createWriteStream(filePath))
    .on("close", function () {
        console.log("Downloaded sucessfully.");
        fs.ensureDirSync(path.join(__dirname, "update"));
        fs.emptyDirSync(path.join(__dirname, "update"));
        extract(filePath, {
            dir: path.join(__dirname, "update"),
        }).then(() => {
            console.log("Extracted.");
            installUpdate(platform);
        });
    });
}

function installUpdate(platform) {
    console.log("Installing update, please don't close the program.");
    if (platform == "linux-x64") {
        fs.copySync(path.join(__dirname, "update", "cmc-mod-manager-linux-x64", "resources", "app"), path.join(__dirname), {overwrite: true});
        //), path.join(__dirname, "..", "..")
    } else {
        fs.copySync(path.join(__dirname, "update", "resources", "app"), path.join(__dirname), {overwrite: true});
    }
    fs.removeSync(path.join(__dirname, "update.zip"));
    fs.removeSync(path.join(__dirname, "update"));
    console.log("Update installed.");
    app.quit();
}

function readJSON(file) {
    return JSON.parse(fs.readFileSync(file));
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
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

ipcMain.on("throwGameDir", (event, dir) => {
    if (cmcDir == undefined || cmcDir == "" || version == null) {
        win.webContents.send("from_throwGameDir");
    }
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

function getAllIndexesWhere(arr, check) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++) {
        if (check(arr[i])) {
            indexes.push(i);
        }
    }
    return indexes;
}

function handleUri() {
    if (foundUri == undefined) return;
    console.log(foundUri);
    foundUrl = foundUri.replace("cmcmm://", "");
    fs.ensureDirSync(__dirname, "_temp");
    request.get({
        url: foundUrl,
    }).on("error", function(error) {
        console.log(error);
        return; //TODO: Alerts
    }).on("response", function(res) {
        console.log(res);
        let file = "download." + res.headers['content-type'].split('/')[1];
        downloadUrl = res.request.uri.href;
        https.get(downloadUrl, (res1) => {
            let filePath = path.join(__dirname, "_temp", file);
            fs.ensureFileSync(filePath);
            let writeStream = fs.createWriteStream(filePath);
            win.webContents.send("from_oneClickStart");

            res1.pipe(writeStream);
          
            writeStream.on("finish", () => {
                writeStream.close();
                win.webContents.send("from_oneClickFinish");
                installCharacterArch(filePath, true).then(() => {
                    fs.removeSync(path.join(__dirname, "_temp"));
                });
            });
        });
    });
}

// Index
ipcMain.on("checkGameDir", (event, args) => {
    let dir = cmcDir;
    if (cmcDir == undefined || cmcDir == "" || version == null) {
        dir = "None Selected";
    }
    // else {
    //     let missing = true;
    //     SUPPORTED_VERSIONS.forEach((game) => {
    //         if (fs.existsSync(path.join(cmcDir, game + ".exe"))) {
    //             missing = false;
    //         }
    //     });
    //     if (missing) {
    //         dir = "None Selected";
    //     }
    // }
    win.webContents.send("from_checkGameDir", dir);
});

ipcMain.on("selectGameDir", (event, args) => {
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
        cmcDir = path.join(dir.filePaths[0]);
        // fs.ensureDirSync(path.join(__dirname, "cmc"));
        // fs.emptyDirSync(path.join(__dirname, "cmc"));
        
        // fs.copySync(dir.filePaths[0], path.join(__dirname, "cmc"), { overwrite: true });
        version = getGameVersion(cmcDir);
        let data = readJSON(path.join(__dirname, "program", "data.json"));
        data.dir = cmcDir;
        writeJSON(path.join(__dirname, "program", "data.json"), data);

        win.webContents.send("from_selectGameDir", cmcDir);
    });
});

ipcMain.on("openGameDir", (event, args) => {
    shell.openPath(cmcDir);
});

ipcMain.on("runGame", (event, args) => {
    childProcess.execFile(path.join(cmcDir, version + ".exe"), {
        cwd: cmcDir,
        windowsHide: true
    });
});

ipcMain.on("setupOneClick", (event, dir) => {
    win.webContents.send("from_setupOneClick", app.setAsDefaultProtocolClient("cmcmm"));
});

// Characters
ipcMain.on("getCharacterList", (event, args) => {
    altsToFighters();
    win.webContents.send("from_getCharacterList", {
        characters: getCharacters(),
        cmcDir: cmcDir,
        random: getRandomCharacters(),
        alts: getAlts(),
    });
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
        await installCharacterArch(file.filePaths[0]);
        // fs.removeSync(path.join(__dirname, "_temp"));
    });
});

async function installCharacterArch(filePath, args) {
    let modName = path.parse(filePath).name;
    let dir = path.join(__dirname, "_temp", modName);
    fs.ensureDirSync(dir);
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
                    fs.writeFileSync(path.join(dir, fileE.fileHeader.name), Buffer.from(fileE.extraction));
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
}

function installCharacter(dir, filteredInstall) {
    while (!fs.existsSync(path.join(dir, "fighter"))) {
        console.log("Fighters directory not found in " + dir);
        let contents = fs.readdirSync(dir);
        if (contents.length = 1) {
            dir = path.join(dir, contents[0]);
            console.log(dir);
        } else {
            win.webContents.send("throwError", "Fighters directory not found in " + dir);
            return;
        }
    }
    // if (!fs.existsSync(path.join(dir, "fighter"))) {
    //     console.log("Fighters directory not found in " + dir);
    //     // dir = path.join(dir, path.parse(dir).base);
    //     let contents = fs.readdirSync(dir);
    //     if (contents.length = 1) {
    //         dir = path.join(dir, contents[0]);
    //         console.log(dir);
    //     }
    // }
    console.log(fs.readdirSync(dir));
    let characterName = fs.readdirSync(path.join(dir, "fighter")).filter((file) => { return file.endsWith(".bin") || !file.includes(".") })[0].split(".")[0];
    if (!fs.existsSync(path.join(dir, "data", "dats", characterName + ".dat"))) {
        console.log(path.join(dir, "data", "dats", characterName + ".dat"))
        win.webContents.send("throwError", "The character's dat file is not in the ./data/dats/ directory.");
        return;
    }
    // for (let character of getCharacters()) {
    //     if (character.name == characterName) {
    //         win.webContents.send("throwError", "The selected character is already installed.");
    //         return;
    //     }
    // }
    let characterDat = fs.readFileSync(path.join(dir, "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);

    let datMod = !characterDat[4].startsWith("-");
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
                        fs.copySync(path.join(dir, subDir, found), path.join(cmcDir, subDir, found), {overwrite: true});
                    });
                }
            } else {
                if (fs.existsSync(path.join(dir, file))) {
                    console.log("Copying: " + path.join(dir, file));
                    fs.copySync(path.join(dir, file), path.join(cmcDir, file), {overwrite: !file.startsWith("gfx/seriesicon/")});
                }
            }
        });
    } else {
        fs.copySync(dir, path.join(cmcDir), {overwrite: true});
    }

    if (datMod) {
        fs.writeFileSync(
            path.join(cmcDir, "data", "dats", characterName + ".dat"),
            characterDatTxt,
            "ascii"
        );
    }

    if (getCharacters().filter((character) => character.name == characterName).length == 0) {
        appendCharacter(characterName);
        console.log("Character installed.");
        win.webContents.send("from_installCharacter", false);
    } else {
        console.log("Character updated.");
        win.webContents.send("from_installCharacter", true);
    }
}

function deleteCharCSS(cssNumber) {
    let pages = [];
    pages.push("css.txt");
    getAllFiles(path.join(cmcDir, "data", "css")).forEach((file) => {
        pages.push(path.join("css", path.parse(file).base));
    });
    pages.forEach((page) => {
        let css = getCSS(page);
        for (let y in css) {
            for (let x in css[y]) {
                if (css[y][x] != "9999") {
                    if (css[y][x] == ('0000' + cssNumber).slice(-4)) {
                        css[y][x] = "0000";
                    } else if (css[y][x] >= ('0000' + cssNumber).slice(-4)) {
                        css[y][x] = ('0000' + (parseInt(css[y][x]) - 1)).slice(-4);
                    }
                }
            };
        };
        writeCSS(css, page);
    });
}

ipcMain.on("removeCharacter", (event, args) => {
    args -= 1;
    removeCharacter(args);

    win.webContents.send("from_removeCharacter");
});

function removeCharacter(number) {
    deleteCharCSS(parseInt(number) + 1);
    let characters = getCharacters();
    let characterName = characters[number].name;
    let similarName = [];
    characters.forEach((character) => {
        if (character.name != characterName && character.name.startsWith(characterName)) {
            similarName.push(character.name);
        }
    });
    let characterDat = fs.readFileSync(path.join(cmcDir, "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);
    filterCharacterFiles(characters[number].name, characterDat, true).forEach((file) => {
        let subDir = path.parse(file).dir;
        if (file.includes("*")) {
            let start = path.parse(file).base.split("*")[0].replace(subDir, "");
            let end = path.parse(file).base.split("*")[1];
            if (fs.existsSync(path.join(cmcDir, subDir))) {
                let contents = fs.readdirSync(path.join(cmcDir, subDir)).filter((i) => {
                    similarName.forEach((name) => {
                        if (i.startsWith(name)) {
                            console.log(i + " was ignored because it belongs to " + name);
                            return false;
                        }
                    });
                    return i.startsWith(start) && i.endsWith(end);
                });
                contents.forEach((found) => {
                    console.log("Removing: " + path.join(cmcDir, subDir, found));
                    fs.removeSync(path.join(cmcDir, subDir, found));
                });
            }
        } else {
            if (fs.existsSync(path.join(cmcDir, file))) {
                console.log("Removing: " + path.join(cmcDir, file));
                fs.removeSync(path.join(cmcDir, file));
            }
        }
    });
    dropCharacter(characterName);
}

ipcMain.on("extractCharacter", (event, args) => {
    args -= 1;
    extractCharacter(args);
    win.webContents.send("from_extractCharacter");
});

function extractCharacter(characterNumber, dir = cmcDir) {
    let characters = getCharacters(dir);
    let characterName = characters[characterNumber].name;
    let similarName = [];
    characters.forEach((character) => {
        if (character.name != characterName && character.name.startsWith(characterName)) {
            similarName.push(character.name);
        }
    });
    let characterDat = fs.readFileSync(path.join(dir, "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);
    filterCharacterFiles(characters[characterNumber].name, characterDat).forEach((file) => {
        let subDir = path.parse(file).dir;
        fs.ensureDirSync(path.join(__dirname, "extracted", characterName, subDir));
        if (file.includes("*")) {
            let start = path.parse(file).base.split("*")[0].replace(subDir, "");
            let end = path.parse(file).base.split("*")[1];
            if (fs.existsSync(path.join(dir, subDir))) {
                let contents = fs.readdirSync(path.join(dir, subDir)).filter((i) => {
                    similarName.forEach((name) => {
                        if (i.startsWith(name)) {
                            console.log(i + " was ignored because it belongs to " + name);
                            return false;
                        }
                    });
                    return i.startsWith(start) && i.endsWith(end);
                });
                contents.forEach((found) => {
                    console.log("Extracting: " + path.join(dir, subDir, found));
                    fs.copySync(path.join(dir, subDir, found), path.join(__dirname, "extracted", characterName, subDir, found), {overwrite: true});
                });
            }
        } else {
            if (fs.existsSync(path.join(dir, file))) {
                console.log("Extracting: " + path.join(dir, file));
                fs.copySync(path.join(dir, file), path.join(__dirname, "extracted", characterName, file), {overwrite: true});
            }
        }
    });
    return path.join(__dirname, "extracted", characterName);
}

function filterCharacterFiles(characterName, characterDat = null, ignoreSeries = false) {
    let palettes;
    if (characterDat == null) {
        palettes = 30;
    } else {
        let filtered = getAllIndexesWhere(characterDat, (line) => {
            return line.startsWith("-");
        });
        if (filtered[2] != undefined) {
            palettes = parseInt(characterDat[parseInt(filtered[2]) + 1]) - 1;
        }
    }
    console.log(palettes);

    let files = [];
    CHARACTER_FILES.forEach((file) => {
        let fixedFiles = [];
        let replaced = file.replace("<fighter>", characterName);
        if(!ignoreSeries) {
            replaced = replaced.replace("<series>", characterDat[3]);
        }
        fixedFiles.push(replaced);
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

ipcMain.on("toggleRandomCharacter", (event, data) => {
    toggleRandomCharacter(data.excluded, data.characterName);
});

function toggleRandomCharacter(excluded, characterName) {
    let characters = getRandomCharacters();
    if (excluded && characters.indexOf(characterName) != -1) {// Remove from file
        console.log("Removing " + characterName + " from fighter_lock.");
        characters = characters.filter((character) => {
            return character != characterName;
        });
    } else if (!excluded && characters.indexOf(characterName) == -1) {// Add to file
        console.log("Adding " + characterName + " to fighter_lock.");
        characters.push(characterName);
    } else return;
    let output = (characters.length + 1) + "\r\n";
    characters.forEach((character) => {
        output += character + "\r\n";
    });
    fs.writeFileSync(path.join(cmcDir, "data", "fighter_lock.txt"), output, "ascii");
}

function getRandomCharacters() {
    let fighters = fs.readFileSync(path.join(cmcDir, "data", "fighter_lock.txt"), "ascii").split(/\r?\n/);
    fighters.shift();
    fighters.pop();
    return fighters;
}

ipcMain.on("removeAllChars", (event, args) => {
    number = 0;
    getCharacters().forEach((fighter) => {
        if (fighter.name == "hand" || fighter.name == "sprite") {
            number++;
            return;
        }
        removeCharacter(number);
    });
    fs.writeFileSync(path.join(cmcDir, "data", "fighters.txt"), "2\r\nhand\r\nsprite", "ascii");
    fs.writeFileSync(path.join(cmcDir, "data", "fighter_lock.txt"), "0", "ascii");
    win.webContents.send("from_removeAllChars");
});

function getCharacters(dir = cmcDir) {
    let fighters = [];
    let fightersTxt = fs.readFileSync(path.join(dir, "data", "fighters.txt"), "ascii").split(/\r?\n/);
    fightersTxt.shift();
    fightersTxt.forEach((fighter) => {
        if (fs.existsSync(path.join(dir, "data", "dats", fighter + ".dat"))) {
            let fighterDat = fs.readFileSync(path.join(dir, "data", "dats", fighter + ".dat"), "ascii").split(/\r?\n/);
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
    fs.writeFileSync(path.join(cmcDir, "data", "fighters.txt"), output, "ascii");
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
    fs.writeFileSync(path.join(cmcDir, "data", "fighters.txt"), output, "ascii");
    toggleRandomCharacter(true, drop);
    removeAlts(drop);
}

function getAlts(otherDir = null) {
    let dir = otherDir || cmcDir;
    let alts = [];
    let altsTxt = fs.readFileSync(path.join(dir, "data", "alts.txt"), "ascii").split(/\r?\n/);
    alts.shift();
    for(let alt = 0; alt < (altsTxt.length / 5); alt++) {
        alts[alt] = {
            base: altsTxt[alt*5 + 1],
            altNum: altsTxt[alt*5 + 2],
            alt: altsTxt[alt*5 + 3],
            displayName: altsTxt[alt*5 + 4],
            gameName: altsTxt[alt*5 + 5],
        };
    }
    alts.pop();
    return alts;
}

function writeAlts(alts) {
    let output = (alts.length) + "\r\n";
    let altCount = {};
    alts.forEach((alt) => {
        output += alt.base + "\r\n";
        if (altCount[alt.base] == undefined) {
            altCount[alt.base] = 2;
        } else {
            altCount[alt.base] += 1;
        }
        output += altCount[alt.base] + "\r\n";
        output += alt.alt + "\r\n";
        output += alt.displayName + "\r\n";
        output += alt.gameName + "\r\n";
    });
    fs.writeFileSync(path.join(cmcDir, "data", "alts.txt"), output, "ascii");
}

function altsToFighters() {
    let alts = getAlts();
    let fighters = getCharacters();
    alts.forEach((alt) => {
        if (fighters.findIndex(fighter => fighter.name == alt.alt) == -1) {
            appendCharacter(alt.alt);
        }
    });
}

ipcMain.on("addAlt", (event, args) => {
    addAlt(args.base, args.alt);
    win.webContents.send("from_addAlt");
});

function addAlt(base, alt) {
    console.log("Adding alt: " + base + " : " + alt);
    let alts = getAlts();
    let altDat = fs.readFileSync(path.join(cmcDir, "data", "dats", alt + ".dat"), "ascii").split(/\r?\n/);
    let altNum = 2;
    alts.forEach((i) => {
        if (i.base == base) {
            altNum++;
        }
    });
    alts.push({
        base: base,
        altNum: altNum,
        alt: alt,
        displayName: altDat[1],
        gameName: altDat[2],
    });
    writeAlts(alts);
}

ipcMain.on("removeAlt", (event, args) => {
    removeAlt(args.base, args.alt);
    win.webContents.send("from_removeAlt");
});

function removeAlt(base, alt) {
    console.log("Removing alt: " + base + " : " + alt);
    let alts = getAlts();
    let removed = [];
    alts = alts.filter((i) => {
        if ((i.base == base && i.alt == alt)) {
            removed.push(i.alt);
            return false;
        }
        return true;
    });
    writeAlts(alts);
    let characters = getCharacters();
    removed.forEach((add) => {
        if (characters.findIndex(fighter => fighter.name == add) == -1) {
            appendCharacter(add);
        }
    });
}

function removeAlts(characterName) {
    console.log("Removing " + characterName + " from alts.");
    let alts = getAlts();
    let removed = [];
    alts = alts.filter((i) => {
        if (!(i.base == characterName || i.alt == characterName)) {
            return true;
        } else if (i.base == characterName) {
            removed.push(i.alt);
        }
        return false;
    });
    writeAlts(alts);
    let characters = getCharacters();
    removed.forEach((add) => {
        if (characters.findIndex(fighter => fighter.name == add) == -1) {
            appendCharacter(add);
        }
    });
}

// Character Selection Screen
ipcMain.on("getPages", (event, args) => {
    let pages = [];
    pages.push("css.txt");
    getAllFiles(path.join(cmcDir, "data", "css")).forEach((file) => {
        pages.push(path.join("css", path.parse(file).base));
    });
    win.webContents.send("from_GetPages", pages);
});

ipcMain.on("getCSS", (event, args) => {
    win.webContents.send("from_GetCSS", {
        css: getCSS(args),
        characters: getCharacters(),
        cmcDir: cmcDir,
    });
});

function getCSS(page) {
    let cssFile = fs.readFileSync(path.join(cmcDir, "data", page), "ascii").split(/\r?\n/);
    let css = [];
    cssFile.forEach((line) => {
        css.push(line.split(" "))
    });
    css[css.length - 1].pop();
    return css;
}

ipcMain.on("writeCSS", (event, args) => {
    writeCSS(args.css, args.page);
});

function writeCSS(css, page) {
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
    fs.writeFileSync(path.join(cmcDir, "data", page), cssFile, "ascii");
}

//Stages
ipcMain.on("getStageList", (event, args) => {
    altsToFighters();
    win.webContents.send("from_getStageList", {
        stages: getStages(),
        cmcDir: cmcDir,
        random: [],
        // random: getRandomStages(),
    });
});

function getStages() {
    let stages = [];
    let stagesTxt = fs.readFileSync(path.join(cmcDir, "data", "stages.txt"), "ascii").split(/\r?\n/);
    stages.shift();
    for(let stage = 0; stage < (stagesTxt.length / 4); stage++) {
        stages[stage] = {
            name: stagesTxt[stage*4 + 1],
            displayName: stagesTxt[stage*4 + 2],
            displaySource: stagesTxt[stage*4 + 3],
            series: stagesTxt[stage*4 + 4],
        };
    }
    stages.pop();
    return stages;
}

function writeStages(stages) {
    let output = (stages.length) + "\r\n";
    stages.forEach((stage) => {
        output += stage.name + "\r\n";
        output += stage.displayName + "\r\n";
        output += stage.displaySource + "\r\n";
        output += stage.series + "\r\n";
    });
    fs.writeFileSync(path.join(cmcDir, "data", "stages.txt"), output, "ascii");
}

function appendStage(add) {
    let stages = getStages();
    stages.push({
        name: add,
        displayName: "",
        displaySource: "",
        series: "",
    });
    writeStages(stages);
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
    fs.writeFileSync(path.join(cmcDir, "data", "fighters.txt"), output, "ascii");
    toggleRandomCharacter(true, drop);
    removeAlts(drop);
}

ipcMain.on("installStageDir", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        installStage(dir.filePaths[0], args);
    });
});

ipcMain.on("installStageArch", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openFile"]
    }).then(async (file) => {
        if (file.canceled === true) {
            return;
        }
        await installStageArch(file.filePaths[0]);
        // fs.removeSync(path.join(__dirname, "_temp"));
    });
});

async function installStageArch(filePath, args) {
    let modName = path.parse(filePath).name;
    let dir = path.join(__dirname, "_temp", modName);
    fs.ensureDirSync(dir);
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
                    fs.writeFileSync(path.join(dir, fileE.fileHeader.name), Buffer.from(fileE.extraction));
                }
            });
            break;
        case ".7z":
        default:
            return;
            break;
    }
    await installStage(dir, args);
    fs.removeSync(path.join(__dirname, "_temp"));
}

function installStage(dir, filteredInstall) {
    while (!fs.existsSync(path.join(dir, "stage"))) {
        console.log("Stage directory not found in " + dir);
        let contents = fs.readdirSync(dir);
        if (contents.length = 1) {
            dir = path.join(dir, contents[0]);
            console.log(dir);
        } else {
            win.webContents.send("throwError", "Stage directory not found in " + dir);
            return;
        }
    }
    console.log(fs.readdirSync(dir));
    let stageName = fs.readdirSync(path.join(dir, "stage")).filter((file) => { return file.endsWith(".bin") || !file.includes(".") })[0].split(".")[0];
    for (let stage of getStages()) {
        if (stage.name == stageName) {
            win.webContents.send("throwError", "The selected stage is already installed.");
            return;
        }
    };

    // if (filteredInstall) {
    //     filterStageFiles(stageName).forEach((file) => {
    //         let subDir = path.parse(file).dir;
    //         if (file.includes("*")) {
    //             let start = path.parse(file).base.split("*")[0].replace(subDir, "");
    //             let end = path.parse(file).base.split("*")[1];
    //             if (fs.existsSync(path.join(dir, subDir))) {
    //                 let contents = fs.readdirSync(path.join(dir, subDir)).filter((i) => {
    //                     return i.startsWith(start) && i.endsWith(end);
    //                 });
    //                 contents.forEach((found) => {
    //                     console.log("Copying: " + path.join(dir, subDir, found));
    //                     fs.copySync(path.join(dir, subDir, found), path.join(cmcDir, subDir, found), {overwrite: true});
    //                 });
    //             }
    //         } else {
    //             if (fs.existsSync(path.join(dir, file))) {
    //                 console.log("Copying: " + path.join(dir, file));
    //                 fs.copySync(path.join(dir, file), path.join(cmcDir, file), {overwrite: true});
    //             }
    //         }
    //     });
    // } else {
    //     fs.copySync(dir, path.join(cmcDir), {overwrite: true});
    // }

    let txts = fs.readdirSync(dir).filter((file) => path.parse(file).ext.toLowerCase() == ".txt");
    console.log(txts);
    if (txts.length == 1) {
        if (fs.readFileSync(path.join(dir, txts[0]), "ascii").split(/\r?\n/).length == 4) {
            console.log("here");
        }
    }

    // appendStage(stageName);
    win.webContents.send("from_installStage");
}

function filterStageFiles(stageName, ignoreSeries = false) {
    let files = [];
    STAGE_FILES.forEach((file) => {
        let fixedFiles = [];
        let replaced = file.replace("<stage>", stageName);
        if(!ignoreSeries) {
            replaced = replaced.replace("<series>", characterDat[3]);
        }
        fixedFiles.push(replaced);
        fixedFiles.forEach((fixed) => {
            files.push(fixed);
        });
    });
    return files;
}

// Port Characters
ipcMain.on("checkSourceDir", (event, args) => {
    let dir = sourceDir;
    if (sourceDir == undefined || sourceDir == "" || version == null) {
        dir = "None Selected";
    }
    win.webContents.send("from_checkSourceDir", dir);
});

ipcMain.on("selectSourceDir", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        if (!fs.existsSync(path.join(dir.filePaths[0], "fighter"))) {
            win.webContents.send("throwError", "No fighter directory found within the selected directory.");
            return;
        }
        getAllFiles(dir.filePaths[0]).forEach((file) => {
            fs.chmodSync(file, 0o777);
        });
        sourceDir = path.join(dir.filePaths[0]);

        win.webContents.send("from_selectSourceDir", sourceDir);
    });
});

ipcMain.on("openSourceDir", (event, args) => {
    shell.openPath(sourceDir);
});

ipcMain.on("getCharacterListSource", (event, args) => {
    console.log(sourceDir);
    let characters = getCharacters(sourceDir);
    getAlts(sourceDir).forEach((character) => {
        let characterSeries = "";
        if (fs.existsSync(path.join(sourceDir, "data", "dats", character.alt + ".dat"))) {
            characterSeries = fs.readFileSync(path.join(sourceDir, "data", "dats", character.alt + ".dat"), "ascii").split(/\r?\n/)[3].toLowerCase();
        }
        characters.push({
            name: character.alt,
            displayName: character.displayName,
            series: characterSeries,
        });
    });
    win.webContents.send("from_getCharacterListSource", {
        characters: characters,
        sourceDir: sourceDir,
    });
});

ipcMain.on("extractCharacterSource", (event, args) => {
    args -= 1;
    win.webContents.send("from_extractCharacterSource", extractCharacter(args, sourceDir));
});

ipcMain.on("installCharacterSource", (event, args) => {
    installCharacter(args.dir, args.filtered);
});

// Misc
ipcMain.on("installModDir", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;
        }
        installMod(dir.filePaths[0]);
    });
});

ipcMain.on("installModArch", (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openFile"]
    }).then(async (file) => {
        if (file.canceled === true) {
            return;
        }
        let filePath = file.filePaths[0];
        let modName = path.parse(filePath).name;
        let dir = path.join(__dirname, "_temp", modName);
        fs.ensureDirSync(dir);
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
        await installMod(dir);
        fs.removeSync(path.join(__dirname, "_temp"));
    });
});

function installMod(dir) {
    if (fs.existsSync(path.join(dir, path.parse(dir).base))) {
        console.log("Duplicate folder detected");
        dir = path.join(dir, path.parse(dir).base);
    }

    fs.copySync(dir, path.join(cmcDir), {overwrite: true});

    win.webContents.send("from_installMod");
}

// Unused

// ipcMain.on("removeMergedBloat", (event, args) => {
//     getAllFiles(__dirname + "/merged/").forEach(file => {
//         file = file.replace(__dirname + "/merged", "");
//         splitFile = file.split('\\').pop().split('/').pop();
//         for (let bloat of BLOAT) {
//             let splitBloat = bloat.split('\\').pop().split('/').pop();
//             let match = 0;
//             for (let number = 0; number < splitBloat.length; number++) {
//                 if (splitFile[number] == undefined) break;
//                 if (splitFile[number].includes(splitBloat[number])) {
//                     match++;
//                 }
//             }
//             if (match == splitBloat.length) {
//                 fs.rmSync(__dirname + "/merged/" + file);
//             }
//         }
//     });
// });

// ipcMain.on("openModFolder", (event, args) => {
//     shell.openPath(__dirname + "/misc/" + args);
// });

// ipcMain.on("installMod", async (event, args) => {
//     dialog.showOpenDialog(win, {
//         properties: ["openDirectory"]
//     }).then(dir => {
//         if (dir.canceled === true) {
//             return;
//         }
//         let modName = dir.filePaths[0].split('\\').pop().split('/').pop();
//         installMod(dir.filePaths[0], modName);
//     });
// });

// ipcMain.on("installModZip", async (event, args) => {
//     dialog.showOpenDialog(win, {
//         properties: ["openFile"]
//     }).then(async (file) => {
//         if (file.canceled === true) {
//             return;
//         }
//         let dir = __dirname + "/misc/_temp";
//         let fileP = file.filePaths[0];
//         let fileName = fileP.split('\\').pop().split('/').pop().split(".");
//         fileName.pop();
//         modName = fileName[0];
//         dir = dir + "/" + modName;
//         switch (fileP.split(".").pop().toLowerCase()) {
//             case "zip":
//                 await extract(fileP, {
//                     dir: dir,
//                     defaultDirMode: 0o777,
//                     defaultFileMode: 0o777,
//                 });
//                 break;
//             case "rar"://TODO: Error handling
//                 let buf = Uint8Array.from(fs.readFileSync(fileP)).buffer;
//                 let extractor = await unrar.createExtractorFromData({ data: buf });
//                 const extracted = extractor.extract();
//                 const files = [...extracted.files];
//                 files.forEach(fileE => {// Make All Folders First
//                     if (fileE.fileHeader.flags.directory) {
//                         fs.ensureDirSync(dir + "/" + fileE.fileHeader.name);
//                     }
//                 });
//                 files.forEach(fileE => {// Make All Folders First
//                     if (!fileE.fileHeader.flags.directory) {
//                         fs.writeFileSync(dir + "/" + fileE.fileHeader.name, Buffer.from(fileE.extraction));
//                     }
//                 });
//                 break;
//             case "7z":
//             default:
//                 return;
//                 break;
//         }
//         await installMod(dir, modName);
//         fs.removeSync(__dirname + "/misc/_temp");
//     });
// });

// function installMod(dir, modName) {
//     if (fs.existsSync(dir + "/" + dir.split('\\').pop().split('/').pop())) {
//         dir += "/" + dir.split('\\').pop().split('/').pop();
//     }
//     fs.copySync(dir, __dirname + "/misc/" + modName, { overwrite: true });
    
//     let installed = reRequire(__dirname + "/misc/installed.json");
//     installed.misc.push(modName);
//     fs.writeFileSync(
//         __dirname + "/misc/installed.json",
//         JSON.stringify(installed, null, 4),
//         "utf-8"
//     );

//     win.webContents.send("fromInstallMod", installed);
// }

// ipcMain.on("getInstalledModList", (event, args) => {
//     let installed = reRequire(__dirname + "/misc/installed.json");
//     win.webContents.send("fromGetInstalledModList", installed);
// });

// ipcMain.on("removeMod", (event, args) => {
//     let installed = reRequire(__dirname + "/misc/installed.json");
//     installed.misc = installed.misc.filter(mod => mod != args);
//     fs.removeSync(__dirname + "/misc/" + args);
//     fs.writeFileSync(
//         __dirname + "/misc/installed.json",
//         JSON.stringify(installed, null, 4),
//         "utf-8"
//     );
//     win.webContents.send("fromRemoveMod", installed);
// });

// ipcMain.on("increaseModMergePriority", (event, args) => {
//     let installed = reRequire(__dirname + "/misc/installed.json");
//     let index = installed.misc.indexOf(args);
//     if (index == 0) {
//         return;
//     }
//     installed.misc.move(index, index - 1);
//     //TODO: error handling eg outside of range
//     fs.writeFileSync(
//         __dirname + "/misc/installed.json",
//         JSON.stringify(installed, null, 4),
//         "utf-8"
//     );
//     win.webContents.send("fromIncreaseModMergePriority", installed);
// });