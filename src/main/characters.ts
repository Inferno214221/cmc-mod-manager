import { OpenDialogReturnValue, dialog } from "electron";
import fs from "fs-extra";
import path from "path";
import ini from "ini";
import { CharacterList, OpState } from "../global/global";

import * as general from "./general";
import * as customDialogs from "./custom-dialogs";

const CHARACTER_FILES: string[] = [
    "arcade/routes/<fighter>.txt",
    "arcade/routes/<series>_series.txt",
    "data/dats/<fighter>.dat",
    "fighter/<fighter>.bin",
    "fighter/<fighter>/<any>",
    "gfx/abust/<fighter>.png",
    "gfx/bust/<fighter>.png",
    "gfx/bust/<fighter>_<palette>.png",
    "gfx/cbust/<fighter>.png",
    "gfx/mbust/<fighter>.png",
    "gfx/tbust/<fighter>__<any>.png",
    "gfx/mugs/<fighter>.png",
    "gfx/hudicon/<series>.png",
    "gfx/name/<fighter>.png",
    "gfx/portrait/<fighter>.png",
    "gfx/portrait/<fighter>_<palette>.png",
    "gfx/seriesicon/<series>.png",
    "gfx/stock/<fighter>.png",
    "palettes/<fighter>/<any>",
    "music/versus/<fighter>_<any>.<audio>",
    "music/victory/<series>.<audio>",
    "music/victory/individual/<fighter>.<audio>",
    "sfx/announcer/fighter/<fighter>.<audio>",
    "sticker/common/<fighter>.png",
    "sticker/common/desc/<fighter>.txt",
    "sticker/rare/<fighter>.png",
    "sticker/rare/desc/<fighter>.txt",
    "sticker/super/<fighter>.png",
    "sticker/super/desc/<fighter>.txt",
    "sticker/ultra/<fighter>.png",
    "sticker/ultra/desc/<fighter>.txt",
];

const EXTRA_CHARACTER_FILES: string[] = [...CHARACTER_FILES];
EXTRA_CHARACTER_FILES.push(...[
    "data/<fighter>.dat",
    "gfx/portrait_new/<fighter>.png",
    "gfx/portrait_new/<fighter>_<palette>.png",
]);

const BLANK_CSS_PAGE_DATA: string = "\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 0000 0000 0000 0000\r\n\
0000 0000 0000 9999 0000 0000 0000 ";

export function readCharacters(dir: string = global.gameDir): Character[] {
    return readCharacterList(dir).getAllCharacters();
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
            const characterDat: CharacterDat = readCharacterDat(character, dir);
            characterList.addCharacter({
                name: character,
                menuName: characterDat.menuName,
                series: characterDat.series,
                randomSelection: true, // Assume true and then iterate through false list
                number: index + 1,
                alts: alts.filter((alt: Alt) => alt.base == character),
                mug: path.join(dir, "gfx", "mugs", character + ".png")
            });
        }
        // TODO: else error quietly
    });
    const lockedTxt: string[] = fs.readFileSync(
        path.join(dir, "data", "fighter_lock.txt"),
        "ascii"
    ).split(/\r?\n/);
    lockedTxt.shift();
    lockedTxt.forEach((locked: string) => {
        if (characterList.getCharacterByName(locked) == undefined) return;
        characterList.updateCharacterByName(locked, { randomSelection: false });
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
    // TODO: verify alt numbers
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
    const toResolve: Promise<void>[] = [];
    const alts: Alt[] = readAlts(dir);
    let altNumber: number = 1;
    alts.filter((alt: Alt) => alt.base == base.name).forEach((alt: Alt) => {
        if (alt.number > altNumber) altNumber = alt.number;
    });
    const newAltDat: CharacterDat = readCharacterDat(newAlt.name, dir);
    alts.push({
        base: base.name,
        alt: newAlt.name,
        number: altNumber + 1,
        menuName: newAlt.menuName,
        battleName: newAltDat.battleName,
        mug: newAlt.mug
    });
    await writeAlts(alts, dir);
    if (global.appData.config.altsAsCharacters) {
        return;
    }
    const characterList: CharacterList = readCharacterList(dir);
    characterList.removeCharacterByName(newAlt.name);
    toResolve.push(writeCharacters(characterList.getAllCharacters(), dir));
    toResolve.push(removeCharacterCss(newAlt, dir));
    toResolve.push(writeCharacterRandom(newAlt.name, true, dir));
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

export async function ensureAltIsCharacter(alt: Alt, dir: string = global.gameDir): Promise<void> {
    const characterList: CharacterList = readCharacterList(dir);
    if (characterList.getCharacterByName(alt.alt) != undefined) {
        return;
    }

    const characterDat: CharacterDat = readCharacterDat(alt.alt, dir);
    const baseCharacter: Character = characterList.getCharacterByName(alt.base);
    characterList.addCharacter({
        name: alt.alt,
        menuName: characterDat == null ? alt.menuName : characterDat.menuName,
        series: characterDat == null ? baseCharacter.series : characterDat.series,
        randomSelection: true,
        number: characterList.getNextNumber(),
        alts: [],
        mug: path.join(dir, "gfx", "mugs", alt.alt + ".png")
    });

    await writeCharacters(characterList.getAllCharacters(), dir);
    return;
}

export async function ensureAltIsntCharacter(
    alt: Alt,
    dir: string = global.gameDir
): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const characterList: CharacterList = readCharacterList(dir);
    if (characterList.getCharacterByName(alt.alt) == undefined) {
        return;
    }
    characterList.removeCharacterByName(alt.alt);
    toResolve.push(writeCharacters(characterList.getAllCharacters(), dir));
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

export function readCharacterDat(character: string, dir: string = global.gameDir): CharacterDat {
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
    // TODO: handle empty v7 names for builtin characters
    const isVanilla: boolean = general.isNumber(characterDatTxt[3]);
    const isV7: boolean = isVanilla || general.isNumber(characterDatTxt[4]);

    let displayName: string;
    let menuName: string;
    let battleName: string;
    let series: string;
    
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

export async function writeCharacterDat(dat: CharacterDat, destination: string): Promise<void> {
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

export async function installCharacterDir(
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = global.gameDir
): Promise<Character> {
    const selected: OpenDialogReturnValue = await dialog.showOpenDialog(global.win, {
        properties: ["openDirectory"]
    });
    if (selected.canceled == true) {
        return null;
    }
    const retVal: Character =
        await installCharacter(selected.filePaths[0], filterInstallation, updateCharacters, dir);
    return retVal;
}

export async function installCharacterArchive(
    filterInstallation: boolean,
    updateCharacters: boolean,
    dir: string = global.gameDir
): Promise<Character> {
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
    const retVal: Character =
        await installCharacter(output, filterInstallation, updateCharacters, dir);
    return retVal;
}

export async function installCharacter(
    characterDir: string,
    filterInstallation: boolean = true,
    updateCharacters: boolean = false,
    dir: string = global.gameDir
): Promise<Character> {
    const toResolve: Promise<void>[] = [];
    let correctedDir: string = characterDir;
    console.log(correctedDir);
    const modFiles: string[] = general.getAllFiles(correctedDir)
        .map((file: string) => file.replace(correctedDir, ""));
    console.log(modFiles);
    for (let file of modFiles) {
        file = path.join(file).split(path.sep).join(path.posix.sep);
        console.log(file);
        const fileDir: string = path.posix.parse(file).dir + "/";
        console.log(fileDir);
        console.log(fileDir.includes("/fighter/") && !file.includes("/announcer/"));
        if (fileDir.includes("/fighter/") && !file.includes("/announcer/")) {
            let topDir: string = file.split("/").shift();
            console.log(topDir);
            while (topDir != "fighter") {
                correctedDir = path.join(correctedDir, topDir);
                console.log(correctedDir);
                file = file.replace(topDir + "/", "");
                console.log(file);
                topDir = file.split("/").shift();
                console.log(topDir);
            }
            break;
        }
    }
    console.log(correctedDir, fs.readdirSync(correctedDir));
    if (!fs.readdirSync(correctedDir).includes("fighter")) {
        throw new Error("No 'fighter' subdirectory found.");
    }
    const characterName: string = fs.readdirSync(path.join(correctedDir, "fighter"))
        .filter((file: string) =>
            file.endsWith(".bin") || !file.includes(".")
        )[0].split(".")[0];
    const characters: CharacterList = readCharacterList(dir);
    if (!updateCharacters && characters.getCharacterByName(characterName) != undefined) {
        throw new Error("Character already installed, updates disabled.");
    }

    let characterDat: CharacterDat;
    if (fs.existsSync(path.join(correctedDir, "data", "dats", characterName + ".dat"))) {
        characterDat = readCharacterDatPath(
            path.join(correctedDir, "data", "dats", characterName + ".dat"),
            characterName
        );
    } else if (fs.existsSync(path.join(correctedDir, "data", characterName + ".dat"))) {
        characterDat = readCharacterDatPath(
            path.join(correctedDir, "data", characterName + ".dat"),
            characterName
        );
    } else {
        throw new Error("No dat file found.");
    }

    if (
        characterDat.displayName == undefined ||
        characterDat.menuName == undefined ||
        characterDat.battleName == undefined ||
        characterDat.series == undefined
    ) {
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
            general.openDir(correctedDir);
        }

        // while (characterDat.displayName == undefined || characterDat.displayName == "") {
        //     characterDat.displayName = await general.prompt({
        //         title: "CMC Mod Manager | Character Installation",
        //         body: "Please enter the character's 'display name'.",
        //         placeholder: "Character's Display Name"
        //     });
        // }

        while (characterDat.menuName == undefined || characterDat.menuName == "") {
            characterDat.menuName = await customDialogs.prompt({
                id: "inputCharacterMenuName",
                title: "CMC Mod Manager | Character Installation",
                body: "Please enter the character's 'menu name'. (This is the name displayed " +
                    "on the when the character is selected on the character selection screen.)",
                placeholder: "Character's Menu Name"
            });
            if (characterDat.menuName == undefined) return null;
        }

        if (characterDat.displayName == undefined || characterDat.displayName == "") {
            characterDat.displayName = characterDat.menuName;
        }

        while (characterDat.battleName == undefined || characterDat.battleName == "") {
            characterDat.battleName = await customDialogs.prompt({
                id: "inputCharacterBattleName",
                title: "CMC Mod Manager | Character Installation",
                body: "Please enter the character's 'battle name'. (This is the name displayed " +
                    "as a part of the HUD during a match.)",
                placeholder: "Character's Battle Name"
            });
            if (characterDat.battleName == undefined) return null;
        }

        while (characterDat.series == undefined || characterDat.series == "") {
            characterDat.series = await customDialogs.prompt({
                id: "inputCharacterSeries",
                title: "CMC Mod Manager | Character Installation",
                body: "Please enter the character's 'series'. (This name will be used to select " +
                "the icon to use on the character selection screen. This value is usually short " +
                "and in all lowercase letters.)",
                placeholder: "Character's Series"
            });
            if (characterDat.series == undefined) return null;
        }
    }
    if (updateCharacters) {
        if (
            (
                fs.existsSync(path.join(correctedDir, "fighter", characterName + ".bin")) ||
                fs.existsSync(path.join(correctedDir, "fighter", characterName))
            ) &&
            (
                fs.existsSync(path.join(dir, "fighter", characterName + ".bin")) ||
                fs.existsSync(path.join(dir, "fighter", characterName))
            )
        ) {
            console.log("Removing bin & folder for replacement.");
            fs.removeSync(path.join(dir, "fighter", characterName + ".bin"));
            fs.removeSync(path.join(dir, "fighter", characterName));
        }
    }

    if (filterInstallation) {
        getCharacterFiles(characterDat, false, false, correctedDir).forEach((file: string) => {
            const filePath: string = path.join(correctedDir, file);
            const targetPath: string = path.join(dir, file);
            fs.ensureDirSync(path.parse(targetPath).dir);
            if (!updateCharacters && fs.existsSync(targetPath)) return;
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

    toResolve.push(writeCharacterDat(
        characterDat,
        path.join(dir, "data", "dats")
    ));

    const character: Character = {
        name: characterName,
        menuName: characterDat.menuName,
        series: characterDat.series,
        randomSelection: true,
        number: characters.getNextNumber(),
        alts: [],
        mug: path.join(dir, "gfx", "mugs", characterName + ".png")
    };

    if (characters.getCharacterByName(characterName) != undefined) {
        return character;
    }
    characters.addCharacter(character);
    toResolve.push(writeCharacters(characters.getAllCharacters(), dir));
    await Promise.allSettled(toResolve);
    return character;
}

export async function installDownloadedCharacter(targetDir: string, id: string): Promise<void> {
    const character: Character = await installCharacter(
        targetDir,
        true,
        global.appData.config.updateCharacters,
        global.gameDir
    );
    if (character == null) {
        global.win.webContents.send("updateOperation", {
            id: id + "_install",
            state: OpState.canceled
        });
        return;
    }
    global.win.webContents.send("updateOperation", {
        id: id + "_install",
        title: "Character Installation",
        body: "Installed character: '" + character.name + "' from GameBanana.",
        image: "img://" + character.mug,
        state: OpState.finished
    });
    global.win.webContents.send("installCharacter");
    return;
}

export async function extractCharacter(
    extract: string,
    dir: string = global.gameDir
): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const characters: Character[] = readCharacters(dir);
    const similarNames: string[] = [];
    const characterDat: CharacterDat = readCharacterDat(extract, dir);
    const extractDir: string = path.join(dir, "0extracted", extract);
    characters.forEach((character: Character) => {
        if (character.name.includes(extract) && character.name != extract) {
            similarNames.push(character.name);
        }
    });
    
    console.log(new Date().getTime());
    getCharacterFiles(characterDat, true, false, dir, similarNames).forEach((file: string) => {
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

    toResolve.push(writeCharacterDat(
        characterDat,
        path.join(extractDir, "data", "dats")
    ));
    await Promise.allSettled(toResolve);
    return;
}

export async function removeCharacter(remove: string, dir: string = global.gameDir): Promise<void> {
    const toResolve: Promise<void>[] = [];
    const character: Character = readCharacterList(dir).getCharacterByName(remove);
    await removeAllAlts(character, dir);
    const characters: CharacterList = readCharacterList(dir);
    const characterDat: CharacterDat = readCharacterDat(remove, dir);

    const similarNames: string[] = [];
    characters.getAllCharacters().forEach((character: Character) => {
        if (character.name.startsWith(remove) && character.name != remove) {
            similarNames.push(character.name);
        }
    });

    console.log(new Date().getTime());
    getCharacterFiles(characterDat, true, true, dir, similarNames).forEach((file: string) => {
        const filePath: string = path.join(dir, file);
        toResolve.push(
            fs.remove(filePath)
        );
    });
    console.log(new Date().getTime());
    
    characters.removeCharacterByName(remove);
    toResolve.push(writeCharacters(characters.getAllCharacters(), dir));
    toResolve.push(removeCharacterCss(character, dir));
    toResolve.push(writeCharacterRandom(character.name, true, dir));
    await Promise.allSettled(toResolve);
    return;    
}

export function getCharacterRegExps(
    characterDat: CharacterDat,
    includeExtraFiles: boolean,
    ignoreSeries: boolean = false
): RegExp[] {
    const files: RegExp[] = [];
    (includeExtraFiles ? EXTRA_CHARACTER_FILES : CHARACTER_FILES).forEach((file: string) => {
        let wipString: string = file.replaceAll("<fighter>", characterDat.name);
        if (!ignoreSeries) wipString = wipString.replaceAll("<series>", characterDat.series);
        wipString = general.escapeRegex(wipString);
        wipString += "$";
        wipString = wipString.replaceAll("<audio>", "(mp3|wav|ogg)");
        wipString = wipString.replaceAll("<palette>", "\\d+");
        wipString = wipString.replaceAll("<any>", "[^\\/\\\\]+");
        files.push(new RegExp(wipString, "gmi"));
    });
    return files;
}

export function getCharacterFiles(
    characterDat: CharacterDat,
    includeExtraFiles: boolean,
    ignoreSeries: boolean,
    dir: string = global.gameDir,
    similarNames: string[] = []
): string[] {
    const characterFiles: string[] = general.getAllFiles(dir)
        .map((file: string) => path.relative(dir, file).split(path.sep).join(path.posix.sep));
    let characterFilesString: string = characterFiles.join("\n");
    const validFiles: string[] = [];
    getCharacterRegExps(characterDat, includeExtraFiles, ignoreSeries).forEach((exp: RegExp) => {
        // console.log(exp);
        for (const match of characterFilesString.matchAll(exp)) {
            // console.log(match);
            validFiles.push(match[0]);
            characterFiles.splice(characterFiles.indexOf(match[0]), 1);
        }
        characterFilesString = characterFiles.join("\n");
    });
    similarNames.forEach((name: string) => {
        const validFilesString: string = validFiles.join("\n");
        getCharacterRegExps(readCharacterDat(name, dir), includeExtraFiles, ignoreSeries)
            .forEach((exp: RegExp) => {
                for (const match of validFilesString.matchAll(exp)) {
                    validFiles.splice(validFiles.indexOf(match[0]), 1);
                }
            });
    });
    return validFiles;
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

export async function addCssPage(pageName: string, dir: string = global.gameDir): Promise<void> {
    pageName = pageName.replace(/'|"/g, "");
    const pagePath: string = path.join(
        dir, "data", "css",
        pageName.replace(/[\\/:*?|. ]/g, "-") + ".txt"
    );
    const pages: CssPage[] = readCssPages(dir);
    pages.push({ name: pageName, path: pagePath });
    await writeCssPages(pages, dir);
    if (fs.existsSync(pagePath)) {
        throw new Error("File already exists with the same names as the new CSS page.");
    }
    fs.ensureFileSync(pagePath);
    fs.writeFileSync(
        pagePath,
        BLANK_CSS_PAGE_DATA,
        { encoding: "ascii" }
    );
    return;
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
    console.log(new Date().getTime());
    for (const character of charactersToRemove) {
        console.log(character);
        await removeCharacter(character.name, dir);
    }
    for (const alt of altsToRemove) {
        console.log(alt);
        await removeCharacter(alt.alt, dir);
    }
    console.log(new Date().getTime());
    return;
}