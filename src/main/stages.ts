import fs from "fs-extra";
import path from "path";
import { OpDep, OpState, StageList, error } from "../global/global";

import * as general from "./general";
import * as customDialogs from "./custom-dialogs";

const STAGE_FILES: string[] = [
    "data/sinfo/<stage>.json",
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
    return readStageList(dir).toArray();
}

function readStageList(dir: string = global.gameDir): StageList {
    const stageList: StageList = new StageList();
    const stagesTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "stages.txt"),
        "ascii"
    ).split(/\r?\n/);
    stagesTxt.shift(); // Drop the number

    const isV7: boolean = (stagesTxt.map((line: string, index: number) => {
        const wrappedIndex: number = (index + 1) % 4;
        if (wrappedIndex <= 1) {
            return [/^[^ ]+$/.test(line), line];
        } else {
            return [true];
        }
    }).filter((success: any) => !success[0]).length != 0);

    if (isV7) {
        for (let stage: number = 0; stage < Math.floor(stagesTxt.length / 3); stage++) {
            stageList.add({
                name: stagesTxt[(stage * 3) + 0],
                menuName: stagesTxt[(stage * 3) + 1],
                source: stagesTxt[(stage * 3) + 2],
                randomSelection: true,
                number: stage + 1,
                icon: path.join(dir, "gfx", "stgicons", stagesTxt[(stage * 3) + 0] + ".png")
            });
        }
    } else {
        for (let stage: number = 0; stage < Math.floor(stagesTxt.length / 4); stage++) {
            stageList.add({
                name: stagesTxt[(stage * 4) + 0],
                menuName: stagesTxt[(stage * 4) + 1],
                source: stagesTxt[(stage * 4) + 2],
                series: stagesTxt[(stage * 4) + 3].toLowerCase(),
                randomSelection: true,
                number: stage + 1,
                icon: path.join(dir, "gfx", "stgicons", stagesTxt[(stage * 4) + 0] + ".png")
            });
        }
    }
    const lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "stage_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    lockedTxt.forEach((locked: string) => {
        if (stageList.getByName(locked) == undefined) return;
        stageList.updateByName(locked, { randomSelection: false });
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
        if (!ignoreSeries && stage.series)
            wipString = wipString.replaceAll("<series>", stage.series);
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
        for (const match of stageFilesString.matchAll(exp)) {
            validFiles.push(match[0]);
            stageFiles.splice(stageFiles.indexOf(match[0]), 1);
        }
        stageFilesString = stageFiles.join("\n");
    });
    if (similarNames.length > 0) {
        const stageList: StageList = readStageList(dir);
        similarNames.forEach((name: string) => {
            const validFilesString: string = validFiles.join("\n");
            const stage: Stage | undefined = stageList.getByName(name);
            if (!stage) throw new Error("Stage not found: \"" + name + "\"");
            getStageRegExps(stage, ignoreSeries)
                .forEach((exp: RegExp) => {
                    for (const match of validFilesString.matchAll(exp)) {
                        validFiles.splice(validFiles.indexOf(match[0]), 1);
                    }
                });
        });
    }
    return validFiles;
}

export function readStageInfoPath(targetInfo: string): StageInfo | null {
    const infoTxt: string[] | StageInfo = general.readJSON(targetInfo);
    if (Array.isArray(infoTxt)) {
        return {
            menuName: infoTxt[0],
            source: infoTxt[1],
            series: infoTxt[2]
        };
    }
    if (
        !infoTxt.menuName ||
        !infoTxt.source ||
        !infoTxt.series
    ) {
        return null;
    }
    return infoTxt as StageInfo;
}

export function writeStageInfo(stage: Stage, destination: string): void {
    fs.ensureFileSync(path.join(destination, stage.name + ".json"));
    fs.writeFileSync(
        path.join(destination, stage.name + ".json"),
        JSON.stringify({
            menuName: stage.menuName,
            source: stage.source,
            series: stage.series
        }, null, 2)
    );
    return;
}

export async function selectAndInstallStages(
    filterInstallation: boolean,
    updateStages: boolean,
    fromArchive: boolean = false,
    dir: string = global.gameDir
): Promise<void> {
    const targetDirs: string[] = (
        fromArchive ? await general.selectPathsArch() : await general.selectPathsDir()
    );
    if (targetDirs.length == 0) return;
    targetDirs.forEach((target: string) => {
        installStages(target, filterInstallation, updateStages, "filesystem", dir);
    });
    return;
}

export async function installDownloadedStages(targetDir: string): Promise<void> {
    installStages(targetDir, true, global.appData.config.updateStages, "GameBanana");
}

export function installStages(
    targetDir: string,
    filterInstallation: boolean,
    updateStages: boolean,
    location: string,
    dir: string = global.gameDir
): void {
    try {
        const correctedTarget: string = correctStageDir(targetDir);
        if (path.relative(correctedTarget, dir) == "") throw new Error(
            "Cannot install stage from the directory that they are being installed to."
        );
        const foundStages: FoundStage[] = findStages(correctedTarget);
        if (foundStages.length == 0)
            throw new Error("No valid stages found in directory: '" + targetDir + "'.");
        if (foundStages.length == 1) {
            queStageInstallation(
                correctedTarget,
                foundStages[0],
                filterInstallation,
                updateStages,
                location,
                dir
            );
        } else {
            const id: string = "stageInstallation_" + Date.now();
            general.addOperation({
                id: id,
                title: "Stage Installation",
                body: "Selecting stages to install from '" + correctedTarget + "'.",
                state: OpState.QUEUED,
                icon: "playlist_add",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.USER_SLOW],
                call: {
                    name: "stageInstallationOp",
                    args: [correctedTarget, id]
                }
            });
        }
    } catch (err: any) {
        general.addOperation({
            title: "Stage Installation",
            body: (err as Error).message,
            state: OpState.ERROR,
            icon: "folder_shared",
            animation: Math.floor(Math.random() * 3),
            dependencies: []
        });
    }
    return;
}

export function correctStageDir(targetDir: string): string {
    let correctedDir: string = targetDir;
    const modFiles: string[] = general.getAllFiles(correctedDir)
        .map((file: string) => file.replace(correctedDir, ""));
    for (let file of modFiles) {
        file = path.join(file).split(path.sep).join(path.posix.sep);
        const fileDir: string = path.posix.parse(file).dir + "/";
        if (fileDir.includes("/stage/") && !file.includes("/music/")) {
            let topDir: string = file.split("/").shift() ??
                error("Top dir not found for file: '" + file + "'");
            while (topDir != "stage") {
                correctedDir = path.join(correctedDir, topDir);
                file = file.replace(topDir + "/", "");
                topDir = file.split("/").shift() ??
                    error("Top dir not found for file: '" + file + "'");
            }
            break;
        }
    }
    if (!fs.readdirSync(correctedDir).includes("stage")) {
        throw new Error("No 'stage' subdirectory found in directory: '" + targetDir + "'.");
    }
    return correctedDir;
}

export function findStages(targetDir: string): FoundStage[] {
    // readStageList should probably handle what to do if the directory is,
    // invalid better, but there isn't much point fixing it now.
    let installedStages: FoundStage[] | null = null;
    try {
        installedStages = readStages(targetDir).map((stage: Stage) => ({
            name: stage.name,
            info: {
                menuName: stage.menuName,
                source: stage.source,
                series: stage.series
            },
            icon: stage.icon
        }));
    } catch (e: any) {
        // Do nothing; installedStages is already null
    }

    const stageNames: string[] = Array.from(new Set(
        fs.readdirSync(
            path.join(targetDir, "stage")
        ).filter(
            (file: string) => file.endsWith(".bin") || !file.includes(".")
        ).map(
            (stage: string) => stage.replace(/\.[^/\\]+$/, "")
        )
    ));
    const foundStages: FoundStage[] = stageNames.map((stageName: string) => {
        const found: FoundStage = {
            name: stageName,
            icon: path.join(targetDir, "gfx", "stgicons", stageName + ".png")
        };
        if (fs.existsSync(path.join(targetDir, "info.json"))) {
            found.info = readStageInfoPath(path.join(targetDir, "info.json")) ?? undefined;
        } else if (fs.existsSync(path.join(targetDir, "data", "sinfo", stageName + ".json"))) {
            found.info =
                readStageInfoPath(path.join(targetDir, "data", "sinfo", stageName + ".json")) ??
                undefined;
        }
        return found;
    }) as FoundStage[];

    const allStagesByName: { [name: string]: FoundStage } = {};
    foundStages.forEach((stage: FoundStage) =>
        allStagesByName[stage.name.toLowerCase()] = stage
    );
    if (installedStages) installedStages.forEach((stage: FoundStage) =>
        allStagesByName[stage.name.toLowerCase()] = stage
    );

    return Object.values(allStagesByName);
}

export function queStageInstallation(
    targetDir: string,
    foundStage: FoundStage,
    filterInstallation: boolean,
    updateStages: boolean,
    location: string,
    dir: string = global.gameDir
): void {
    const id: string = foundStage.name + "_" + Date.now();
    general.addOperation({
        id: id,
        title: "Stage Installation",
        body: "Installing a stage from " + location + ".",
        state: OpState.QUEUED,
        icon: "folder_shared",
        animation: Math.floor(Math.random() * 3),
        dependencies: [OpDep.STAGES, OpDep.USER],
        call: {
            name: "installStageOp",
            args: [
                targetDir, foundStage, filterInstallation, updateStages, id, location, dir
            ]
        }
    });
}

export async function installStageOp(
    targetDir: string,
    foundStage: FoundStage,
    filterInstallation: boolean,
    updateStages: boolean,
    id: string,
    location: string,
    dir: string = global.gameDir
): Promise<void> {
    const stage: Stage | null = await installStage(
        targetDir, foundStage, filterInstallation, updateStages, dir
    );
    if (stage == null) {
        general.updateOperation({
            id: id,
            state: OpState.CANCELED,
        });
    } else {
        general.updateOperation({
            id: id,
            body: "Installed stage: '" + stage.name + "' from " + location + ".",
            image: "img://" + stage.icon,
            state: OpState.FINISHED,
        });
        general.updateStagePages();
    }
}

export async function stageInstallationOp(targetDir: string, id: string): Promise<void> {
    await customDialogs.stageInstallation(targetDir);
    general.updateOperation({
        id: id,
        body: "Selected stages to install from '" + targetDir + "'.",
        state: OpState.FINISHED,
    });
}

export async function installStage(
    targetDir: string,
    foundStage: FoundStage,
    filterInstallation: boolean = true,
    updateStages: boolean = false,
    dir: string = global.gameDir
): Promise<Stage | null> {
    const stageList: StageList = readStageList(dir);
    if (!updateStages && stageList.getByName(foundStage.name) != undefined) {
        throw new Error("Stage already installed, updates disabled.");
    }

    const wipStage: WipStage = {
        name: foundStage.name,
        menuName: foundStage.info?.menuName,
        source: foundStage.info?.source,
        series: foundStage.info?.series,
        randomSelection: true,
        number: stageList.getNextNumber(),
        icon: path.join(dir, "gfx", "stgicons", foundStage + ".png")
    };
    
    const stage: Stage | null = await getMissingStageInfo(wipStage, targetDir, stageList);
    if (stage == null) return null;

    if (updateStages) {
        if (
            (
                fs.existsSync(path.join(targetDir, "stage", foundStage.name + ".bin")) ||
                fs.existsSync(path.join(targetDir, "stage", foundStage.name))
            ) &&
            (
                fs.existsSync(path.join(dir, "stage", foundStage.name + ".bin")) ||
                fs.existsSync(path.join(dir, "stage", foundStage.name))
            )
        ) {
            console.log("Removing bin & folder for replacement.");
            fs.removeSync(path.join(dir, "stage", foundStage.name + ".bin"));
            fs.removeSync(path.join(dir, "stage", foundStage.name));
        }
    }

    const toResolve: Promise<void>[] = [];
    if (filterInstallation) {
        getStageFiles(stage, false, targetDir).forEach((file: string) => {
            const filePath: string = path.join(targetDir, file);
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
        toResolve.push(fs.copy(targetDir, dir, { overwrite: true }));
    }

    const toUpdate: Stage | undefined = stageList.getByName(foundStage.name);
    if (toUpdate == undefined) {
        stageList.add(stage);
    } else {
        stage.number = toUpdate.number;
        stageList.setByName(foundStage.name, stage);
    }
    toResolve.push(writeStages(stageList.toArray(), dir));
    await Promise.allSettled(toResolve);
    
    fs.removeSync(path.join(dir, "info.json"));
    writeStageInfo(stage, path.join(dir, "data", "sinfo"));
    return stage;
}

export async function getMissingStageInfo(
    stage: WipStage,
    targetDir: string,
    installedStages?: StageList
): Promise<Stage | null> {
    if (stage.menuName && stage.source && stage.series) return stage as Stage;

    let prefillInfo: StageInfo | undefined;
    if (installedStages) {
        const toUpdate: Stage | undefined = installedStages.getByName(stage.name);
        if (toUpdate) {
            prefillInfo = {
                menuName: toUpdate.menuName,
                source: toUpdate.source,
                series: toUpdate.series
            };
        }
    }

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
        general.openDir(targetDir);
    }

    while (!stage.menuName) {
        stage.menuName = await customDialogs.prompt({
            id: "inputStageMenuName",
            title: "CMC Mod Manager | Stage Installation",
            body: "Please enter the stage's 'menu name'. (The name that will be displayed " +
                "on the stage selection screen.)",
            placeholder: "Stage's Menu Name",
            defaultValue: prefillInfo?.menuName
        });
        if (stage.menuName == undefined) return null;
    }

    while (!stage.source) {
        stage.source = await customDialogs.prompt({
            id: "inputStageSource",
            title: "CMC Mod Manager | Stage Installation",
            body: "Please enter the stage's 'source'. (The name of the source content that " +
                "the stage is originally from, such as the title of the game.)",
            placeholder: "Stage's Source",
            defaultValue: prefillInfo?.source
        });
        if (stage.source == undefined) return null;
    }

    while (!stage.series) {
        stage.series = await customDialogs.prompt({
            id: "inputStageSeries",
            title: "CMC Mod Manager | Stage Installation",
            body: "Please enter the stage's 'series'. (This name will be used to select the " +
                "icon to use on the stage selection screen. This value is usually short and " +
                "in all lowercase letters.)",
            placeholder: "Stage's Series",
            defaultValue: prefillInfo?.series
        });
        if (stage.series == undefined) return null;
    }
    return stage as Stage;
}

export async function extractStage(extract: string, dir: string = global.gameDir): Promise<string> {
    const toResolve: Promise<void>[] = [];
    const stageList: StageList = readStageList(dir);
    const similarNames: string[] = [];
    const stage: Stage | undefined = stageList.getByName(extract);
    if (!stage) throw new Error("Stage not found: \"" + extract + "\"");
    const extractDir: string = path.join(dir, "0extracted", extract);
    stageList.toArray().forEach((stage: Stage) => {
        if (stage.name.includes(extract) && stage.name != extract) {
            similarNames.push(stage.name);
        }
    });
    
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
    await Promise.allSettled(toResolve);
    writeStageInfo(stage, path.join(extractDir, "data", "sinfo"));
    return extractDir;
}

export async function removeStage(remove: string, dir: string = global.gameDir): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const stageList: StageList = readStageList(dir);
    const stage: Stage | undefined = stageList.getByName(remove);
    if (!stage) throw new Error("Stage not found: \"" + remove + "\"");
    const similarNames: string[] = [];
    stageList.toArray().forEach((stage: Stage) => {
        if (stage.name.startsWith(remove) && stage.name != remove) {
            similarNames.push(stage.name);
        }
    });

    getStageFiles(stage, true, dir, similarNames).forEach((file: string) => {
        const filePath: string = path.join(dir, file);
        toResolve.push(
            fs.remove(filePath)
        );
    });
    
    stageList.removeByName(remove);
    toResolve.push(writeStages(stageList.toArray(), dir));
    toResolve.push(removeStageSss(stage, dir));
    toResolve.push(writeStageRandom(stage.name, true, dir));
    await Promise.allSettled(toResolve);
    return;
}

export function readSssPages(dir: string = global.gameDir): SssPage[] {
    const pages: SssPage[] = [];
    // Currently SSS Pages are a fixed size - 10x6. Although it is possible that his may change in
    // the future, if any changes would be made to the stage format, it would likely become more
    // consistent with the current character format and therefore need major adjustments anyway
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
    console.log(Date.now());
    for (const stage of stagesToRemove) {
        console.log(stage);
        await removeStage(stage.name, dir);
    }
    console.log(Date.now());
    return;
}

export async function addSssPage(pageName: string, dir: string = global.gameDir): Promise<SssPage> {
    pageName = pageName.replace(/'|"/g, "");
    const pages: SssPage[] = readSssPages(dir);
    const newPage: SssPage = {
        name: pageName,
        pageNumber: pages.length,
        data: BLANK_SSS_PAGE_DATA
    };
    pages.push(newPage);
    writeSssPages(pages);
    return newPage;
}

export async function removeSssPage(page: SssPage, dir: string = global.gameDir): Promise<void> {
    const pages: SssPage[] = readSssPages(dir).filter((i: SssPage) =>
        !(i.name == page.name && i.pageNumber == page.pageNumber)
    );
    await writeSssPages(pages, dir);
    return;
}

export async function reorderSssPage(
    from: number,
    to: number,
    dir: string = global.gameDir
): Promise<void> {
    if (to == from) return;
    const pages: SssPage[] = readSssPages(dir);
    pages.sort((a: SssPage, b: SssPage) =>
        (a.pageNumber > b.pageNumber ? 1 : -1)
    );
    // I don't believe that the pages could ever be unordered, however I previously sorted them in
    // the write function so I'll do it here too.
    const target: SssPage = pages[from];
    pages.splice(from, 1);
    if (to > from) to--;
    pages.splice(to, 0, target);
    await writeSssPages(
        pages.map((page: SssPage, index: number) => {
            page.pageNumber = index;
            return page;
        }),
        dir
    );
    return;
}

export async function renameSssPage(
    index: number,
    pageName: string,
    dir: string = global.gameDir
): Promise<SssPage> {
    const pages: SssPage[] = readSssPages(dir);
    pages[index].name = pageName;
    await writeSssPages(pages, dir);
    return pages[index];
}