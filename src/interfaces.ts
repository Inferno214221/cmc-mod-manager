export interface Character {
    name: string,
    displayName: string,
    series: string,
    randomSelection: boolean,
    cssNumber: number,
    // alts: []
    mug: string
}

export interface CharacterUpdate {
    name?: string,
    displayName?: string,
    series?: string,
    randomSelection?: boolean,
    cssNumber?: number,
    // alts?: []
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

export enum SortTypes {
    cssNumber = "cssNumber",
    series = "series",
    displayName = "displayName"
}

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