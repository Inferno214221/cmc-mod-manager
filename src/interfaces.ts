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

    addCharacter(character: Character): void {
        const index = this.characters.push(character) - 1;
        this.charactersByName[character.name] = index;
        this.charactersByNum[character.cssNumber] = index;
    }

    getCharacterByName(name: string): Character {
        return this.characters[this.charactersByName[name]];
    }

    setCharacterByName(name: string, character: Character): void {
        this.characters[this.charactersByName[name]] = character;
    }

    updateCharacterByName(name: string, character: CharacterUpdate): void {
        Object.assign(this.characters[this.charactersByName[name]], character);
    }

    removeCharacterByName(name: string): void {
        console.log(name);
        // TODO:
    }

    getCharacterByNum(cssNumber: number): Character {
        return this.characters[this.charactersByNum[cssNumber]];
    }

    setCharacterByNum(cssNumber: number, character: Character): void {
        this.characters[this.charactersByNum[cssNumber]] = character;
    }

    updateCharacterByNum(cssNumber: number, character: CharacterUpdate): void {
        Object.assign(this.characters[this.charactersByNum[cssNumber]], character);
    }

    removeCharacterByNum(cssNumber: number): void {
        console.log(cssNumber);
        // TODO:
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

export enum SortTypes {
    cssNumber = "cssNumber",
    series = "series",
    displayName = "displayName"
}