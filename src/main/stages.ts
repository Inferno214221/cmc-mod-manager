import fs from "fs-extra";
import path from "path";
import { OpDep, OpState, StageList } from "../global/global";
import { translations } from "../global/translations";
const { error, message }: ReturnType<typeof translations> = translations(global.language);

import * as general from "./general";
import * as customDialogs from "./custom-dialogs";

import _STAGE_FILES from "../assets/stage-files.json";
const STAGE_FILES: StringNode[] = _STAGE_FILES;

const BLANK_SSS_PAGE_DATA: SssData = [
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000" ],
    [ "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "9999" ],
];

export async function readStages(dir: string = global.gameDir): Promise<Stage[]> {
    return (await readStageList(dir)).toArray();
}

export async function readStageList(dir: string = global.gameDir): Promise<StageList> {
    const stageList: StageList = new StageList();
    const stagesTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "stages.txt"),
        "ascii"
    )).trim().split(/\r?\n/);
    const num: number = parseInt(stagesTxt.shift() ?? "");
    const isV7: boolean = (stagesTxt.length / 3) == num;

    // const isV7: boolean = (stagesTxt.map((line: string, index: number) => {
    //     const wrappedIndex: number = (index + 1) % 4;
    //     if (wrappedIndex <= 1) {
    //         return [/^[^ ]+$/.test(line), line];
    //     } else {
    //         return [true];
    //     }
    // }).filter((success: any) => !success[0]).length != 0);

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
    const lockedTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "stage_lock.txt"),
        "ascii"
    )).split(/\r?\n/);
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
    await fs.writeFile(
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
    let lockedTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "stage_lock.txt"),
        "ascii"
    )).split(/\r?\n/);
    lockedTxt.shift();
    if (randomSelection) {
        lockedTxt = lockedTxt.filter((locked: string) => locked != stage);
    } else {
        lockedTxt.push(stage);
    }
    let output: string = lockedTxt.length + "\r\n";
    output += lockedTxt.join("\r\n");
    await fs.writeFile(
        path.join(dir, "data", "stage_lock.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

export function createStageRegExpNodes(
    nodes: StringNode[] | undefined,
    stage: Stage,
    ignoreSeries: boolean = false
): RegExpNode[] | undefined {
    if (!nodes) return undefined;
    return nodes.map((node: StringNode) => {
        let wipString: string = node.name.replaceAll("<stage>", stage.name);
        if (!ignoreSeries && stage.series)
            wipString = wipString.replaceAll("<series>", stage.series);
        wipString = "^" + general.escapeRegex(wipString);
        wipString += "$";
        wipString = wipString.replaceAll("<anything>", "[^]+");
        return {
            pattern: new RegExp(wipString, "i"),
            nonExhaustive: node.nonExhaustive,
            contents: createStageRegExpNodes(
                node.contents,
                stage,
                ignoreSeries
            )
        };
    }).filter((node: RegExpNode | null) => node != null) as RegExpNode[];
}

export async function getStageFiles(
    stage: Stage,
    ignoreSeries: boolean,
    dir: string = global.gameDir
): Promise<string[]> {
    const matchNodes: RegExpNode[] | undefined = createStageRegExpNodes(
        STAGE_FILES,
        stage,
        ignoreSeries
    );
    if (!matchNodes) return [];
    return await general.matchContents(matchNodes, dir);
    // Stages currently contain only exhaustive nodes
}

export async function readStageInfoPath(targetInfo: string): Promise<StageInfo | null> {
    const infoTxt: string[] | StageInfo = await general.readJSON(targetInfo);
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

export async function writeStageInfo(stage: Stage, destination: string): Promise<void> {
    await fs.ensureFile(path.join(destination, stage.name + ".json"));
    await general.writeJSON(
        path.join(destination, stage.name + ".json"),
        {
            menuName: stage.menuName,
            source: stage.source,
            series: stage.series
        }
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

export async function installStages(
    targetDir: string,
    filterInstallation: boolean,
    updateStages: boolean,
    location: string,
    dir: string = global.gameDir
): Promise<void> {
    try {
        const correctedTarget: string = await correctStageDir(targetDir);
        if (path.relative(correctedTarget, dir) == "") error("stageInstallTargetSelf");
        const foundStages: FoundStage[] = await findStages(correctedTarget);
        if (foundStages.length == 0) error("noValidStagesFound", targetDir);
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
                title: message("operation.stage.bulkInstallation.started.title"),
                body: message("operation.stage.bulkInstallation.started.body", correctedTarget),
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
            title: message("operation.stage.bulkInstallation.started.body"),
            body: (err as Error).message,
            state: OpState.ERROR,
            icon: "folder_shared",
            animation: Math.floor(Math.random() * 3),
            dependencies: []
        });
    }
    return;
}

export async function correctStageDir(targetDir: string): Promise<string> {
    let correctedDir: string = targetDir;
    const modFiles: string[] = (await general.getAllFiles(correctedDir))
        .map((file: string) => file.replace(correctedDir, "")).reverse(); // Puts 0extracted last
    for (let file of modFiles) {
        file = path.join(file).split(path.sep).join(path.posix.sep);
        const fileDir: string = path.posix.parse(file).dir + "/";
        if (fileDir.includes("/stage/") && !file.includes("/music")) {
            let topDir: string = file.split("/").shift() ?? error("noTopDir", file);
            while (topDir != "stage") {
                correctedDir = path.join(correctedDir, topDir);
                file = file.replace(topDir + "/", "");
                topDir = file.split("/").shift() ?? error("noTopDir", file);
            }
            break;
        }
    }
    if (!(await fs.readdir(correctedDir)).includes("stage")) error("noStageSubdir", targetDir);
    return correctedDir;
}

export async function findStages(targetDir: string): Promise<FoundStage[]> {
    // readStageList should probably handle what to do if the directory is,
    // invalid better, but there isn't much point fixing it now.
    let installedStages: FoundStage[] | null = null;
    try {
        installedStages = (await readStages(targetDir)).map((stage: Stage) => ({
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
        (await fs.readdir(
            path.join(targetDir, "stage")
        )).filter(
            (file: string) => file.endsWith(".bin") || !file.includes(".")
        ).map(
            (stage: string) => stage.replace(/\.[^/\\]+$/, "")
        )
    ));
    const foundStages: FoundStage[] =
        (await Promise.all(stageNames.map(async (stageName: string) => {
            const found: FoundStage = {
                name: stageName,
                icon: path.join(targetDir, "gfx", "stgicons", stageName + ".png")
            };
            if (await fs.exists(path.join(targetDir, "info.json"))) {
                found.info = await readStageInfoPath(
                    path.join(targetDir, "info.json")
                ) ?? undefined;
            } else if (await fs.exists(
                path.join(targetDir, "data", "sinfo", stageName + ".json")
            )) {
                found.info = await readStageInfoPath(
                    path.join(targetDir, "data", "sinfo", stageName + ".json")
                ) ?? undefined;
            }
            return found;
        }))) as FoundStage[];

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
        title: message("operation.stage.installation.started.title"),
        body: message("operation.stage.installation.started.body", location),
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
            body: message("operation.stage.installation.finished.body", stage.name, location),
            image: "img://" + stage.icon,
            state: OpState.FINISHED,
        });
        general.updateStagePages();
    }
}

export async function stageInstallationOp(targetDir: string, id: string): Promise<void> {
    const dialog: customDialogs.StageInstallDialog =
        new customDialogs.StageInstallDialog(targetDir);
    const show: Promise<null | undefined> = dialog.show();
    general.updateOperation({
        id: id,
        action: {
            icon: "close",
            tooltip: message("tooltip.closeWindow"),
            call: {
                name: "closeDialog",
                args: [dialog.window.id]
            }
        }
    });
    await show;
    general.updateOperation({
        id: id,
        body: message("operation.stage.bulkInstallation.finished.body", targetDir),
        state: OpState.FINISHED,
        action: undefined
    });
}

export async function installStage(
    targetDir: string,
    foundStage: FoundStage,
    filterInstallation: boolean = true,
    updateStages: boolean = false,
    dir: string = global.gameDir
): Promise<Stage | null> {
    const stageList: StageList = await readStageList(dir);
    if (!updateStages && stageList.getByName(foundStage.name) != undefined) error("noUpdateStage");

    const wipStage: WipStage = {
        name: foundStage.name,
        menuName: foundStage.info?.menuName,
        source: foundStage.info?.source,
        series: foundStage.info?.series,
        randomSelection: true,
        number: stageList.getNextNumber(),
        icon: path.join(dir, "gfx", "stgicons", foundStage.name + ".png")
    };
    
    const stage: Stage | null = await getMissingStageInfo(wipStage, targetDir, stageList);
    if (stage == null) return null;

    if (updateStages) {
        if (
            (
                await fs.exists(path.join(targetDir, "stage", foundStage.name + ".bin")) ||
                await fs.exists(path.join(targetDir, "stage", foundStage.name))
            ) &&
            (
                await fs.exists(path.join(dir, "stage", foundStage.name + ".bin")) ||
                await fs.exists(path.join(dir, "stage", foundStage.name))
            )
        ) {
            console.log("Removing bin & folder for replacement.");
            await fs.remove(path.join(dir, "stage", foundStage.name + ".bin"));
            await fs.remove(path.join(dir, "stage", foundStage.name));
        }
    }

    const toResolve: Promise<void>[] = [];
    if (filterInstallation) {
        toResolve.push(...(await getStageFiles(stage, false, targetDir))
            .map(async (file: string) => {
                const targetPath: string = path.join(dir, path.relative(targetDir, file));
                if (!updateStages && await fs.exists(targetPath)) return;
                await fs.ensureDir(path.parse(targetPath).dir);
                await fs.copy(
                    file,
                    targetPath,
                    { overwrite: !file.startsWith("gfx/seriesicon/") }
                );
            })
        );
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
    
    await fs.remove(path.join(dir, "info.json"));
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

    if (!(await customDialogs.confirm("beginStageInput"))) {
        return null;
    }

    if (await customDialogs.confirm("openStageDir")) {
        general.openDir(targetDir);
    }

    while (!stage.menuName) {
        stage.menuName = await customDialogs.prompt("stageMenuName", {
            defaultValue: prefillInfo?.menuName
        });
        if (stage.menuName == undefined) return null;
    }

    while (!stage.source) {
        stage.source = await customDialogs.prompt("stageSource", {
            defaultValue: prefillInfo?.source
        });
        if (stage.source == undefined) return null;
    }

    while (!stage.series) {
        stage.series = await customDialogs.prompt("stageSeries", {
            defaultValue: prefillInfo?.series
        });
        if (stage.series == undefined) return null;
    }
    return stage as Stage;
}

export async function extractStage(extract: string, dir: string = global.gameDir): Promise<string> {
    const stageList: StageList = await readStageList(dir);
    const stage: Stage | undefined = stageList.getByName(extract);
    if (!stage) error("stageNotFound", extract);
    const extractDir: string = path.join(dir, "0extracted", extract);
    
    await Promise.allSettled((await getStageFiles(stage!, false, dir))
        .map(async (file: string) => {
            const targetPath: string = path.join(extractDir, path.relative(dir, file));
            await fs.ensureDir(path.parse(targetPath).dir);
            await fs.copy(
                file,
                targetPath,
                { overwrite: true }
            );
        })
    );
    writeStageInfo(stage!, path.join(extractDir, "data", "sinfo"));
    return extractDir;
}

export async function removeStage(remove: string, dir: string = global.gameDir): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const stageList: StageList = await readStageList(dir);
    const stage: Stage | undefined = stageList.getByName(remove);
    if (!stage) error("stageNotFound", remove);

    (await getStageFiles(stage!, true, dir)).forEach((file: string) => {
        toResolve.push(
            fs.remove(file)
        );
    });
    
    stageList.removeByName(remove);
    toResolve.push(writeStages(stageList.toArray(), dir));
    toResolve.push(removeStageSss(stage!, dir));
    toResolve.push(writeStageRandom(stage!.name, true, dir));
    await Promise.allSettled(toResolve);
    return;
}

export async function readSssPages(dir: string = global.gameDir): Promise<SssPage[]> {
    const pages: SssPage[] = [];
    // Currently SSS Pages are a fixed size - 10x6. Although it is possible that his may change in
    // the future, if any changes would be made to the stage format, it would likely become more
    // consistent with the current character format and therefore need major adjustments anyway
    const sssTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "sss.txt"),
        "ascii"
    )).split(/\r?\n/);
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
                fixSssData(page.data).map((row: string[]) => row.join(" ")).join("\r\n")
            ].join("\r\n")
        ).join("\r\n")
    ].join("\r\n");
    await fs.writeFile(
        path.join(dir, "data", "sss.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

export function fixSssData(data: SssData): SssData {
    // SSS Pages are a constant size of 10 by 6
    const fixedData: SssData = data.map((row: string[]) => {
        while (row.length < 10) {
            row.push("0000");
        }
        while (row.length > 10) {
            row.pop();
        }
        return row;
    });
    while (fixedData.length < 6) {
        fixedData.push(BLANK_SSS_PAGE_DATA[0]);
    }
    while (fixedData.length > 6) {
        fixedData.pop();
    }
    return fixedData;
}

export async function removeStageSss(
    stage: Stage,
    dir: string = global.gameDir
): Promise<void> {
    const sssPages: SssPage[] = await readSssPages(dir);
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
    const stagesToRemove: Stage[] = (await readStages(dir))
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
    const pages: SssPage[] = await readSssPages(dir);
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
    const pages: SssPage[] = (await readSssPages(dir)).filter((i: SssPage) =>
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
    const pages: SssPage[] = await readSssPages(dir);
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
    const pages: SssPage[] = await readSssPages(dir);
    pages[index].name = pageName;
    await writeSssPages(pages, dir);
    return pages[index];
}