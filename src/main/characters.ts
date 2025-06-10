import fs from "fs-extra";
import path from "path";
import ini from "ini";
import { CharacterList, OpDep, OpState } from "../global/global";
import { translations } from "../global/translations";
const { error, message }: ReturnType<typeof translations> = translations(global.language);

import * as general from "./general";
import * as customDialogs from "./custom-dialogs";

import _V7_BUILTINS from "../assets/v7.json";
const V7_BUILTINS: { [name: string]: { displayName: string, series: string } } = _V7_BUILTINS;

import _CHARACTER_FILES from "../assets/character-files.json";
const CHARACTER_FILES: StringNode[] = _CHARACTER_FILES;
import _POSSIBLE_CONFLICTS from "../assets/character-files-possible-conflicts.json";
const CHARACTER_FILES_POSSIBLE_CONFLICTS: StringNode[] = _POSSIBLE_CONFLICTS;

const BLANK_CSS_PAGE_DATA: string = "\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 9999 0000 0000 0000 ";

export async function readCharacters(dir: string = global.gameDir): Promise<Character[]> {
    return (await readCharacterList(dir)).toArray();
}

export async function readCharacterList(dir: string = global.gameDir): Promise<CharacterList> {
    const alts: Alt[] = await readAlts(dir);
    const characterList: CharacterList = new CharacterList();
    const charactersTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "fighters.txt"),
        "ascii"
    )).trim().split(/\r?\n/);
    charactersTxt.shift(); // Drop the number
    for (const index in charactersTxt) {
        const character: string = charactersTxt[index];
        if (await fs.exists(path.join(dir, "data", "dats", character + ".dat"))) {
            const characterDat: CharacterDat | null = await readCharacterDat(character, dir);
            characterList.add({
                name: character,
                menuName: characterDat?.menuName ?? character,
                series: characterDat?.series ?? "",
                randomSelection: true, // Assume true and then iterate through false list
                number: parseInt(index) + 1,
                alts: alts.filter((alt: Alt) => alt.base == character),
                mug: path.join(dir, "gfx", "mugs", character + ".png")
            });
        }
    }
    const lockedTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "fighter_lock.txt"),
        "ascii"
    )).split(/\r?\n/);
    lockedTxt.shift();
    lockedTxt.forEach((locked: string) => {
        if (characterList.getByName(locked) == undefined) return;
        characterList.updateByName(locked, { randomSelection: false });
    });
    return characterList;
}

export async function writeCharacters(
    characters: Character[],
    dir: string = global.gameDir
): Promise<void> {
    characters.sort((a: Character, b: Character) =>
        (a.number > b.number ? 1 : -1)
    );
    const output: string = [
        characters.length,
        characters.map((character: Character) => character.name).join("\r\n")
    ].join("\r\n");
    await fs.writeFile(
        path.join(dir, "data", "fighters.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

export async function writeCharacterRandom(
    character: string,
    randomSelection: boolean,
    dir: string = global.gameDir
): Promise<void> {
    let lockedTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "fighter_lock.txt"),
        "ascii"
    )).split(/\r?\n/);
    lockedTxt.shift();
    if (randomSelection) {
        lockedTxt = lockedTxt.filter((locked: string) => locked != character);
    } else {
        lockedTxt.push(character);
    }
    let output: string = lockedTxt.length + "\r\n";
    output += lockedTxt.join("\r\n");
    await fs.writeFile(
        path.join(dir, "data", "fighter_lock.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

export async function readAlts(dir: string = global.gameDir): Promise<Alt[]> {
    const altsTxt: string[] = (await fs.readFile(
        path.join(dir, "data", "alts.txt"),
        "ascii"
    )).split(/\r?\n/);
    altsTxt.shift(); // Drop the number
    const alts: Alt[] = [];
    for (let alt: number = 0; alt < Math.floor(altsTxt.length / 5); alt++) {
        alts.push({
            base: altsTxt[(alt * 5) + 0],
            alt: altsTxt[(alt * 5) + 2],
            number: parseInt(altsTxt[(alt * 5) + 1]),
            menuName: altsTxt[(alt * 5) + 3],
            battleName: altsTxt[(alt * 5) + 4],
            mug: path.join(dir, "gfx", "mugs", altsTxt[(alt * 5) + 2] + ".png")
        });
    }
    return alts;
}

export async function writeAlts(alts: Alt[], dir: string = global.gameDir): Promise<void> {
    const altsByBase: { [key: string]: Alt[] } = {};
    alts.forEach((alt: Alt) => {
        altsByBase[alt.base] = altsByBase[alt.base] ?? [];
        altsByBase[alt.base].push(alt);
    });
    alts = [];
    // Sort alts by base and correct their numbers
    Object.keys(altsByBase).forEach((key: string) => {
        altsByBase[key] = altsByBase[key].sort((a: Alt, b: Alt) =>
            (a.number > b.number ? 1 : -1)
        ).map((alt: Alt, index: number) => {
            alt.number = 2 + index; // Numbers start at 2
            return alt;
        });
        alts.push(...altsByBase[key]);
    });

    const output: string = [
        alts.length,
        alts.map((alt: Alt) =>
            [
                alt.base,
                alt.number,
                alt.alt,
                alt.menuName,
                alt.battleName
            ].join("\r\n")
        ).join("\r\n")
    ].join("\r\n");
    await fs.writeFile(
        path.join(dir, "data", "alts.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

export async function addAlt(
    base: Character,
    newAlt: Character,
    dir: string = global.gameDir
): Promise<void> {
    if (newAlt.alts.length != 0) error("noRecursiveAlts");

    const toResolve: Promise<void>[] = [];
    const alts: Alt[] = await readAlts(dir);
    let altNumber: number = 1;
    const sameBase: Alt[] = alts.filter((alt: Alt) => alt.base == base.name);
    if (sameBase.length > 6) error("maxAltsReached");

    sameBase.forEach((alt: Alt) => {
        if (alt.number > altNumber) altNumber = alt.number;
    });
    const newAltDat: CharacterDat | null = await readCharacterDat(newAlt.name, dir);
    alts.push({
        base: base.name,
        alt: newAlt.name,
        number: altNumber + 1,
        menuName: newAlt.menuName,
        battleName: newAltDat?.battleName ?? newAlt.menuName,
        mug: newAlt.mug
    });
    await writeAlts(alts, dir);
    if (!global.appData.config.altsAsCharacters && !isCharacterOnCSS(newAlt, dir)) {
        const characterList: CharacterList = await readCharacterList(dir);
        characterList.removeByName(newAlt.name);
        toResolve.push(writeCharacters(characterList.toArray(), dir));
        toResolve.push(removeCharacterCss(newAlt, dir));
        toResolve.push(writeCharacterRandom(newAlt.name, true, dir));
    }
    await Promise.allSettled(toResolve);
    return;
}

export async function removeAlt(
    alt: Alt,
    ensureAccessible: boolean = true,
    dir: string = global.gameDir
): Promise<void> {
    const alts: Alt[] = (await readAlts(dir)).filter((i: Alt) => !(
        i.base == alt.base &&
        i.alt == alt.alt &&
        i.number == alt.number
    )).map((i: Alt) => {
        if (i.base == alt.base && i.number > alt.number) {
            i.number--;
        }
        return i;
    });
    await writeAlts(alts, dir);
    if (ensureAccessible) {
        await ensureAltIsCharacter(alt, dir);
    }
    return;
}

export async function isCharacterOnCSS(
    character: Character,
    dir: string = global.gameDir
): Promise<boolean> {
    const cssPages: CssPage[] = await readCssPages(dir);
    for (const page of cssPages) {
        const cssData: CssData = await readCssData(page);
        for (const row of cssData) {
            if (row.includes(("0000" + character.number).slice(-4))) {
                return true;
            }
        }
    }
    return false;
}

export async function ensureAltIsCharacter(alt: Alt, dir: string = global.gameDir): Promise<void> {
    const characterList: CharacterList = await readCharacterList(dir);
    if (characterList.getByName(alt.alt) != undefined) {
        return;
    }

    const baseCharacter: Character | undefined = characterList.getByName(alt.base);
    if (!baseCharacter) error("characterNotFound", alt.base);

    // Adding a partial Character removes the need to read the character's dat, before entirely
    // ignoring it.
    // const characterDat: CharacterDat | null = readCharacterDat(alt.alt, dir);
    characterList.add({
        name: alt.alt,
        // menuName: characterDat?.menuName ?? alt.menuName,
        // series: characterDat?.series ?? baseCharacter.series,
        // randomSelection: true,
        number: characterList.getNextNumber(),
        // Alts for this character should also be calculated, by taking (alts: Alt[]) as an input
        // but because the info is immediately discarded, there is no point.
        // alts: [],
        // mug: path.join(dir, "gfx", "mugs", alt.alt + ".png")
    } as Character);

    await writeCharacters(characterList.toArray(), dir);
    return;
}

export async function ensureAltIsntCharacter(
    alt: Alt,
    dir: string = global.gameDir
): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const characterList: CharacterList = await readCharacterList(dir);
    const character: Character | undefined = characterList.getByName(alt.alt);
    if (!character) error("characterNotFound", alt.alt);
    if (await isCharacterOnCSS(character!, dir)) return;
    characterList.removeByName(alt.alt);
    toResolve.push(writeCharacters(characterList.toArray(), dir));
    toResolve.push(removeCharacterCss(character!, dir)); // Updates numbers
    toResolve.push(writeCharacterRandom(alt.alt, true, dir));
    await Promise.allSettled(toResolve);
    return;
}

export async function ensureAllAltsAreCharacters(
    areCharacters: boolean,
    dir: string = global.gameDir
): Promise<void> {
    const alts: Alt[] = await readAlts(dir);
    for (const alt of alts) {
        console.log(alt);
        if (areCharacters) {
            await ensureAltIsCharacter(alt, dir);
        } else {
            // If another character is an alt to this character, don't remove this from the
            // character list.
            if (alts.filter((a: Alt) => a.base == alt.alt).length != 0) continue;
            await ensureAltIsntCharacter(alt, dir);
        }
    }
    return;
}

export async function removeAllAlts(
    character: Character,
    dir: string = global.gameDir
): Promise<void> {
    // remove each of character's alts
    while (character.alts.length > 0) {
        await removeAlt(character.alts[0], true, dir);
        // all remaining alts experience a decrease in number within the files, so to ensure a match
        // this needs to be reflected in this functions array of alts.
        character.alts.shift();
        character.alts = character.alts.map((alt: Alt) => {
            alt.number--;
            return alt;
        });
    }
    // remove character from other's alts
    for (const alt of (await readAlts(dir)).filter(
        (alt: Alt) => alt.alt == character.name
    )) {
        await removeAlt(alt, false, dir);
    }
    return;
}

export async function readCharacterDat(
    character: string,
    dir: string = global.gameDir
): Promise<CharacterDat | null> {
    return readCharacterDatPath(path.join(dir, "data", "dats", character + ".dat"), character);
}

export async function readCharacterDatPath(
    datPath: string,
    character: string = path.parse(datPath).name
): Promise<CharacterDat | null> {
    if (!(await fs.exists(datPath))) return null;
    const characterDatTxt: string[] = (await fs.readFile(
        datPath,
        "ascii"
    )).split(/\r?\n/);
    const isVanilla: boolean = general.isNumber(characterDatTxt[3]);
    const isV7: boolean = isVanilla || general.isNumber(characterDatTxt[4]);

    let displayName: string | undefined;
    let menuName: string | undefined;
    let battleName: string | undefined;
    let series: string | undefined;
    
    if (!isVanilla) {
        displayName = characterDatTxt[0];
        menuName = characterDatTxt[1];
        battleName = characterDatTxt[2];
        series = (characterDatTxt[3] ?? error("incompleteDat", character)).toLowerCase();
    }

    const homeStages: string[] = [];
    const randomData: string[] = [];
    const palettes: CharacterPalette[] = [];
    if (isV7) {
        homeStages.push("battlefield");
        randomData.push(message("other.dat.formatUpdated"));
        const paletteCount: number =
            parseInt(characterDatTxt[isVanilla ? 1 : 5]);
        for (let palette: number = 1; palette <= paletteCount * 6; palette += 6) {
            const paletteLocation: number = isVanilla ? 1 : 5 + palette;
            palettes.push({
                name: characterDatTxt[paletteLocation + 0],
                values: characterDatTxt.slice(paletteLocation + 1, paletteLocation + 6)
            });
        }
    } else {
        const homeStageCount: number = parseInt(characterDatTxt[5]);
        for (let stage: number = 1; stage <= homeStageCount; stage++) {
            homeStages.push(characterDatTxt[5 + stage]);
        }

        const randomDataCount: number = parseInt(characterDatTxt[7 + homeStageCount]);
        for (let data: number = 1; data <= randomDataCount; data++) {
            randomData.push(characterDatTxt[7 + homeStageCount + data]);
        }

        const paletteCount: number =
            parseInt(characterDatTxt[9 + homeStageCount + randomDataCount]);
        for (let palette: number = 1; palette <= paletteCount * 6; palette += 6) {
            const paletteLocation: number = 10 + homeStageCount + randomDataCount + palette;
            palettes.push({
                name: characterDatTxt[paletteLocation + 0],
                values: characterDatTxt.slice(paletteLocation + 1, paletteLocation + 6)
            });
        }
    }
    const characterDat: CharacterDat = {
        name: character,
        displayName: displayName,
        menuName: menuName,
        battleName: battleName,
        series: series,
        homeStages: homeStages,
        randomData: randomData,
        palettes: palettes
    };
    return characterDat;
}

export async function writeCharacterDat(dat: CharacterDat, destination: string): Promise<void> {
    const output: string = [
        dat.displayName,
        dat.menuName,
        dat.battleName,
        dat.series,
        message("other.dat.homeStages"),
        dat.homeStages.length,
        ...dat.homeStages,
        message("other.dat.randomData"),
        dat.randomData.length,
        ...dat.randomData,
        message("other.dat.paletteNumber"),
        dat.palettes.length,
        message("other.dat.paletteData"),
        ...(dat.palettes.map((palette: CharacterPalette) => [
            palette.name,
            ...palette.values
        ].join("\r\n")))
    ].join("\r\n");
    console.log(output);
    await fs.ensureFile(path.join(destination, dat.name + ".dat"));
    await fs.writeFile(path.join(destination, dat.name + ".dat"), output, { encoding: "ascii" });
    return;
}

export async function selectAndInstallCharacters(
    filterInstallation: boolean,
    updateCharacters: boolean,
    fromArchive: boolean = false,
    dir: string = global.gameDir
): Promise<void> {
    const targetDirs: string[] = (
        fromArchive ? await general.selectPathsArch() : await general.selectPathsDir()
    );
    if (targetDirs.length == 0) return;
    targetDirs.forEach((target: string) => {
        installCharacters(target, filterInstallation, updateCharacters, "filesystem", dir);
    });
    return;
}

export async function installDownloadedCharacters(targetDir: string): Promise<void> {
    installCharacters(targetDir, true, global.appData.config.updateCharacters, "GameBanana");
}

export async function installCharacters(
    targetDir: string,
    filterInstallation: boolean,
    updateCharacters: boolean,
    location: string,
    dir: string = global.gameDir
): Promise<void> {
    try {
        const correctedTarget: string = await correctCharacterDir(targetDir);
        if (path.relative(correctedTarget, dir) == "") error("characterInstallTargetSelf");
        const foundCharacters: FoundCharacter[] = await findCharacters(correctedTarget);
        if (foundCharacters.length == 0) error("noValidCharactersFound", targetDir);
        if (foundCharacters.length == 1) {
            queCharacterInstallation(
                correctedTarget,
                foundCharacters[0],
                filterInstallation,
                updateCharacters,
                location,
                dir
            );
        } else {
            const id: string = "characterInstallation_" + Date.now();
            general.addOperation({
                id: id,
                title: message("operation.character.bulkInstallation.started.title"),
                body: message("operation.character.bulkInstallation.started.body", correctedTarget),
                state: OpState.QUEUED,
                icon: "playlist_add",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.USER_SLOW],
                call: {
                    name: "characterInstallationOp",
                    args: [correctedTarget, id]
                }
            });
        }
    } catch (err: any) {
        general.addOperation({
            title: message("operation.character.bulkInstallation.started.title"),
            body: (err as Error).message,
            state: OpState.ERROR,
            icon: "folder_shared",
            animation: Math.floor(Math.random() * 3),
            dependencies: []
        });
    }
    return;
}

export async function correctCharacterDir(targetDir: string): Promise<string> {
    let correctedDir: string = targetDir;
    const modFiles: string[] = (await general.getAllFiles(correctedDir))
        .map((file: string) => file.replace(correctedDir, "")).reverse(); // Puts 0extracted last
    for (let file of modFiles) {
        file = path.join(file).split(path.sep).join(path.posix.sep);
        const fileDir: string = path.posix.parse(file).dir + "/";
        if (fileDir.includes("/fighter/") && !file.includes("/announcer")) {
            let topDir: string = file.split("/").shift() ?? error("noTopDir", file);
            while (topDir != "fighter") {
                correctedDir = path.join(correctedDir, topDir);
                file = file.replace(topDir + "/", "");
                topDir = file.split("/").shift() ?? error("noTopDir", file);
            }
            break;
        }
    }
    if (!(await fs.readdir(correctedDir)).includes("fighter")) error("noFighterSubdir", targetDir);
    return correctedDir;
}

export async function findCharacters(targetDir: string): Promise<FoundCharacter[]> {
    const characterNames: string[] = Array.from(new Set(
        (await fs.readdir(
            path.join(targetDir, "fighter")
        )).filter(
            (file: string) => file.endsWith(".bin") || !file.includes(".")
        ).map(
            (character: string) => character.replace(/\.[^/\\]+$/, "")
        )
    ));
    return (await Promise.all(characterNames.map(async (characterName: string) => {
        let found: FoundCharacter;
        if (await fs.exists(path.join(targetDir, "data", "dats", characterName + ".dat"))) {
            found = {
                name: characterName,
                dat: (await readCharacterDatPath(
                    path.join(targetDir, "data", "dats", characterName + ".dat"),
                    characterName
                ))!,
                mug: path.join(targetDir, "gfx", "mugs", characterName + ".png")
            };
        } else if (await fs.exists(path.join(targetDir, "data", characterName + ".dat"))) {
            found = {
                name: characterName,
                dat: (await readCharacterDatPath(
                    path.join(targetDir, "data", characterName + ".dat"),
                    characterName
                ))!,
                mug: path.join(targetDir, "gfx", "mugs", characterName + ".png")
            };
        } else return null;

        // Check for missing info available from v7
        const builtinInfo: V7CharacterInfo | undefined = v7CharacterLookup(found.dat.name);
        if (builtinInfo != undefined) {
            found.dat.displayName = found.dat.displayName || builtinInfo.displayName;
            found.dat.menuName = found.dat.menuName || builtinInfo.displayName;
            found.dat.battleName = found.dat.battleName || builtinInfo.displayName;
            found.dat.series = found.dat.series || builtinInfo.series;
        }
        return found;
    }))).filter((found: FoundCharacter) => found != null) as FoundCharacter[];
}

export function queCharacterInstallation(
    targetDir: string,
    foundCharacter: FoundCharacter,
    filterInstallation: boolean,
    updateCharacters: boolean,
    location: string,
    dir: string = global.gameDir
): void {
    const id: string = foundCharacter.name + "_" + Date.now();
    general.addOperation({
        id: id,
        title: message("operation.character.installation.started.title", location),
        body: message("operation.character.installation.started.body", location),
        state: OpState.QUEUED,
        icon: "folder_shared",
        animation: Math.floor(Math.random() * 3),
        dependencies: [OpDep.FIGHTERS, OpDep.USER],
        call: {
            name: "installCharacterOp",
            args: [
                targetDir, foundCharacter, filterInstallation, updateCharacters, id, location, dir
            ]
        }
    });
}

export async function installCharacterOp(
    targetDir: string,
    foundCharacter: FoundCharacter,
    filterInstallation: boolean,
    updateCharacters: boolean,
    id: string,
    location: string,
    dir: string = global.gameDir
): Promise<void> {
    const character: Character | null = await installCharacter(
        targetDir, foundCharacter, filterInstallation, updateCharacters, dir
    );
    if (character == null) {
        general.updateOperation({
            id: id,
            state: OpState.CANCELED,
        });
    } else {
        general.updateOperation({
            id: id,
            body: message(
                "operation.character.installation.finished.body",
                character.name, location
            ),
            image: "img://" + character.mug,
            state: OpState.FINISHED,
        });
        general.updateCharacterPages();
    }
}

export async function characterInstallationOp(targetDir: string, id: string): Promise<void> {
    const dialog: customDialogs.CharacterInstallDialog =
        new customDialogs.CharacterInstallDialog(targetDir);
    const show: Promise<null | undefined> = dialog.show();
    // This isn't cancel because it finishes successfully
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
        body: message("operation.character.bulkInstallation.finished.body", targetDir),
        state: OpState.FINISHED,
        action: undefined
    });
}

export async function installCharacter(
    targetDir: string,
    foundCharacter: FoundCharacter,
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = global.gameDir
): Promise<Character | null> {
    const characters: CharacterList = await readCharacterList(dir);
    if (!updateCharacters && characters.getByName(foundCharacter.name) != undefined)
        error("noUpdateCharacter");
    
    const temp: CharacterDat | null =
        await getMissingDatInfo(foundCharacter.dat, targetDir, characters);
    if (temp == null) return null;
    foundCharacter.dat = temp;

    if (updateCharacters) {
        if (
            (
                await fs.exists(path.join(targetDir, "fighter", foundCharacter.name + ".bin")) ||
                await fs.exists(path.join(targetDir, "fighter", foundCharacter.name))
            ) &&
            (
                await fs.exists(path.join(dir, "fighter", foundCharacter.name + ".bin")) ||
                await fs.exists(path.join(dir, "fighter", foundCharacter.name))
            )
        ) {
            await fs.remove(path.join(dir, "fighter", foundCharacter.name + ".bin"));
            await fs.remove(path.join(dir, "fighter", foundCharacter.name));
        }
    }

    const toResolve: Promise<void>[] = [];
    if (filterInstallation) {
        toResolve.push(...(await getCharacterFiles(foundCharacter.dat, false, false, targetDir))
            .map(async (file: string) => {
                const targetPath: string = path.join(dir, path.relative(targetDir, file));
                if (!updateCharacters && await fs.exists(targetPath)) return;
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

    const character: Character = {
        name: foundCharacter.name,
        menuName: foundCharacter.dat.menuName!,
        series: foundCharacter.dat.series!,
        randomSelection: true,
        number: characters.getNextNumber(),
        alts: [],
        mug: path.join(dir, "gfx", "mugs", foundCharacter.name + ".png")
    };

    if (characters.getByName(foundCharacter.name) == undefined) {
        characters.add(character);
        toResolve.push(writeCharacters(characters.toArray(), dir));
    }
    await Promise.allSettled(toResolve);

    // This needs to be done last to ensure that it overrides the other changes
    writeCharacterDat(foundCharacter.dat, path.join(dir, "data", "dats"));
    return character;
}

export async function getMissingDatInfo(
    dat: CharacterDat,
    targetDir: string,
    installedCharacters?: CharacterList
): Promise<CharacterDat | null> {
    if (dat.displayName && dat.menuName && dat.battleName && dat.series) return dat;

    const builtinInfo: V7CharacterInfo | undefined = v7CharacterLookup(dat.name);
    if (builtinInfo != undefined) {
        dat.displayName = dat.displayName || builtinInfo.displayName;
        dat.menuName = dat.menuName || builtinInfo.displayName;
        dat.battleName = dat.battleName || builtinInfo.displayName;
        dat.series = dat.series || builtinInfo.series;
        return dat;
    }

    let prefillInfo: PartialDatInfo | undefined;
    if (installedCharacters) {
        const toUpdate: CharacterDat | null = await readCharacterDat(dat.name);
        if (toUpdate) {
            prefillInfo = {
                displayName: toUpdate.displayName,
                menuName: toUpdate.menuName,
                battleName: toUpdate.battleName,
                series: toUpdate.series
            };
        }
    }

    if (!(await customDialogs.confirm("beginCharacterInput"))) {
        return null;
    }

    if (await customDialogs.confirm("openCharacterDir")) {
        general.openDir(targetDir);
    }

    while (!dat.menuName) {
        dat.menuName = await customDialogs.prompt("characterMenuName", {
            defaultValue: prefillInfo?.menuName ?? prefillInfo?.displayName
        });
        if (dat.menuName == undefined) return null;
    }

    if (!dat.displayName) {
        dat.displayName = dat.menuName;
    }

    while (!dat.battleName) {
        dat.battleName = await customDialogs.prompt("characterBattleName", {
            defaultValue: prefillInfo?.battleName
        });
        if (dat.battleName == undefined) return null;
    }

    while (!dat.series) {
        dat.series = await customDialogs.prompt("characterSeries", {
            defaultValue: prefillInfo?.series
        });
        if (dat.series == undefined) return null;
    }
    return dat;
}

export function v7CharacterLookup(name: string): V7CharacterInfo | undefined {
    return V7_BUILTINS[name];
}

export async function extractCharacter(
    extract: string,
    dir: string = global.gameDir
): Promise<string> {
    const characters: Character[] = await readCharacters(dir);
    const characterDat: CharacterDat =
        await readCharacterDat(extract, dir) ?? error("noDatFile");
    const extractDir: string = path.join(dir, "0extracted", extract);

    const similarNames: string[] = characters.filter(
        (character: Character) => character.name.startsWith(extract) && character.name != extract
    ).map((character: Character) => character.name);

    await Promise.allSettled((await getCharacterFiles(characterDat, true, false, dir, similarNames))
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
    writeCharacterDat(characterDat, path.join(extractDir, "data", "dats"));
    return extractDir;
}

export async function removeCharacter(remove: string, dir: string = global.gameDir): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const character: Character | undefined = (await readCharacterList(dir)).getByName(remove);
    if (!character) error("characterNotFound", remove);
    await removeAllAlts(character!, dir);
    const characters: CharacterList = await readCharacterList(dir);
    const characterDat: CharacterDat =
        await readCharacterDat(remove, dir) ?? error("noDatFile");

    const similarNames: string[] = characters.toArray().filter(
        (character: Character) => character.name.startsWith(remove) && character.name != remove
    ).map((character: Character) => character.name);

    (await getCharacterFiles(characterDat, true, true, dir, similarNames))
        .forEach((file: string) => {
            toResolve.push(fs.remove(file));
        });
    
    characters.removeByName(remove);
    toResolve.push(writeCharacters(characters.toArray(), dir));
    toResolve.push(removeCharacterCss(character!, dir));
    toResolve.push(writeCharacterRandom(character!.name, true, dir));
    await Promise.allSettled(toResolve);
    return;    
}

export function createCharacterRegExpNodes(
    nodes: StringNode[] | undefined,
    characterDat: CharacterDat,
    includeExtraFiles: boolean,
    ignoreSeries: boolean = false
): RegExpNode[] | undefined {
    if (!nodes) return undefined;
    return nodes.map((node: StringNode) => {
        if (!includeExtraFiles && node.isExtra) {
            return null;
        }
        let wipString: string = node.name.replaceAll("<fighter>", characterDat.name);
        if (!ignoreSeries && characterDat.series)
            wipString = wipString.replaceAll("<series>", characterDat.series);
        wipString = "^" + general.escapeRegex(wipString);
        wipString += "$";
        wipString = wipString.replaceAll("<audio>", "(mp3|wav|ogg)");
        wipString = wipString.replaceAll("<number>", "\\d+");
        wipString = wipString.replaceAll("<anything>", "[^]+");
        return {
            pattern: new RegExp(wipString, "i"),
            nonExhaustive: node.nonExhaustive,
            contents: createCharacterRegExpNodes(
                node.contents,
                characterDat,
                includeExtraFiles,
                ignoreSeries
            )
        };
    }).filter((node: RegExpNode | null) => node != null) as RegExpNode[];
}

export async function getCharacterFiles(
    characterDat: CharacterDat,
    includeExtraFiles: boolean,
    ignoreSeries: boolean,
    dir: string = global.gameDir,
    similarNames: string[] = []
): Promise<string[]> {
    const matchNodes: RegExpNode[] | undefined = createCharacterRegExpNodes(
        CHARACTER_FILES,
        characterDat,
        includeExtraFiles,
        ignoreSeries
    );
    if (!matchNodes) return [];
    let files: string[] = await general.matchContents(matchNodes, dir);

    for (const name of similarNames) {
        const similarDat: CharacterDat | null = await readCharacterDat(name, dir);
        if (!similarDat) continue;
        const negNodes: RegExpNode[] | undefined = createCharacterRegExpNodes(
            CHARACTER_FILES_POSSIBLE_CONFLICTS,
            similarDat,
            true,
            true
        );
        if (!negNodes) continue;
        const negFiles: string[] = await general.matchContents(negNodes, dir);
        files = files.filter((file: string) => {
            if (!negFiles.includes(file)) return true;
            negFiles.splice(negFiles.indexOf(file));
            return false;
        });
    }
    return files;
}

export async function readCssPages(dir: string = global.gameDir): Promise<CssPage[]> {
    const pages: CssPage[] = [];
    const gameSettings: any = ini.parse(await fs.readFile(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    ));
    if (gameSettings["global.css_customs"] == 0) {
        pages.push({
            name: message("other.defaultPageName"),
            path: path.join(global.gameDir, "data", "css.txt")
        });
        return pages;
    }
    for (
        let number: number = 1;
        number <= parseInt(gameSettings["global.css_custom_number"]);
        number++
    ) {
        pages.push({
            name: gameSettings["global.css_custom_name[" + number + "]"].replaceAll("\"", ""),
            path: path.join(
                global.gameDir,
                "data",
                gameSettings["global.css_custom[" + number + "]"].replaceAll("\"", "")
            )
        });
    }
    return pages;
}

export async function writeCssPages(pages: CssPage[], dir: string = global.gameDir): Promise<void> {
    let gameSettings: string[] = (await fs.readFile(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    )).split(/\r?\n/);
    if (ini.parse(gameSettings.join("\r\n"))["global.css_customs"] == 0) error("customCssDisabled");
    gameSettings = gameSettings.map((line: string) => {
        if (line.startsWith("global.css_custom_number")) {
            return ("global.css_custom_number = " + pages.length + ";");
        } else if (
            line.startsWith("global.css_custom[") ||
            line.startsWith("global.css_custom_name[")
        ) {
            return "\n";
        } else {
            return line;
        }
    }).filter((line: string) => line != "\n");

    pages.forEach((page: CssPage, index: number) => {
        gameSettings.push("global.css_custom[" + (index + 1) + "] = \"" +
            path.relative(path.join(dir, "data"), page.path)
            + "\";"
        );
        gameSettings.push("global.css_custom_name[" + (index + 1) + "] = \"" + page.name + "\";");
    });
    await fs.writeFile(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        gameSettings.join("\r\n"),
        { encoding: "ascii" }
    );
    return;
}

export async function removeCssPage(page: CssPage, dir: string = global.gameDir): Promise<void> {
    const pages: CssPage[] = (await readCssPages(dir)).filter((i: CssPage) => i.path != page.path);
    fs.remove(page.path);
    await writeCssPages(pages, dir);
    return;
}

export async function addCssPage(pageName: string, dir: string = global.gameDir): Promise<CssPage> {
    pageName = pageName.replace(/'|"/g, "");
    const newFile: string = pageName.replace(/[\\/:*?|. ]/g, "-");
    let newPath: string = path.join(dir, "data", "css", newFile + ".txt");

    if (await fs.exists(newPath)) {
        newPath = await general.createUniqueFileName(
            path.join(dir, "data", "css"),
            newFile, ".txt"
        );
    }

    const pages: CssPage[] = await readCssPages(dir);
    const newPage: CssPage = { name: pageName, path: newPath };
    pages.push(newPage);
    await writeCssPages(pages, dir);

    await fs.ensureFile(newPath);
    await fs.writeFile(
        newPath,
        BLANK_CSS_PAGE_DATA,
        { encoding: "ascii" }
    );
    return newPage;
}

export async function reorderCssPage(
    from: number,
    to: number,
    dir: string = global.gameDir
): Promise<void> {
    if (to == from) return;
    const pages: CssPage[] = await readCssPages(dir);
    const target: CssPage = pages[from];
    pages.splice(from, 1);
    if (to > from) to--;
    pages.splice(to, 0, target);
    await writeCssPages(pages, dir);
    return;
}

export async function renameCssPage(
    index: number,
    pageName: string,
    dir: string = global.gameDir
): Promise<CssPage> {
    const toResolve: Promise<void>[] = [];
    const pages: CssPage[] = await readCssPages(dir);
    const newFile: string = pageName.replace(/[\\/:*?|. ]/g, "-");
    let newPath: string = path.join(dir, "data", "css", newFile + ".txt");
    
    if (newPath != pages[index].path) {
        if (await fs.exists(newPath)) {
            newPath = await general.createUniqueFileName(
                path.join(dir, "data", "css"),
                newFile, ".txt"
            );
        }
        toResolve.push(fs.move(pages[index].path, newPath));
    }

    const newPage: CssPage = { name: pageName, path: newPath };
    pages[index] = newPage;
    toResolve.push(writeCssPages(pages, dir));
    await Promise.allSettled(toResolve);
    return newPage;
}

export async function readCssData(page: CssPage): Promise<CssData> {
    const cssFile: string[] = (await fs.readFile(page.path, "ascii")).split(/\r?\n/);
    const css: CssData = cssFile.map((line: string) => line.split(" "));
    css[css.length - 1].pop();
    return css;
}

export async function writeCssData(page: CssPage, data: CssData): Promise<void> {
    const fixedData: CssData = fixCssData(data);
    const output: string = fixedData.map((row: string[]) => row.join(" ")).join("\r\n") + " ";
    await fs.writeFile(
        page.path,
        output,
        { encoding: "ascii" }
    );
    return;
}

export function fixCssData(data: CssData): CssData {
    // If one row is longer than the others for some reason, extend the other rows to ensure the css
    // is valid and avoid losing information.
    const largestLength: number = data.toSorted(
        (a: string[], b: string[]) => b.length - a.length
    )[0].length;
    return data.map((row: string[]) => {
        while (row.length < largestLength) {
            row.push("0000");
        }
        return row;
    });
}

export async function removeCharacterCss(
    character: Character,
    dir: string = global.gameDir
): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const cssPages: CssPage[] = await readCssPages(dir);
    for (const page of cssPages) {
        const cssData: CssData = await readCssData(page);
        toResolve.push(writeCssData(page, cssData.map((row: string[]) => {
            return row.map((cell: string) => {
                if (parseInt(cell) == character.number) {
                    return "0000";
                } else if (parseInt(cell) > character.number && cell != "9999") {
                    return ("0000" + (parseInt(cell) - 1)).slice(-4);
                } else {
                    return cell;
                }
            });
        })));
    }
    await Promise.allSettled(toResolve);
    return;
}

export async function removeSeriesCharacters(
    series: string,
    dir: string = global.gameDir
): Promise<void> {
    const characters: CharacterList = await readCharacterList(dir);
    const charactersToRemove: Character[] = characters.toArray().filter(
        (character: Character) => character.series == series
    );
    const altsToRemove: Alt[] = [];
    charactersToRemove.forEach((character: Character) => {
        character.alts.forEach((alt: Alt) => {
            // If the alt is in the character list, it will be removed before alts.
            if (characters.getByName(alt.alt) == undefined) altsToRemove.push(alt);
        });
    });
    console.log(Date.now());
    for (const character of charactersToRemove) {
        console.log(character);
        await removeCharacter(character.name, dir);
    }
    for (const alt of altsToRemove) {
        console.log(alt);
        await removeCharacter(alt.alt, dir);
    }
    console.log(Date.now());
    return;
}