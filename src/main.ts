import { app, BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function createHandlers() {
    ipcMain.handle('getGameVersion', (event, args: Parameters<typeof getGameVersion>) => getGameVersion(...args));//: [dir: string, list: string[]]
    ipcMain.handle('getGameDir', getGameDir);
}

const SUPPORTED_VERSIONS: string[] = [
    "CMC_v8",
    "CMC+ v8",
];

const DATA_FILE = path.join(app.getPath("userData"), "data.json");
if (!fs.existsSync(DATA_FILE)) {
    writeJSON(DATA_FILE, {
        dir: "",
    });
}
let gameDir: string = readJSON(DATA_FILE).dir;
let version: string = getGameVersion(gameDir);

function readJSON(file: string) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeJSON(file: string, data: object) {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf-8");
}

function getGameDir() {
    return gameDir;
}

function getGameVersion(dir: string, list: string[] = SUPPORTED_VERSIONS) {
    for (const game of list) {
        if (fs.existsSync(path.join(dir, game + ".exe"))) {
            return game;
        }
    }
    return null;
}