import { BrowserWindow } from "electron";
import fs from "fs-extra";
import path from "path";
import { AppData, Download, Stage, StageList } from "./interfaces";

declare const global: {
    win: BrowserWindow,
    gameDir: string,
    log: string,
    appData: AppData,
    downloads: Download[]
};

import * as general from "./general";

const STAGE_FILES: string[] = [
    "stage/<stage>.bin",
    "stage/<stage>/<any>",
    "music/stage/<stage>/<any>",
    "gfx/stgicons/<stage>.png",
    "gfx/stgprevs/<stage>.png",
    "gfx/seriesicon/<series>.png",
];

export function readStages(dir: string = global.gameDir): Stage[] {
    return readStageList(dir).getAllStages();
}

function readStageList(dir: string = global.gameDir): StageList {
    general.log("Read Stage List - Start:", dir);
    const stageList: StageList = new StageList();
    const stagesTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "stages.txt"),
        "ascii"
    ).split(/\r?\n/);
    stagesTxt.shift(); // Drop the number
    for (let stage: number = 0; stage < Math.floor(stagesTxt.length / 4); stage++) {
        stageList.addStage({
            name: stagesTxt[(stage * 4) + 0],
            menuName: stagesTxt[(stage * 4) + 1],
            source: stagesTxt[(stage * 4) + 2],
            series: stagesTxt[(stage * 4) + 3].toLowerCase(),
            randomSelection: true,
            cssNumber: stage + 1,
            icon: path.join(dir, "gfx", "stgicons", stagesTxt[(stage * 4) + 0] + ".png")
        });
    }
    const lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "stage_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    lockedTxt.forEach((locked: string) => {
        if (locked == "") return;
        stageList.updateStageByName(locked, { randomSelection: false });
    });
    general.log("Read Stage List - Return:", stageList);
    return stageList;
}

export async function writeStages(
    stages: Stage[],
    dir: string = global.gameDir
): Promise<void> {
    general.log("Write Stage - Start:", stages, dir);
    stages.sort((a: Stage, b: Stage) =>
        (a.cssNumber > b.cssNumber ? 1 : -1)
    );
    const output: string = [
        stages.length,
        stages.map((stage: Stage) => 
            [
                stage.name,
                stage.menuName,
                stage.source,
                stage.series
            ].join("\r\n")
        ).join("\r\n")
    ].join("\r\n");
    fs.writeFileSync(
        path.join(dir, "data", "stages.txt"),
        output,
        { encoding: "ascii" }
    );
    general.log("Write Stages - Return");
    return;
}

export async function writeStageRandom(
    stage: string,
    randomSelection: boolean,
    dir: string = global.gameDir
): Promise<void> {
    general.log("Write Stage Random - Start:", stage, randomSelection, dir);
    let lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "stage_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    if (randomSelection) {
        lockedTxt = lockedTxt.filter((locked: string) => locked != stage);
    } else {
        lockedTxt.push(stage);
    }
    let output: string = lockedTxt.length + "\r\n";
    output += lockedTxt.join("\r\n");
    fs.writeFileSync(
        path.join(dir, "data", "stage_lock.txt"),
        output,
        { encoding: "ascii" }
    );
    general.log("Write Stage Random - Return");
    return;
}

export function getStageRegExps(
    stage: Stage,
    ignoreSeries: boolean = false
): RegExp[] {
    general.log("Get Stage RegExps - Start:", stage, ignoreSeries);
    const files: RegExp[] = [];
    STAGE_FILES.forEach((file: string) => {
        let wipString: string = file.replaceAll("<stage>", stage.name);
        if (!ignoreSeries) wipString = wipString.replaceAll("<series>", stage.series);
        wipString = general.escapeRegex(wipString);
        wipString += "$";
        wipString = wipString.replaceAll("<any>", "[^\\/\\\\]+");
        files.push(new RegExp(wipString, "gm"));
    });
    general.log("Get Stage RegExps - Return:", files);
    return files;
}

export function getStageFiles(
    stage: Stage,
    ignoreSeries: boolean,
    dir: string = global.gameDir,
    similarNames: string[] = []
): string[] {
    general.log("Get Stage Files - Start:", dir, stage, ignoreSeries, similarNames);
    const stageFiles: string[] = general.getAllFiles(dir)
        .map((file: string) => path.posix.relative(dir, file));
    let stageFilesString: string = stageFiles.join("\n");
    const validFiles: string[] = [];
    getStageRegExps(stage, ignoreSeries).forEach((exp: RegExp) => {
        // console.log(exp);
        for (const match of stageFilesString.matchAll(exp)) {
            // console.log(match);
            validFiles.push(match[0]);
            stageFiles.splice(stageFiles.indexOf(match[0]), 1);
        }
        stageFilesString = stageFiles.join("\n");
    });
    const stageList: StageList = readStageList(dir);
    similarNames.forEach((name: string) => {
        const validFilesString: string = validFiles.join("\n");
        getStageRegExps(stageList.getStageByName(name), ignoreSeries)
            .forEach((exp: RegExp) => {
                for (const match of validFilesString.matchAll(exp)) {
                    validFiles.splice(validFiles.indexOf(match[0]), 1);
                }
            });
    });
    general.log("Get Stage Files - Return:", validFiles);
    return validFiles;
}

export async function extractStage(extract: string, dir: string = global.gameDir): Promise<void> {
    general.log("Extract Stage - Start:", extract, dir);
    const toResolve: Promise<void>[] = [];
    const stageList: StageList = readStageList(dir);
    const similarNames: string[] = [];
    const stage: Stage = stageList.getStageByName(extract);
    const extractDir: string = path.join(dir, "0extracted", extract);
    stageList.getAllStages().forEach((stage: Stage) => {
        if (stage.name.includes(extract) && stage.name != extract) {
            similarNames.push(stage.name);
        }
    });
    
    console.log(new Date().getTime());
    getStageFiles(stage, false, dir, similarNames).forEach((file: string) => {
        const filePath: string = path.join(dir, file);
        const targetPath: string = path.join(extractDir, file);
        fs.ensureDirSync(path.parse(targetPath).dir);
        general.log("Extracting: " + filePath);
        toResolve.push(
            fs.copy(
                filePath,
                targetPath,
                { overwrite: true }
            )
        );
    });
    console.log(new Date().getTime());

    //TODO: create a stage dat format for mod manager only
    // toResolve.push(writeCharacterDat(
    //     characterDat,
    //     path.join(extractDir, "data", "dats")
    // ));
    toResolve.push(fs.writeFile(
        path.join(extractDir, "info.json"),
        JSON.stringify([
            stage.name, stage.menuName, stage.source, stage.series
        ], null, 2)
    ));
    await Promise.allSettled(toResolve);
    general.log("Extract Stage - Return");
    return;
}

export async function removeStage(remove: string, dir: string = global.gameDir): Promise<void> {
    general.log("Remove Stage - Start:", remove, dir);
    const toResolve: Promise<void>[] = [];
    const stageList: StageList = readStageList(dir);
    const stage: Stage = stageList.getStageByName(remove);

    const similarNames: string[] = [];
    stageList.getAllStages().forEach((stage: Stage) => {
        if (stage.name.startsWith(remove) && stage.name != remove) {
            similarNames.push(stage.name);
        }
    });

    console.log(new Date().getTime());
    getStageFiles(stage, true, dir, similarNames).forEach((file: string) => {
        const filePath: string = path.join(dir, file);
        general.log("Removing: " + filePath);
        toResolve.push(
            fs.remove(filePath)
        );
    });
    console.log(new Date().getTime());
    
    stageList.removeStageByName(remove);
    toResolve.push(writeStages(stageList.getAllStages(), dir));
    // toResolve.push(removeStageSss(stage, dir)); //TODO:
    toResolve.push(writeStageRandom(stage.name, true, dir));
    await Promise.allSettled(toResolve);
    general.log("Remove Stage - Return");
    return;
}