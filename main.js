const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require("path");
// const fs = require("fs");
const fs = require("fs-extra");
const childProcess = require("child_process");
require('array.prototype.move');
const extract = require('extract-zip');
const strftime = require('strftime');
var win;

const PERSIST = [
    "controls.ini",
    "settings.ini",
    "data/cmc_stuff.bin",
    "data/records.bin",
    "data/stats/general.bin"
    //I think favourite character is in the last one
];

const createWindow = () => {
    win = new BrowserWindow({
        width: 810,
        height: 600,
        minWidth: 810,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        autoHideMenuBar: true
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    /*if (process.platform !== 'darwin') */
    app.quit();
});

// Allow fs functions to be called from the app
ipcMain.on("fs", (event, args) => {
    win.webContents.send("fromFs", {
        call: args.call,
        callArgs: args.callArgs,
        result: fs[args.method.toString()].apply(null, args.arguments)
    });
});

// ipcMain.on("showOpenDialog", (event, args) => {
//     dialog.showOpenDialog(win, {
//         properties: [args.properties]
//     }).then(dir => {
//         win.webContents.send("fromShowOpenDialog", {
//             call: args.call,
//             callArgs: args.callArgs,
//             result: dir
//         });
//     });
// });

ipcMain.on("getGameSource", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;//TODO: add alerts
        }
        if (!fs.existsSync(dir.filePaths[0] + "/CMC+ v7.exe")) {
            return;//TODO: add alerts
        }
        //The new version has horrible permissions so give everything xwr
        getAllFiles(dir.filePaths[0]).forEach((file) => {
            fs.chmodSync(file, 0o777);
        });
        // fs.emptyDirSync(__dirname + "/basegame/");
        // fs.rmSync(__dirname + "/basegame", {recursive: true});
        fs.copySync(dir.filePaths[0], __dirname + "/basegame/", { overwrite: true });
        fs.copyFileSync(__dirname + "/basegame/controls.ini", __dirname + "/profiles/controls/default.ini");

        let ssbcFighters = require(__dirname + "/characters/default.json").ssbc;

        let cmcFightersTxt = fs.readFileSync(__dirname + "/basegame/data/fighters.txt", "utf-8").split(/\r?\n/);
        let cmcFighters = {};
        let installed = require(__dirname + "/characters/installed.json");
        for (let fighter = 0; fighter in cmcFightersTxt; fighter++) {
            if (fighter != 0) {
                let fighterDat = fs.readFileSync(__dirname + "/basegame/data/dats/" + cmcFightersTxt[fighter] + ".dat", "utf-8")
                .split(/\r?\n/);
                let fighterData = {
                    // name: cmcFightersTxt[fighter],
                    displayName: fighterDat[1],
                    franchise: fighterDat[3],
                    number: fighter + 65 // Evil ryu is 65 and the last character on the ssbc roster
                    // Easier than working it out later
                };
                cmcFighters[cmcFightersTxt[fighter]] = fighterData;
                installed.number = fighter;
                // cmcFighters.push(fighterData);
            }
        }
        installed.number += 65;

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

            if (ssbcFighters[baseFighter] != undefined) {
                franchise = ssbcFighters[baseFighter].franchise;
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

        fs.writeFileSync(
            __dirname + "/characters/default.json",
            JSON.stringify({
                ssbc: ssbcFighters,
                cmc: cmcFighters,
                alts: altFighters
            }, null, 4),
            "utf-8"
        );

        installed.number += installed.priority.length;
        let oldInstalled = require(__dirname + "/characters/installed.json");
        let numberDifference = installed.number - oldInstalled.number;
        for (let character of installed.priority) {
            installed.characters[character].number += numberDifference;
        }

        fs.writeFileSync(
            __dirname + "/characters/installed.json",
            JSON.stringify(installed, null, 4),
            "utf-8"
        );

        win.webContents.send("fromGetGameSource", {
            call: "gameSourceInstalled",
            result: true
        });
    });
});

ipcMain.on("mergeInstalledMods", async (event, args) => {
    if (!fs.existsSync(__dirname + "/basegame/CMC+ v7.exe")) {
        return;//TODO: add alerts
    }

    if (!fs.existsSync(__dirname + "/tmp/")) {
        fs.mkdirSync(__dirname + "/tmp/");
        fs.mkdirSync(__dirname + "/tmp/data/");
        fs.mkdirSync(__dirname + "/tmp/stats/");
    }
    for (let file of PERSIST) {
        console.log(file);
        if (fs.existsSync(__dirname + "/merged/" + file)) {
            fs.copySync(__dirname + "/merged/" + file, __dirname + "/tmp/" + file, { overwrite: true });
        }
    }

    fs.copySync(__dirname + "/basegame/", __dirname + "/merged/", { overwrite: true });

    for (let file of PERSIST) {
        if (fs.existsSync(__dirname + "/tmp/" + file)) {
            fs.copySync(__dirname + "/tmp/" + file, __dirname + "/merged/" + file, { overwrite: true });
        }
    }
    fs.removeSync(__dirname + "/tmp/");

    //TODO: for each stage
    let installed = require(__dirname + "/characters/installed.json");
    for (let character of installed.priority.toReversed()) {
        fs.copySync(__dirname + "/characters/" + character, __dirname + "/merged/", { overwrite: true });
    }
    //TODO: generate fighters.txt and stage.txt
    let cmcFighters = require(__dirname + "/characters/default.json").cmc;
    let installedFighters = require(__dirname + "/characters/installed.json");
    let fightersTxt = "";
    fightersTxt += installedFighters.number - 65 + "\r\n";
    for (let number = 65; number <= (installedFighters.number - installedFighters.priority.length); number++) {
        for (let fighter of Object.keys(cmcFighters)) {
            if (cmcFighters[fighter].number == number) {
                fightersTxt += fighter + "\r\n";
                break;
            }
        }
    }
    
    for (let fighter of installedFighters.priority) {
        fightersTxt += fighter + "\r\n";
    }
    fs.writeFileSync(
        __dirname + "/merged/data/fighters.txt",
        fightersTxt,
        "ascii"
    );

    let date = new Date();
    let time = strftime("%I:%M %p %x", date);
    fs.writeFileSync(
        __dirname + "/program/info.json", JSON.stringify({
            time: date
        }, null, 4), "utf-8"
    );
    win.webContents.send("fromMergeInstalledMods", time);
});

ipcMain.on("getLastMerge", async (event, args) => {
    let date = new Date(JSON.parse(fs.readFileSync('./program/info.json')).time);//require wasn't updating
    let time = strftime("%I:%M %p %x", date);
    win.webContents.send("fromGetLastMerge", time);
});

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

ipcMain.on("runCMC", async (event, args) => {
    dir = args.path;
    //Additionally the exe doesn't have execute perms on linux
    //sudo chmod a+x ./* -R
    childProcess.execFile(__dirname + dir + "/CMC+ v7.exe", {
        cwd: __dirname + dir,
        windowsHide: true
    });
    //TODO: Catch fails e.g. merged empty
    app.quit();
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

ipcMain.on("openFolder", (event, args) => {
    shell.openPath(__dirname + args);
});

ipcMain.on("openCharacterFolder", (event, args) => {
    shell.openPath(__dirname + "/characters/" + args);
});

ipcMain.on("installCharacter", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    }).then(dir => {
        if (dir.canceled === true) {
            return;//TODO: add alerts
        }
        installCharacter(dir.filePaths[0]);
    });
});

ipcMain.on("installCharacterZip", async (event, args) => {
    dialog.showOpenDialog(win, {
        properties: ["openFile"]
    }).then(async (file) => {
        if (file.canceled === true) {
            return;//TODO: add alerts
        }
        let dir = __dirname + "/characters/_temp"
        await extract(file.filePaths[0], {
            dir: dir,
            defaultDirMode: 0o777,
            defaultFileMode: 0o777,
        });
        await installCharacter(dir);
        fs.removeSync(dir);
    });
});

function installCharacter(dir) {
    if (!fs.existsSync(dir + "/fighter/")) {
        return;//TODO: add alerts
    }
    let characterName = fs.readdirSync(dir + "/fighter/")[0].split(".")[0];

    // let characterDir = dir.filePaths[0].split("/")
    // characterDir = characterDir[characterDir.length - 1];

    fs.copySync(dir, __dirname + "/characters/" + characterName, { overwrite: true });
    //FIXME: if it overwrites a directory it will cause issue later

    let characterDat = [];
    //TODO: errors on no dat
    if (!fs.existsSync(__dirname + "/characters/" + characterName + "/data/dats/")) {
        fs.moveSync(__dirname + "/characters/" + characterName + "/data/" + characterName + ".dat", __dirname + "/data/dats/" + characterName + ".dat", { overwrite: true });
    }
    characterDat = fs.readFileSync(__dirname + "/characters/" + characterName + "/data/dats/" + characterName + ".dat", "utf-8").split(/\r?\n/);
    
    let installed = require(__dirname + "/characters/installed.json");
    installed.number += 1;
    let characterData = {
        "displayName": characterDat[1],
        "franchise": characterDat[3],
        "number": installed.number
    };
    installed.characters[characterName] = characterData;
    installed.priority.push(characterName);
    fs.writeFileSync(
        __dirname + "/characters/installed.json",
        JSON.stringify(installed, null, 4),
        "utf-8"
    );

    win.webContents.send("fromInstallCharacter", installed);
}

ipcMain.on("getInstalledCharList", (event, args) => {
    let installed = require(__dirname + "/characters/installed.json");
    win.webContents.send("fromGetInstalledCharList", installed);
});

ipcMain.on("removeCharacter", (event, args) => {
    let installed = require(__dirname + "/characters/installed.json");
    let removeNumber = installed.characters[args].number;
    delete installed.characters[args];
    installed.number -= 1;
    installed.priority = installed.priority.filter((character) => {
        return character !== args;
    });
    installed.priority.forEach((character) => {
        if (installed.characters[character].number > removeNumber) {
            installed.characters[character].number -= 1;
        }
    });
    fs.removeSync(__dirname + "/characters/" + args);
    fs.writeFileSync(
        __dirname + "/characters/installed.json",
        JSON.stringify(installed, null, 4),
        "utf-8"
    );
    win.webContents.send("fromRemoveCharacter", installed);
});

ipcMain.on("increaseMergePriority", (event, args) => {
    let installed = require(__dirname + "/characters/installed.json");
    let index = installed.priority.indexOf(args);
    if (index == 0) {
        return;//TODO: add alerts
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

ipcMain.on("getCSS", (event, args) => {
    let cssFile;
    try {
        cssFile = fs.readFileSync(__dirname + "/merged/data/css.txt", "utf-8").split(/\r?\n/);
    } catch (error) {
        if (error.code == "ENOENT") {
            win.webContents.send("errorGetCSS");
        }
        return;
    }
    if (cssFile == undefined) return;
    let css = [];
    for (let line = 0; line < cssFile.length; line++) {
        if (cssFile[line].includes("undefined")) {
            break; //FIXME: this is a horrible fix
        }
        css[line] = cssFile[line].split(" ");
    }
    let basegame = require(__dirname + "/characters/default.json");
    let installed = require(__dirname + "/characters/installed.json");
    win.webContents.send("fromGetCSS", {
        css: css,
        basegame: basegame, 
        installed: installed
    });
});

ipcMain.on("writeCSS", (event, css) => {
    let maxY = css.length;
    // if (css[maxY - 1] == ['']) {
    //     maxY--;
    // }
    //FIXME: merge -> mod css -> launch -> mod css -> prints undefined on the last line
    let maxX = css[0].length;
    let output = "";

    for (let y = 0; y < maxY; y++) {
        for (let x = 0; x < maxX; x++) {
            output += css[y][x] + (x == maxX - 1 ? /*(y == maxY - 1 ? " " : */"\r\n"/*)*/ : " ");
        }
    }
    // output += " ";

    fs.writeFileSync(
        __dirname + "/merged/data/css.txt",
        output,
        "ascii"
    );
});