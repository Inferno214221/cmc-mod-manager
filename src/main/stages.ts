import { OpenDialogReturnValue, dialog } from "electron";
import fs from "fs-extra";
import path from "path";
import { OpState, StageList } from "../global/global";

import * as general from "./general";
import * as customDialogs from "./custom-dialogs";

const STAGE_FILES: string[] = [
    "stage/<stage>.bin",
    "stage/<stage>/<any>",
    "music/stage/<stage>/<any>",
    "gfx/stgicons/<stage>.png",
    "gfx/stgprevs/<stage>.png",
    "gfx/seriesicon/<series>.png",
];

const BLANK_SSS_PAGE_DATA: SssData = [
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "9999" ],
];

export function readStages(dir: string = global.gameDir): Stage[] {
    return readStageList(dir).getAllStages();
}

function readStageList(dir: string = global.gameDir): StageList {
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
            number: stage + 1,
            icon: path.join(dir, "gfx", "stgicons", stagesTxt[(stage * 4) + 0] + ".png")
        });
    }
    const lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "stage_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    lockedTxt.forEach((locked: string) => {
        if (stageList.getStageByName(locked) == undefined) return;
        stageList.updateStageByName(locked, { randomSelection: false });
    });
    return stageList;
}

export async function writeStages(
    stages: Stage[],
    dir: string = global.gameDir
): Promise<void> {
    stages.sort((a: Stage, b: Stage) =>
        (a.number > b.number ? 1 : -1)
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
    return;
}

export async function writeStageRandom(
    stage: string,
    randomSelection: boolean,
    dir: string = global.gameDir
): Promise<void> {
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
    return;
}

export function getStageRegExps(
    stage: Stage,
    ignoreSeries: boolean = false
): RegExp[] {
    const files: RegExp[] = [];
    STAGE_FILES.forEach((file: string) => {
        let wipString: string = file.replaceAll("<stage>", stage.name);
        if (!ignoreSeries) wipString = wipString.replaceAll("<series>", stage.series);
        wipString = general.escapeRegex(wipString);
        wipString += "$";
        wipString = wipString.replaceAll("<any>", "[^\\/\\\\]+");
        files.push(new RegExp(wipString, "gmi"));
    });
    return files;
}

export function getStageFiles(
    stage: Stage,
    ignoreSeries: boolean,
    dir: string = global.gameDir,
    similarNames: string[] = []
): string[] {
    const stageFiles: string[] = general.getAllFiles(dir)
        .map((file: string) => path.relative(dir, file).split(path.sep).join(path.posix.sep));
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
    if (similarNames.length > 0) {
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
    }
    return validFiles;
}

export async function installStageDir(
    filterInstallation: boolean,
    updateStages: boolean,
    dir: string = global.gameDir
): Promise<Stage | null> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        properties: ["openDirectory"]
    });
    if (selected.canceled == true) {
        return null;
    }
    const retVal: Stage | null =
        await installStage(selected.filePaths[0], filterInstallation, updateStages, dir);
    return retVal;
}

export async function installStageArchive(
    filterInstallation: boolean,
    updateStages: boolean,
    dir: string = global.gameDir
): Promise<Stage | null> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        properties: ["openFile"]
    });
    if (selected.canceled == true) {
        return null;
    }
    const output: string = await general.extractArchive(
        selected.filePaths[0],
        global.temp
    );
    const retVal: Stage | null =
        await installStage(output, filterInstallation, updateStages, dir);
    return retVal;
}

export async function installStage(
    stageDir: string,
    filterInstallation: boolean = true,
    updateStages: boolean = false,
    dir: string = global.gameDir
): Promise<Stage | null> {
    const toResolve: Promise<void>[] = [];
    let correctedDir: string = stageDir;
    const modFiles: string[] = general.getAllFiles(correctedDir)
        .map((file: string) => file.replace(correctedDir, ""));
    for (let file of modFiles) {
        file = path.join(file).split(path.sep).join(path.posix.sep);
        const fileDir: string = path.posix.parse(file).dir + "/";
        if (fileDir.includes("/stage/") && !file.includes("/music/")) {
            let topDir: string = file.split("/").shift();
            while (topDir != "stage") {
                correctedDir = path.join(correctedDir, topDir);
                file = file.replace(topDir + "/", "");
                topDir = file.split("/").shift();
            }
            break;
        }
    }
    if (!fs.readdirSync(correctedDir).includes("stage")) {
        throw new Error("No 'stage' subdirectory found.");
    }
    const stageName: string = fs.readdirSync(path.join(correctedDir, "stage"))
        .filter((file: string) =>
            file.endsWith(".bin") || !file.includes(".")
        )[0].split(".")[0];
    const stageList: StageList = readStageList(dir);
    if (!updateStages && stageList.getStageByName(stageName) != undefined) {
        throw new Error("Stage already installed, updates disabled.");
    }

    let stage: Stage;
    console.log(
        path.join(correctedDir, "info.json"),
        fs.existsSync(path.join(correctedDir, "info.json"))
    );
    if (fs.existsSync(path.join(correctedDir, "info.json"))) {
        const infoTxt: string[] = general.readJSON(path.join(correctedDir, "info.json"));
        console.log(infoTxt);
        stage = {
            name: stageName,
            menuName: infoTxt[0],
            source: infoTxt[1],
            series: infoTxt[2],
            randomSelection: true,
            number: stageList.getNextNumber(),
            icon: path.join(dir, "gfx", "stgicons", stageName + ".png")
        }
    } else {
        if (!(await customDialogs.confirm({
            id: "confirmStageInput",
            title: "CMC Mod Manager | Stage Installation",
            body: "Because of CMC+'s current modding format, you will be required to enter some " +
                "information about the stage you are installing. This information can usually be " +
                "found in a txt file in the mod's top level directory. (If such a txt file " +
                "exists and contains four lines, the first one likely is unnecessary.)",
            okLabel: "Continue"
        }))) {
            return null;
        }

        if (await customDialogs.confirm({
            id: "openStageDir",
            title: "CMC Mod Manager | Stage Installation",
            body: "Would you like to open the mod's directory to find any txt files manually?",
            okLabel: "Yes",
            cancelLabel: "No"
        })) {
            general.openDir(correctedDir);
        }

        let menuName: string = "";
        while (menuName == "") {
            menuName = await customDialogs.prompt({
                id: "inputStageMenuName",
                title: "CMC Mod Manager | Stage Installation",
                body: "Please enter the stage's 'menu name'. (The name that will be displayed " +
                    "on the stage selection screen.)",
                placeholder: "Stage's Menu Name"
            });
            if (menuName == undefined) return null;
        }

        let source: string = "";
        while (source == "") {
            source = await customDialogs.prompt({
                id: "inputStageSource",
                title: "CMC Mod Manager | Stage Installation",
                body: "Please enter the stage's 'source'. (The name of the source content that " +
                    "the stage is originally from, such as the title of the game.)",
                placeholder: "Stage's Source"
            });
            if (source == undefined) return null;
        }

        let series: string = "";
        while (series == "") {
            series = await customDialogs.prompt({
                id: "inputStageSeries",
                title: "CMC Mod Manager | Stage Installation",
                body: "Please enter the stage's 'series'. (This name will be used to select the " +
                    "icon to use on the stage selection screen. This value is usually short and " +
                    "in all lowercase letters.)",
                placeholder: "Stage's Series"
            });
            if (series == undefined) return null;
        }

        stage = {
            name: stageName,
            menuName: menuName,
            source: source,
            series: series,
            randomSelection: true,
            number: stageList.getNextNumber(),
            icon: path.join(dir, "gfx", "stgicons", stageName + ".png")
        }
    }

    if (updateStages) {
        if (
            (
                fs.existsSync(path.join(correctedDir, "stage", stageName + ".bin")) ||
                fs.existsSync(path.join(correctedDir, "stage", stageName))
            ) &&
            (
                fs.existsSync(path.join(dir, "stage", stageName + ".bin")) ||
                fs.existsSync(path.join(dir, "stage", stageName))
            )
        ) {
            console.log("Removing bin & folder for replacement.");
            fs.removeSync(path.join(dir, "stage", stageName + ".bin"));
            fs.removeSync(path.join(dir, "stage", stageName));
        }
    }

    if (filterInstallation) {
        getStageFiles(stage, false, correctedDir).forEach((file: string) => {
            const filePath: string = path.join(correctedDir, file);
            const targetPath: string = path.join(dir, file);
            fs.ensureDirSync(path.parse(targetPath).dir);
            if (!updateStages && fs.existsSync(targetPath)) return;
            toResolve.push(
                fs.copy(
                    filePath,
                    targetPath,
                    { overwrite: !file.startsWith("gfx/seriesicon/") }
                )
            );
        });
    } else {
        toResolve.push(fs.copy(correctedDir, dir, { overwrite: true }));
    }

    if (stageList.getStageByName(stageName) != undefined) {
        return stageList.getStageByName(stageName);
    }
    stageList.addStage(stage);
    toResolve.push(writeStages(stageList.getAllStages(), dir));
    await Promise.allSettled(toResolve);
    fs.removeSync(path.join(dir, "info.json"));
    return stage;
}

export async function installDownloadedStage(targetDir: string, id: string): Promise<void> {
    const stage: Stage = await installStage(
        targetDir,
        true,
        global.appData.config.updateStages,
        global.gameDir
    );
    if (stage == null) {
        global.win.webContents.send("updateOperation", {
            id: id + "_install",
            state: OpState.canceled
        });
        return;
    }
    global.win.webContents.send("updateOperation", {
        id: id + "_install",
        title: "Stage Installation",
        body: "Installed stage: '" + stage.name + "' from GameBanana.",
        image: "img://" + stage.icon,
        state: OpState.finished
    });
    global.win.webContents.send("installStage");
    return;
}

export async function extractStage(extract: string, dir: string = global.gameDir): Promise<void> {
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
        toResolve.push(
            fs.copy(
                filePath,
                targetPath,
                { overwrite: true }
            )
        );
    });
    console.log(new Date().getTime());

    toResolve.push(fs.writeFile(
        path.join(extractDir, "info.json"),
        JSON.stringify([
            stage.menuName, stage.source, stage.series
        ], null, 2)
    ));
    await Promise.allSettled(toResolve);
    return;
}

export async function removeStage(remove: string, dir: string = global.gameDir): Promise<void> {
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
        toResolve.push(
            fs.remove(filePath)
        );
    });
    console.log(new Date().getTime());
    
    stageList.removeStageByName(remove);
    toResolve.push(writeStages(stageList.getAllStages(), dir));
    toResolve.push(removeStageSss(stage, dir));
    toResolve.push(writeStageRandom(stage.name, true, dir));
    await Promise.allSettled(toResolve);
    return;
}

export function readSssPages(dir: string = global.gameDir): SssPage[] {
    const pages: SssPage[] = [];
    // Currently SSS Pages are a fixed size - 10x6. Although it is possible that his may change in
    // the future, if any changes would be made to the stage format, it would likely become more
    // consistent with the current character format and therefor need major adjustments anyway
    const sssTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "sss.txt"),
        "ascii"
    ).split(/\r?\n/);
    sssTxt.shift();
    for (let page: number = 0; page < Math.floor(sssTxt.length / 7); page++) {
        const data: SssData = [];
        for (let line: number = 1; line < 7; line++) {
            data.push(sssTxt[(page * 7) + line].split(" ").filter((cell: string) => cell != ""));
        }
        pages.push({
            name: sssTxt[(page * 7) + 0],
            pageNumber: page,
            data: data
        });
    }
    return pages;
}

export async function writeSssPages(pages: SssPage[], dir: string = global.gameDir): Promise<void> {
    pages.sort((a: SssPage, b: SssPage) =>
        (a.pageNumber > b.pageNumber ? 1 : -1)
    );
    const output: string = [
        pages.length,
        pages.map((page: SssPage) =>
            [
                page.name,
                page.data.map((row: string[]) => row.join(" ")).join("\r\n")
            ].join("\r\n")
        ).join("\r\n")
    ].join("\r\n");
    fs.writeFileSync(
        path.join(dir, "data", "sss.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

export async function removeStageSss(
    stage: Stage,
    dir: string = global.gameDir
): Promise<void> {
    const sssPages: SssPage[] = readSssPages(dir);
    for (const page of sssPages) {
        page.data = page.data.map((row: string[]) =>
            row.map((cell: string) => {
                if (parseInt(cell) == stage.number) {
                    return "0000";
                } else if (parseInt(cell) > stage.number && cell != "9999") {
                    return ("0000" + (parseInt(cell) - 1)).slice(-4);
                } else {
                    return cell;
                }
            })
        );
    }
    await writeSssPages(sssPages, dir);
    return;
}

export async function removeSeriesStages(
    series: string,
    dir: string = global.gameDir
): Promise<void> {
    const stagesToRemove: Stage[] = readStages(dir)
        .filter((stage: Stage) => stage.series == series);
    console.log(new Date().getTime());
    for (const stage of stagesToRemove) {
        console.log(stage);
        await removeStage(stage.name, dir);
    }
    console.log(new Date().getTime());
    return;
}

export async function addSssPage(pageName: string, dir: string = global.gameDir): Promise<void> {
    pageName = pageName.replace(/'|"/g, "");
    const pages: SssPage[] = readSssPages(dir);
    pages.push({ name: pageName, pageNumber: pages.length, data: BLANK_SSS_PAGE_DATA });
    writeSssPages(pages);
    return;
}

export async function removeSssPage(page: SssPage, dir: string = global.gameDir): Promise<void> {
    const pages: SssPage[] = readSssPages(dir).filter((i: SssPage) =>
        !(i.name == page.name && i.pageNumber == page.pageNumber)
    );
    await writeSssPages(pages, dir);
    return;
}