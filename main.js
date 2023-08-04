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
    "CMC+ v8"
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

var cmcDir = readJSON(path.join(__dirname, "program", "data.json")).dir;
var version = getGameVersion(cmcDir);

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
    let fightersTxt = fs.readFileSync(path.join(cmcDir, "data", "fighters.txt"), "ascii").split(/\r?\n/);
    fightersTxt.shift();
    fightersTxt.forEach((fighter) => {
        if (fs.existsSync(path.join(cmcDir, "data", "dats", fighter + ".dat"))) {
            let fighterDat = fs.readFileSync(path.join(cmcDir, "data", "dats", fighter + ".dat"), "ascii").split(/\r?\n/);
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
    //TODO: remove from css
}

// Index
// ipcMain.on("checkGameInstalled", (event, args) => {
//     win.webContents.send("from_checkGameInstalled", version != null);
// });

// ipcMain.on("importUnmodded", (event, args) => {
//     dialog.showOpenDialog(win, {
//         properties: ["openDirectory"]
//     }).then(dir => {
//         if (dir.canceled === true) {
//             return;
//         }
//         if (getGameVersion(path.join(dir.filePaths[0])) == null) {
//             win.webContents.send("throwError", "No recognised .exe file in the selected directory.");
//             return;
//         }
//         //The new version has horrible permissions so give everything xwr
//         getAllFiles(dir.filePaths[0]).forEach((file) => {
//             fs.chmodSync(file, 0o777);
//         });
//         fs.ensureDirSync(path.join(__dirname, "cmc"));
//         fs.emptyDirSync(path.join(__dirname, "cmc"));
        
//         fs.copySync(dir.filePaths[0], path.join(__dirname, "cmc"), { overwrite: true });
//         version = getGameVersion(path.join(__dirname, "cmc"));

//         win.webContents.send("from_importUnmodded", true);
//     });
// });

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

// Characters
ipcMain.on("getCharacterList", (event, args) => {
    win.webContents.send("from_getCharacterList", {
        characters: getCharacters(),
        cmcDir: cmcDir,
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
        await installCharacter(dir, args);
        fs.removeSync(path.join(__dirname, "_temp"));
    });
});

function installCharacter(dir, filteredInstall) {
    if (!fs.existsSync(path.join(dir, "fighter"))) {
        console.log("Fighters directory not found in " + dir);
        console.log(dir);
        console.log(fs.readdirSync(dir));
        dir = path.join(dir, path.parse(dir).base);
        console.log(fs.readdirSync(dir));
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
                        fs.copySync(path.join(dir, subDir, found), path.join(cmcDir, subDir, found), {overwrite: true});
                    });
                }
            } else {
                if (fs.existsSync(path.join(dir, file))) {
                    console.log("Copying: " + path.join(dir, file));
                    fs.copySync(path.join(dir, file), path.join(cmcDir, file), {overwrite: true});
                }
            }
        });
    } else {
        fs.copySync(dir, path.join(cmcDir), {overwrite: true});
    }

    appendCharacter(characterName);

    if (datMod) {
        fs.writeFileSync(
            path.join(cmcDir, "data", "dats", characterName + ".dat"),
            characterDatTxt,
            "ascii"
        );
    }

    win.webContents.send("from_installCharacter");
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
    deleteCharCSS(parseInt(args) + 1);
    let characters = getCharacters();
    let characterName = characters[args].name;
    let similarName = [];
    characters.forEach((character) => {
        if (character.name != characterName && character.name.startsWith(characterName)) {
            similarName.push(character.name);
        }
    });
    let characterDat = fs.readFileSync(path.join(cmcDir, "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);
    filterCharacterFiles(characters[args].name, characterDat, true).forEach((file) => {
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

    win.webContents.send("from_removeCharacter");
});

ipcMain.on("extractCharacter", (event, args) => {
    args -= 1;
    let characters = getCharacters();
    let characterName = characters[args].name;
    let similarName = [];
    characters.forEach((character) => {
        if (character.name != characterName && character.name.startsWith(characterName)) {
            similarName.push(character.name);
        }
    });
    let characterDat = fs.readFileSync(path.join(cmcDir, "data", "dats", characterName + ".dat"), "ascii").split(/\r?\n/);
    filterCharacterFiles(characters[args].name, characterDat).forEach((file) => {
        let subDir = path.parse(file).dir;
        fs.ensureDirSync(path.join(__dirname, "extracted", characterName, subDir));
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
                    console.log("Extracting: " + path.join(cmcDir, subDir, found));
                    fs.copySync(path.join(cmcDir, subDir, found), path.join(__dirname, "extracted", characterName, subDir, found), {overwrite: true});
                });
            }
        } else {
            if (fs.existsSync(path.join(cmcDir, file))) {
                console.log("Extracting: " + path.join(cmcDir, file));
                fs.copySync(path.join(cmcDir, file), path.join(__dirname, "extracted", characterName, file), {overwrite: true});
            }
        }
    });
    dropCharacter(characterName);

    win.webContents.send("from_extractCharacter");
});

function filterCharacterFiles(characterName, characterDat = null, ignoreSeries = false) {
    let palettes;
    if (characterDat == null) {
        palettes = 20;
    } else {
        palettes = parseInt(characterDat[11]) - 1;
    }

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