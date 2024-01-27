export interface Character {
    name: string,
    menuName: string,
    series: string,
    randomSelection: boolean,
    cssNumber: number,
    alts: Alt[],
    mug: string
}

export interface Alt {
    base: string, // Storing base and alt would result in a recursive structure
    alt: string, //  so they are stored as characters names
    number: number,
    menuName: string,
    battleName: string,
    mug: string
}

export interface CharacterUpdate {
    name?: string,
    menuName?: string,
    series?: string,
    randomSelection?: boolean,
    cssNumber?: number,
    alts?: Alt[],
    mug?: string
}

export class CharacterList {
    private characters: Character[];
    private charactersByName: { [name: string]: number };
    private charactersByNum: { [cssNumber: number]: number };
    
    // RIP overloads cause of JS
    constructor(characters?: Character[]) {
        this.characters = characters || [];
        this.indexAllCharacters();
    }

    private indexAllCharacters(): void {
        this.charactersByName = {};
        this.charactersByNum = {};
        this.characters.forEach((character: Character, index: number) => {
            this.charactersByName[character.name] = index;
            this.charactersByNum[character.cssNumber] = index;
        });
    }

    getAllCharacters(): Character[] {
        return this.characters;
    }

    getNextCssNumber(): number {
        return this.characters.length + 1;
    }

    addCharacter(character: Character): void {
        const index: number = this.characters.push(character) - 1;
        this.charactersByName[character.name] = index;
        this.charactersByNum[character.cssNumber] = index;
    }

    getCharacterByName(name: string): Character {
        return this.characters[this.charactersByName[name]];
    }

    setCharacterByName(name: string, character: Character): void {
        this.characters[this.charactersByName[name]] = character;
    }

    updateCharacterByName(name: string, update: CharacterUpdate): void {
        Object.assign(this.characters[this.charactersByName[name]], update);
    }

    removeCharacterByName(name: string): void {
        const remove: Character = this.getCharacterByName(name);
        this.characters.splice(this.charactersByName[name], 1);
        for (const character of this.characters) {
            if (character.cssNumber > remove.cssNumber) {
                character.cssNumber--;
            }
        }
        this.indexAllCharacters();
    }

    getCharacterByNum(cssNumber: number): Character {
        return this.characters[this.charactersByNum[cssNumber]];
    }

    setCharacterByNum(cssNumber: number, character: Character): void {
        this.characters[this.charactersByNum[cssNumber]] = character;
    }

    updateCharacterByNum(cssNumber: number, update: CharacterUpdate): void {
        Object.assign(this.characters[this.charactersByNum[cssNumber]], update);
    }

    removeCharacterByNum(cssNumber: number): void {
        const remove: Character = this.getCharacterByNum(cssNumber);
        this.characters.splice(this.charactersByNum[cssNumber], 1);
        for (const character of this.characters) {
            if (character.cssNumber > remove.cssNumber) {
                character.cssNumber--;
            }
        }
        this.indexAllCharacters();
    }
}

export interface CharacterDat {
    name: string, // File name
    displayName: string, // Line 1
    menuName: string, // Line 2
    battleName: string, //Line 3
    series: string, // Line 4
    homeStages: string[], // After "---Classic Home Stages Below---"
    randomDatas: string[], // After "---Random Datas---""
    palettes: CharacterPalette[] // After "---From Here is Individual Palettes data---"
}

export interface CharacterPalette {
    name: string,
    0: number,
    1: number,
    2: number,
    3: number,
    4: number
}

export interface CssPage {
    name: string,
    path: string
}

export type CssData = string[][];

export enum SortTypeOptions {
    cssNumber = "cssNumber",
    series = "series",
    menuName = "menuName"
}

export const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.cssNumber,
    SortTypeOptions.series,
    SortTypeOptions.menuName
];

export interface Download {
    filePath: string,
    name: string,
    image: string,
    modType: string,
    fileSize: number,
    state: DownloadState,
}

export enum DownloadState {
    queued = "Queued",
    started = "Started",
    finished = "Finished",
    error = "Error"
}

export interface DndData {
    type: DndDataType,
    cssNumber: string,
    x?: number,
    y?: number
}

export enum DndDataType {
    cssCharacter = "cssCharacter",
    excludedCharacter = "excludedCharacter"
}

export interface AppConfig {
    enableLogs: boolean,
    altsAsCharacters: boolean,
    useUnbinner: boolean,
    moveBins: boolean,
    filterCharacterInstallation: boolean,
    updateCharacters: boolean,
    filterStageInstallation: boolean,
    updateStages: boolean
}

export interface AppData {
    dir: string,
    config: AppConfig
}

export interface Stage {
    name: string,
    menuName: string,
    source: string,
    series: string,
    randomSelection: boolean,
    cssNumber: number,
    icon: string
}

export interface StageUpdate {
    name?: string,
    menuName?: string,
    source?: string,
    series?: string,
    randomSelection?: boolean,
    cssNumber?: number,
    icon?: string
}

export class StageList {
    private stages: Stage[];
    private stagesByName: { [name: string]: number };
    private stagesByNum: { [cssNumber: number]: number };
    
    constructor(stages?: Stage[]) {
        this.stages = stages || [];
        this.indexAllStages();
    }

    private indexAllStages(): void {
        this.stagesByName = {};
        this.stagesByNum = {};
        this.stages.forEach((stage: Stage, index: number) => {
            this.stagesByName[stage.name] = index;
            this.stagesByNum[stage.cssNumber] = index;
        });
    }

    getAllStages(): Stage[] {
        return this.stages;
    }

    getNextCssNumber(): number {
        return this.stages.length + 1;
    }

    addStage(stage: Stage): void {
        const index: number = this.stages.push(stage) - 1;
        this.stagesByName[stage.name] = index;
        this.stagesByNum[stage.cssNumber] = index;
    }

    getStageByName(name: string): Stage {
        return this.stages[this.stagesByName[name]];
    }

    setStageByName(name: string, stage: Stage): void {
        this.stages[this.stagesByName[name]] = stage;
    }

    updateStageByName(name: string, update: StageUpdate): void {
        Object.assign(this.stages[this.stagesByName[name]], update);
    }

    removeStageByName(name: string): void {
        const remove: Stage = this.getStageByName(name);
        this.stages.splice(this.stagesByName[name], 1);
        for (const stage of this.stages) {
            if (stage.cssNumber > remove.cssNumber) {
                stage.cssNumber--;
            }
        }
        this.indexAllStages();
    }

    getStageByNum(cssNumber: number): Stage {
        return this.stages[this.stagesByNum[cssNumber]];
    }

    setStageByNum(cssNumber: number, stage: Stage): void {
        this.stages[this.stagesByNum[cssNumber]] = stage;
    }

    updateStageByNum(cssNumber: number, update: StageUpdate): void {
        Object.assign(this.stages[this.stagesByNum[cssNumber]], update);
    }

    removeStageByNum(cssNumber: number): void {
        const remove: Stage = this.getStageByNum(cssNumber);
        this.stages.splice(this.stagesByNum[cssNumber], 1);
        for (const stage of this.stages) {
            if (stage.cssNumber > remove.cssNumber) {
                stage.cssNumber--;
            }
        }
        this.indexAllStages();
    }
}