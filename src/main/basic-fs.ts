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
        writeAppData({
            dir: "",
            config: DEFAULT_CONFIG
        });
    } else {
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
        writeAppData(global.appData);
    }
    global.appData = await readJSON(DATA_FILE);
}

export async function readJSON(file: string): Promise<any> {
    return JSON.parse(await fs.readFile(file, "utf-8"));
}

export async function writeJSON(file: string, data: object): Promise<void> {
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
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