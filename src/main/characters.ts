import fs from "fs-extra";
import path from "path";
import ini from "ini";
import { CharacterList, OpDep, OpState, error } from "../global/global";

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

export function readCharacters(dir: string = global.gameDir): Character[] {
    return readCharacterList(dir).toArray();
}

export function readCharacterList(dir: string = global.gameDir): CharacterList {
    const alts: Alt[] = readAlts(dir);
    const characterList: CharacterList = new CharacterList();
    const charactersTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighters.txt"),
        "ascii"
    ).split(/\r?\n/);
    charactersTxt.shift(); // Drop the number
    charactersTxt.forEach((character: string, index: number) => {
        if (fs.existsSync(path.join(dir, "data", "dats", character + ".dat"))) {
            const characterDat: CharacterDat | null = readCharacterDat(character, dir);
            characterList.add({
                name: character,
                menuName: characterDat?.menuName ?? character,
                series: characterDat?.series ?? "",
                randomSelection: true, // Assume true and then iterate through false list
                number: index + 1,
                alts: alts.filter((alt: Alt) => alt.base == character),
                mug: path.join(dir, "gfx", "mugs", character + ".png")
            });
        }
    });
    const lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
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
    fs.writeFileSync(
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
    let lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    if (randomSelection) {
        lockedTxt = lockedTxt.filter((locked: string) => locked != character);
    } else {
        lockedTxt.push(character);
    }
    let output: string = lockedTxt.length + "\r\n";
    output += lockedTxt.join("\r\n");
    fs.writeFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        output,
        { encoding: "ascii" }
    );
    return;
}

export function readAlts(dir: string = global.gameDir): Alt[] {
    const altsTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "alts.txt"),
        "ascii"
    ).split(/\r?\n/);
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
    fs.writeFileSync(
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
    if (newAlt.alts.length != 0)
        throw new Error("A character with alts can't be assigned as an alt.");

    const toResolve: Promise<void>[] = [];
    const alts: Alt[] = readAlts(dir);
    let altNumber: number = 1;
    const sameBase: Alt[] = alts.filter((alt: Alt) => alt.base == base.name);
    if (sameBase.length > 6)
        throw new Error("Character already has the maximum number of alts.");

    sameBase.forEach((alt: Alt) => {
        if (alt.number > altNumber) altNumber = alt.number;
    });
    const newAltDat: CharacterDat | null = readCharacterDat(newAlt.name, dir);
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
        const characterList: CharacterList = readCharacterList(dir);
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
    const alts: Alt[] = readAlts(dir).filter((i: Alt) => !(
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

export function isCharacterOnCSS(character: Character, dir: string = global.gameDir): boolean {
    const cssPages: CssPage[] = readCssPages(dir);
    for (const page of cssPages) {
        const cssData: CssData = readCssData(page);
        for (const row of cssData) {
            if (row.includes(("0000" + character.number).slice(-4))) {
                return true;
            }
        }
    }
    return false;
}

export async function ensureAltIsCharacter(alt: Alt, dir: string = global.gameDir): Promise<void> {
    const characterList: CharacterList = readCharacterList(dir);
    if (characterList.getByName(alt.alt) != undefined) {
        return;
    }

    const characterDat: CharacterDat | null = readCharacterDat(alt.alt, dir);
    const baseCharacter: Character | undefined = characterList.getByName(alt.base);
    if (!baseCharacter) throw new Error("Character not found: \"" + alt.base + "\"");
    characterList.add({
        name: alt.alt,
        menuName: characterDat?.menuName ?? alt.menuName,
        series: characterDat?.series ?? baseCharacter.series,
        randomSelection: true,
        number: characterList.getNextNumber(),
        alts: [],
        mug: path.join(dir, "gfx", "mugs", alt.alt + ".png")
    });

    await writeCharacters(characterList.toArray(), dir);
    return;
}

export async function ensureAltIsntCharacter(
    alt: Alt,
    dir: string = global.gameDir
): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const characterList: CharacterList = readCharacterList(dir);
    const character: Character | undefined = characterList.getByName(alt.alt);
    if (!character) throw new Error("Character not found: \"" + alt.alt + "\"");
    if (character == undefined || isCharacterOnCSS(character, dir)) {
        return;
    }
    characterList.removeByName(alt.alt);
    toResolve.push(writeCharacters(characterList.toArray(), dir));
    toResolve.push(removeCharacterCss(character, dir)); // Updates numbers
    toResolve.push(writeCharacterRandom(alt.alt, true, dir));
    await Promise.allSettled(toResolve);
    return;
}

export async function ensureAllAltsAreCharacters(
    areCharacters: boolean,
    dir: string = global.gameDir
): Promise<void> {
    const alts: Alt[] = readAlts(dir);
    for (const alt of alts) {
        console.log(alt);
        if (areCharacters) {
            await ensureAltIsCharacter(alt, dir);
        } else {
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
    for (const alt of readAlts(dir).filter(
        (alt: Alt) => alt.alt == character.name
    )) {
        await removeAlt(alt, false, dir);
    }
    return;
}

export function readCharacterDat(
    character: string,
    dir: string = global.gameDir
): CharacterDat | null {
    return readCharacterDatPath(path.join(dir, "data", "dats", character + ".dat"), character);
}

export function readCharacterDatPath(
    datPath: string,
    character: string = path.parse(datPath).name
): CharacterDat | null {
    if (!fs.existsSync(datPath)) return null;
    const characterDatTxt: string[] = fs.readFileSync(
        datPath,
        "ascii"
    ).split(/\r?\n/);
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
        series = characterDatTxt[3].toLowerCase();
    }

    const homeStages: string[] = [];
    const randomDatas: string[] = [];
    const palettes: CharacterPalette[] = [];
    if (isV7) {
        homeStages.push("battlefield");
        randomDatas.push("Updated to v8 dat format by CMC Mod Manager");
        const paletteCount: number =
            parseInt(characterDatTxt[isVanilla ? 1 : 5]);
        for (let palette: number = 1; palette <= paletteCount * 6; palette += 6) {
            const paletteLocation: number = isVanilla ? 1 : 5 + palette;
            palettes.push({
                name: characterDatTxt[paletteLocation + 0],
                0: parseInt(characterDatTxt[paletteLocation + 1]),
                1: parseInt(characterDatTxt[paletteLocation + 2]),
                2: parseInt(characterDatTxt[paletteLocation + 3]),
                3: parseInt(characterDatTxt[paletteLocation + 4]),
                4: parseInt(characterDatTxt[paletteLocation + 5])
            });
        }
    } else {
        const homeStageCount: number = parseInt(characterDatTxt[5]);
        for (let stage: number = 1; stage <= homeStageCount; stage++) {
            homeStages.push(characterDatTxt[5 + stage]);
        }

        const randomDataCount: number = parseInt(characterDatTxt[7 + homeStageCount]);
        for (let data: number = 1; data <= randomDataCount; data++) {
            randomDatas.push(characterDatTxt[7 + homeStageCount + data]);
        }

        const paletteCount: number =
            parseInt(characterDatTxt[9 + homeStageCount + randomDataCount]);
        for (let palette: number = 1; palette <= paletteCount * 6; palette += 6) {
            const paletteLocation: number = 10 + homeStageCount + randomDataCount + palette;
            palettes.push({
                name: characterDatTxt[paletteLocation + 0],
                0: parseInt(characterDatTxt[paletteLocation + 1]),
                1: parseInt(characterDatTxt[paletteLocation + 2]),
                2: parseInt(characterDatTxt[paletteLocation + 3]),
                3: parseInt(characterDatTxt[paletteLocation + 4]),
                4: parseInt(characterDatTxt[paletteLocation + 5])
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
        randomDatas: randomDatas,
        palettes: palettes
    };
    return characterDat;
}

export function writeCharacterDat(dat: CharacterDat, destination: string): void {
    let output: string = [
        dat.displayName,
        dat.menuName,
        dat.battleName,
        dat.series,
        "---Classic Home Stages Below---",
        dat.homeStages.length,
        dat.homeStages.join("\r\n"),
        "---Random Datas---",
        dat.randomDatas.length,
        dat.randomDatas.join("\r\n"),
        "---Palettes Number---",
        dat.palettes.length,
        "---From Here is Individual Palettes data---"
    ].join("\r\n");
    dat.palettes.forEach((palette: CharacterPalette) => {
        output += [
            "",
            palette.name,
            palette[0],
            palette[1],
            palette[2],
            palette[3],
            palette[4]
        ].join("\r\n");
    });
    fs.ensureFileSync(path.join(destination, dat.name + ".dat"));
    fs.writeFileSync(path.join(destination, dat.name + ".dat"), output, { encoding: "ascii" });
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

export function installCharacters(
    targetDir: string,
    filterInstallation: boolean,
    updateCharacters: boolean,
    location: string,
    dir: string = global.gameDir
): void {
    try {
        const correctedTarget: string = correctCharacterDir(targetDir);
        if (path.relative(correctedTarget, dir) == "") throw new Error(
            "Cannot install characters from the directory that they are being installed to."
        );
        const foundCharacters: FoundCharacter[] = findCharacters(correctedTarget);
        if (foundCharacters.length == 0)
            throw new Error("No valid characters found in directory: '" + targetDir + "'.");
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
                title: "Character Installation",
                body: "Selecting characters to install from '" + correctedTarget + "'.",
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
            title: "Character Installation",
            body: (err as Error).message,
            state: OpState.ERROR,
            icon: "folder_shared",
            animation: Math.floor(Math.random() * 3),
            dependencies: []
        });
    }
    return;
}

export function correctCharacterDir(targetDir: string): string {
    let correctedDir: string = targetDir;
    const modFiles: string[] = general.getAllFiles(correctedDir)
        .map((file: string) => file.replace(correctedDir, ""));
    for (let file of modFiles) {
        file = path.join(file).split(path.sep).join(path.posix.sep);
        const fileDir: string = path.posix.parse(file).dir + "/";
        if (fileDir.includes("/fighter/") && !file.includes("/announcer/")) {
            let topDir: string | undefined = file.split("/").shift() ??
                error("Top dir not found for file: '" + file + "'");
            while (topDir != "fighter") {
                correctedDir = path.join(correctedDir, topDir);
                file = file.replace(topDir + "/", "");
                topDir = file.split("/").shift() ??
                    error("Top dir not found for file: '" + file + "'");
            }
            break;
        }
    }
    if (!fs.readdirSync(correctedDir).includes("fighter")) {
        throw new Error("No 'fighter' subdirectory found in directory: '" + targetDir + "'.");
    }
    return correctedDir;
}

export function findCharacters(targetDir: string): FoundCharacter[] {
    const characterNames: string[] = Array.from(new Set(
        fs.readdirSync(
            path.join(targetDir, "fighter")
        ).filter(
            (file: string) => file.endsWith(".bin") || !file.includes(".")
        ).map(
            (character: string) => character.replace(/\.[^/\\]+$/, "")
        )
    ));
    return characterNames.map((characterName: string) => {
        let found: FoundCharacter;
        if (fs.existsSync(path.join(targetDir, "data", "dats", characterName + ".dat"))) {
            found = {
                name: characterName,
                dat: readCharacterDatPath(
                    path.join(targetDir, "data", "dats", characterName + ".dat"),
                    characterName
                )!,
                mug: path.join(targetDir, "gfx", "mugs", characterName + ".png")
            };
        } else if (fs.existsSync(path.join(targetDir, "data", characterName + ".dat"))) {
            found = {
                name: characterName,
                dat: readCharacterDatPath(
                    path.join(targetDir, "data", characterName + ".dat"),
                    characterName
                )!,
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
    }).filter((found: FoundCharacter) => found != null) as FoundCharacter[];
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
        title: "Character Installation",
        body: "Installing a character from " + location + ".",
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
            body: "Installed character: '" + character.name + "' from " + location + ".",
            image: "img://" + character.mug,
            state: OpState.FINISHED,
        });
        general.updateCharacterPages();
    }
}

export async function characterInstallationOp(targetDir: string, id: string): Promise<void> {
    await customDialogs.characterInstallation(targetDir);
    general.updateOperation({
        id: id,
        body: "Selected characters to install from '" + targetDir + "'.",
        state: OpState.FINISHED,
    });
}

export async function installCharacter(
    targetDir: string,
    foundCharacter: FoundCharacter,
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = global.gameDir
): Promise<Character | null> {
    const characters: CharacterList = readCharacterList(dir);
    if (!updateCharacters && characters.getByName(foundCharacter.name) != undefined) {
        throw new Error("Character already installed, updates disabled.");
    }
    
    const temp: CharacterDat | null =
        await getMissingDatInfo(foundCharacter.dat, targetDir, characters);
    if (temp == null) return null;
    foundCharacter.dat = temp;

    if (updateCharacters) {
        if (
            (
                fs.existsSync(path.join(targetDir, "fighter", foundCharacter.name + ".bin")) ||
                fs.existsSync(path.join(targetDir, "fighter", foundCharacter.name))
            ) &&
            (
                fs.existsSync(path.join(dir, "fighter", foundCharacter.name + ".bin")) ||
                fs.existsSync(path.join(dir, "fighter", foundCharacter.name))
            )
        ) {
            console.log("Removing bin & folder for replacement.");
            fs.removeSync(path.join(dir, "fighter", foundCharacter.name + ".bin"));
            fs.removeSync(path.join(dir, "fighter", foundCharacter.name));
        }
    }

    const toResolve: Promise<void>[] = [];
    if (filterInstallation) {
        (await getCharacterFiles(foundCharacter.dat, false, false, targetDir))
            .forEach((file: string) => {
                const targetPath: string = path.join(dir, path.relative(targetDir, file));
                fs.ensureDirSync(path.parse(targetPath).dir);
                if (!updateCharacters && fs.existsSync(targetPath)) return;
                toResolve.push(
                    fs.copy(
                        file,
                        targetPath,
                        { overwrite: !file.startsWith("gfx/seriesicon/") }
                    )
                );
            });
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
    // TODO: prefill needs an explicit test
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
        const toUpdate: CharacterDat | null = readCharacterDat(dat.name);
        if (toUpdate) {
            prefillInfo = {
                displayName: toUpdate.displayName,
                menuName: toUpdate.menuName,
                battleName: toUpdate.battleName,
                series: toUpdate.series
            };
        }
    }

    if (!(await customDialogs.confirm({
        id: "confirmCharacterInput",
        title: "CMC Mod Manager | Character Installation",
        body: "The character that is being installed's dat file uses the vanilla format and " +
            "you will be required to enter some information for the installation. This " +
            "information can usually be found in a txt file in the mod's top level directory.",
        okLabel: "Continue"
    }))) {
        return null;
    }

    if (await customDialogs.confirm({
        id: "openCharacterDir",
        title: "CMC Mod Manager | Character Installation",
        body: "Would you like to open the mod's directory to find any txt files manually?",
        okLabel: "Yes",
        cancelLabel: "No"
    })) {
        general.openDir(targetDir);
    }

    while (!dat.menuName) {
        dat.menuName = await customDialogs.prompt({
            id: "inputCharacterMenuName",
            title: "CMC Mod Manager | Character Installation",
            body: "Please enter the character's 'menu name'. (This is the name displayed " +
                "on the when the character is selected on the character selection screen.)",
            placeholder: "Character's Menu Name",
            defaultValue: prefillInfo?.menuName ?? prefillInfo?.displayName
        });
        if (dat.menuName == undefined) return null;
    }

    if (!dat.displayName) {
        dat.displayName = dat.menuName;
    }

    while (!dat.battleName) {
        dat.battleName = await customDialogs.prompt({
            id: "inputCharacterBattleName",
            title: "CMC Mod Manager | Character Installation",
            body: "Please enter the character's 'battle name'. (This is the name displayed " +
                "as a part of the HUD during a match.)",
            placeholder: "Character's Battle Name",
            defaultValue: prefillInfo?.battleName
        });
        if (dat.battleName == undefined) return null;
    }

    while (!dat.series) {
        dat.series = await customDialogs.prompt({
            id: "inputCharacterSeries",
            title: "CMC Mod Manager | Character Installation",
            body: "Please enter the character's 'series'. (This name will be used to select " +
            "the icon to use on the character selection screen. This value is usually short " +
            "and in all lowercase letters.)",
            placeholder: "Character's Series",
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
    const toResolve: Promise<void>[] = [];
    const characters: Character[] = readCharacters(dir);
    const characterDat: CharacterDat =
        readCharacterDat(extract, dir) ?? error("Character has no dat file.");
    const extractDir: string = path.join(dir, "0extracted", extract);

    const similarNames: string[] = characters.filter(
        (character: Character) => character.name.startsWith(extract) && character.name != extract
    ).map((character: Character) => character.name);
    
    (await getCharacterFiles(characterDat, true, false, dir, similarNames))
        .forEach((file: string) => {
            const targetPath: string = path.join(extractDir, path.relative(dir, file));
            fs.ensureDirSync(path.parse(targetPath).dir);
            toResolve.push(
                fs.copy(
                    file,
                    targetPath,
                    { overwrite: true }
                )
            );
        });

    await Promise.allSettled(toResolve);
    writeCharacterDat(characterDat, path.join(extractDir, "data", "dats"));
    return extractDir;
}

export async function removeCharacter(remove: string, dir: string = global.gameDir): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const character: Character | undefined = readCharacterList(dir).getByName(remove);
    if (!character) throw new Error("Character not found: \"" + remove + "\"");
    await removeAllAlts(character, dir);
    const characters: CharacterList = readCharacterList(dir);
    const characterDat: CharacterDat =
        readCharacterDat(remove, dir) ?? error("Character has no dat file.");

    const similarNames: string[] = characters.toArray().filter(
        (character: Character) => character.name.startsWith(remove) && character.name != remove
    ).map((character: Character) => character.name);

    (await getCharacterFiles(characterDat, true, true, dir, similarNames))
        .forEach((file: string) => {
            toResolve.push(fs.remove(file));
        });
    
    characters.removeByName(remove);
    toResolve.push(writeCharacters(characters.toArray(), dir));
    toResolve.push(removeCharacterCss(character, dir));
    toResolve.push(writeCharacterRandom(character.name, true, dir));
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
        const similarDat: CharacterDat | null = readCharacterDat(name, dir);
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

export function readCssPages(dir: string = global.gameDir): CssPage[] {
    const pages: CssPage[] = [];
    const gameSettings: any = ini.parse(fs.readFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    ));
    if (gameSettings["global.css_customs"] == 0) {
        pages.push({
            name: "Default",
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
    let gameSettings: string[] = fs.readFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        "ascii"
    ).split(/\r?\n/);
    if (ini.parse(gameSettings.join("\r\n"))["global.css_customs"] == 0) {
        throw new Error("Custom CSS pages disabled in game_settings.");
    }
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
    fs.writeFileSync(
        path.join(dir, "data", "GAME_SETTINGS.txt"),
        gameSettings.join("\r\n"),
        { encoding: "ascii" }
    );
    return;
}

export async function removeCssPage(page: CssPage, dir: string = global.gameDir): Promise<void> {
    const pages: CssPage[] = readCssPages(dir).filter((i: CssPage) => i.path != page.path);
    fs.remove(page.path);
    await writeCssPages(pages, dir);
    return;
}

export async function addCssPage(pageName: string, dir: string = global.gameDir): Promise<CssPage> {
    pageName = pageName.replace(/'|"/g, "");
    const newFile: string = pageName.replace(/[\\/:*?|. ]/g, "-");
    let newPath: string = path.join(dir, "data", "css", newFile + ".txt");

    if (fs.existsSync(newPath)) {
        newPath = await general.createUniqueFileName(
            path.join(dir, "data", "css"),
            newFile, ".txt"
        );
    }

    const pages: CssPage[] = readCssPages(dir);
    const newPage: CssPage = { name: pageName, path: newPath };
    pages.push(newPage);
    await writeCssPages(pages, dir);

    fs.ensureFileSync(newPath);
    fs.writeFileSync(
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
    const pages: CssPage[] = readCssPages(dir);
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
    const pages: CssPage[] = readCssPages(dir);
    const newFile: string = pageName.replace(/[\\/:*?|. ]/g, "-");
    let newPath: string = path.join(dir, "data", "css", newFile + ".txt");
    
    if (newPath != pages[index].path) {
        if (fs.existsSync(newPath)) {
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

export function readCssData(page: CssPage): CssData {
    const cssFile: string[] = fs.readFileSync(page.path, "ascii").split(/\r?\n/);
    const css: CssData = cssFile.map((line: string) => line.split(" "));
    css[css.length - 1].pop();
    return css;
}

export async function writeCssData(page: CssPage, data: CssData): Promise<void> {
    const output: string = data.map((row: string[]) => row.join(" ")).join("\r\n") + " ";
    fs.writeFileSync(
        page.path,
        output,
        { encoding: "ascii" }
    );
    return;
}

export async function removeCharacterCss(
    character: Character,
    dir: string = global.gameDir
): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const cssPages: CssPage[] = readCssPages(dir);
    cssPages.forEach((page: CssPage) => {
        const cssData: CssData = readCssData(page);
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
    });
    await Promise.allSettled(toResolve);
    return;
}

export async function removeSeriesCharacters(
    series: string,
    dir: string = global.gameDir
): Promise<void> {
    const charactersToRemove: Character[] = readCharacters(dir)
        .filter((character: Character) => character.series == series);
    const altsToRemove: Alt[] = [];
    charactersToRemove.forEach((character: Character) => {
        character.alts.forEach((alt: Alt) => {
            if (alt.alt != alt.base) altsToRemove.push(alt);
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