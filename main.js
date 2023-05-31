const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require("path");
// const fs = require("fs");
const fs = require("fs-extra");
const childProcess = require("child_process");
var win;

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
            fs.chmodSync(file, 0777);
        });
        // fs.emptyDirSync(__dirname + "/basegame/");
        // fs.rmSync(__dirname + "/basegame", {recursive: true});
        fs.copySync(dir.filePaths[0], __dirname + "/basegame/", { overwrite: true });
        fs.copyFileSync(__dirname + "/basegame/controls.ini", __dirname + "/profiles/controls/default.ini");

        let ssbcFighters = require(__dirname + "/characters/default.json").ssbc;

        let cmcFightersTxt = fs.readFileSync(__dirname + "/basegame/data/fighters.txt", 'utf-8').split(/\r?\n/);
        let cmcFighters = {};
        let installed = require(__dirname + "/characters/installed.json");
        for (let fighter = 0; fighter in cmcFightersTxt; fighter++) {
            if (fighter != 0) {
                let fighterDat = fs.readFileSync(__dirname + "/basegame/data/dats/" + cmcFightersTxt[fighter] + ".dat", 'utf-8')
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
        let altFightersTxt = fs.readFileSync(__dirname + "/basegame/data/alts.txt", 'utf-8').split(/\r?\n/);
        let altFighters = {};
        let noAlts = parseInt(altFightersTxt[0]);
        altFightersTxt.shift();
        for (let fighter = 0; fighter < noAlts; fighter++) {
            let baseFighter = altFightersTxt[fighter * 5];
            let franchise = "";
            let altNumber = parseInt(altFightersTxt[(fighter * 5) + 1]);
            
            try {
                let fighterDat = fs.readFileSync(__dirname + "/basegame/data/dats/" + altFightersTxt[(fighter * 5) + 2] + ".dat", 'utf-8')
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

        installed.number += Object.keys(installed.characters).length;
        let oldInstalled = require(__dirname + "/characters/installed.json");
        let numberDifference = installed.number - oldInstalled.number;
        for (let character of Object.keys(installed.characters)) {
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
    if (fs.existsSync(__dirname + "/merged/controls.ini")) {
        fs.copyFileSync(__dirname + "/merged/controls.ini", __dirname + "/profiles/controls/inUse.ini");
    }
    fs.copySync(__dirname + "/basegame/", __dirname + "/merged/", { overwrite: true });
    if (fs.existsSync(__dirname + "/profiles/controls/inUse.ini")) {
        fs.copyFileSync(__dirname + "/profiles/controls/inUse.ini", __dirname + "/merged/controls.ini");
    }
    //TODO: for each stage
    //FIXME: sort by number
    let installed = require(__dirname + "/characters/installed.json");
    for (let character of Object.keys(installed.characters)) {
        fs.copySync(__dirname + "/characters/" + character, __dirname + "/merged/", { overwrite: true });
    }
    //TODO: generate fighters.txt and stage.txt
    //TODO: load profile css.txt and sss.txt
    win.webContents.send("fromMergeInstalledMods", {
        call: "modsMergeFinished",
        result: true
    });
});

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            // arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })

    return arrayOfFiles
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
});

ipcMain.on("loadControls", (event, args) => {
    fs.copyFileSync(__dirname + "/profiles/controls/" + args.name + ".ini", __dirname + "/merged/controls.ini");
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
        if (!fs.existsSync(dir.filePaths[0] + "/fighter/")) {
            return;//TODO: add alerts
        }
        let characterName = fs.readdirSync(dir.filePaths[0] + "/fighter/")[0].split(".")[0];

        // let characterDir = dir.filePaths[0].split("/")
        // characterDir = characterDir[characterDir.length - 1];

        fs.copySync(dir.filePaths[0], __dirname + "/characters/" + characterName, { overwrite: true });
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
        fs.writeFileSync(
            __dirname + "/characters/installed.json",
            JSON.stringify(installed, null, 4),
            "utf-8"
        );

        win.webContents.send("fromInstallCharacter", installed);
    });
});

ipcMain.on("getInstalledCharList", (event, args) => {
    let installed = require(__dirname + "/characters/installed.json");
    win.webContents.send("fromGetInstalledCharList", installed);
});