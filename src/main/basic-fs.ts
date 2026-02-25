import { app } from "electron";
import fs from "fs-extra";
import path from "path";
import { Language } from "../global/global";

const DEFAULT_CONFIG: AppConfig = {
    enableLogs: false,
    altsAsCharacters: true,
    filterCharacterInstallation: true,
    updateCharacters: false,
    filterStageInstallation: true,
    updateStages: false,
    language: Language.ENGLISH
};

export const DATA_FILE: string = path.join(app.getPath("userData"), "data.json");

export async function loadAppData(): Promise<void> {
    if (!(await fs.exists(DATA_FILE))) {
        global.appData = {
            dir: "",
            config: DEFAULT_CONFIG
        };
    } else {
        try {
            global.appData = await readJSON(DATA_FILE);
            if (global.appData.config == undefined) {
                global.appData.config = DEFAULT_CONFIG;
            } else {
                Object.keys(DEFAULT_CONFIG).forEach((key: keyof AppConfig) => {
                    if (global.appData.config[key] == undefined) {
                        global.appData.config[key] = DEFAULT_CONFIG[key];
                    }
                });
            }
        } catch (error: any) {
            // If data.json is corrupted, reset to defaults
            console.error(`Failed to load ${DATA_FILE}, resetting to defaults:`, error.message);
            global.appData = {
                dir: "",
                config: DEFAULT_CONFIG
            };
        }
    }
    return await writeAppData(global.appData);
}

export async function readJSON(file: string): Promise<any> {
    return JSON.parse(await fs.readFile(file, "utf-8"));
}

export async function writeJSON(file: string, data: object): Promise<void> {
    await fs.writeFile(file + ".tmp", JSON.stringify(data, null, 2), "utf-8");
    await fs.move(file + ".tmp", file, { overwrite: true });
    return;
}

export function readAppData(): AppData {
    return global.appData;
}

let writeQueue: Promise<void> = Promise.resolve();

export async function writeAppData(data: AppData): Promise<void> {
    global.appData = data;
    // Queue writes to prevent concurrent write corruption
    writeQueue = writeQueue.then(() => writeJSON(DATA_FILE, data));
    return writeQueue;
}