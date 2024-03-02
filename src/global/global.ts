export enum DndDataType {
    ssNumber = "ssNumber",
    excluded = "excluded"
}

export enum ModType {
    character = "Character",
    stage = "Stage"
}

export enum OpDep {
    fighters,
    fighterLock,
    alts,
    css,
    gameSettings,
    stages,
    stageLock,
    sss
}

export enum OpState {
    queued = "Queued",
    started = "Started",
    finished = "Finished",
    canceled = "Canceled",
    error = "Error"
}

export enum SortTypeOptions {
    number = "number",
    series = "series",
    menuName = "menuName"
}

export class CharacterList {
    private characters: Character[];
    private charactersByName: { [name: string]: number };
    private charactersByNum: { [number: number]: number };
    
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
            this.charactersByNum[character.number] = index;
        });
    }

    getAllCharacters(): Character[] {
        return this.characters;
    }

    getNextNumber(): number {
        return this.characters.length + 1;
    }

    addCharacter(character: Character): void {
        const index: number = this.characters.push(character) - 1;
        this.charactersByName[character.name] = index;
        this.charactersByNum[character.number] = index;
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
            if (character.number > remove.number) {
                character.number--;
            }
        }
        this.indexAllCharacters();
    }

    getCharacterByNum(number: number): Character {
        return this.characters[this.charactersByNum[number]];
    }

    setCharacterByNum(number: number, character: Character): void {
        this.characters[this.charactersByNum[number]] = character;
    }

    updateCharacterByNum(number: number, update: CharacterUpdate): void {
        Object.assign(this.characters[this.charactersByNum[number]], update);
    }

    removeCharacterByNum(number: number): void {
        const remove: Character = this.getCharacterByNum(number);
        this.characters.splice(this.charactersByNum[number], 1);
        for (const character of this.characters) {
            if (character.number > remove.number) {
                character.number--;
            }
        }
        this.indexAllCharacters();
    }
}

export class StageList {
    private stages: Stage[];
    private stagesByName: { [name: string]: number };
    private stagesByNum: { [number: number]: number };
    
    constructor(stages?: Stage[]) {
        this.stages = stages || [];
        this.indexAllStages();
    }

    private indexAllStages(): void {
        this.stagesByName = {};
        this.stagesByNum = {};
        this.stages.forEach((stage: Stage, index: number) => {
            this.stagesByName[stage.name] = index;
            this.stagesByNum[stage.number] = index;
        });
    }

    getAllStages(): Stage[] {
        return this.stages;
    }

    getNextNumber(): number {
        return this.stages.length + 1;
    }

    addStage(stage: Stage): void {
        const index: number = this.stages.push(stage) - 1;
        this.stagesByName[stage.name] = index;
        this.stagesByNum[stage.number] = index;
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
            if (stage.number > remove.number) {
                stage.number--;
            }
        }
        this.indexAllStages();
    }

    getStageByNum(number: number): Stage {
        return this.stages[this.stagesByNum[number]];
    }

    setStageByNum(number: number, stage: Stage): void {
        this.stages[this.stagesByNum[number]] = stage;
    }

    updateStageByNum(number: number, update: StageUpdate): void {
        Object.assign(this.stages[this.stagesByNum[number]], update);
    }

    removeStageByNum(number: number): void {
        const remove: Stage = this.getStageByNum(number);
        this.stages.splice(this.stagesByNum[number], 1);
        for (const stage of this.stages) {
            if (stage.number > remove.number) {
                stage.number--;
            }
        }
        this.indexAllStages();
    }
}
