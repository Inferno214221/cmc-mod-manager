export enum DndDataType {
    SS_NUMBER = "ssNumber",
    EXCLUDED = "excluded"
}

export enum ModTypes {
    CHARACTER = "Character",
    STAGE = "Stage"
}

export enum OpDep {
    FIGHTERS,
    FIGHTER_LOCK,
    ALTS,
    CSS,
    GAME_SETTINGS,
    STAGES,
    STAGE_LOCK,
    SSS,
    USER,
    USER_SLOW // For operations which don't block USER operations
}

export enum OpState {
    QUEUED = "Queued",
    STARTED = "Started",
    FINISHED = "Finished",
    CANCELED = "Canceled",
    ERROR = "Error"
}

export enum SortTypeOptions {
    NUMBER = "number",
    SERIES = "series",
    MENU_NAME = "menuName"
}

export abstract class ModList<ModType extends Mod, ModUpdateType extends ModUpdate> {
    private mods: ModType[];
    private modsByName: { [name: string]: number };
    private modsByNum: { [number: number]: number };

    constructor(mods?: ModType[]) {
        this.mods = mods || [];
        this.indexAll();
    }

    private indexAll(): void {
        this.modsByName = {};
        this.modsByNum = {};
        this.mods.forEach((mod: ModType, index: number) => {
            this.modsByName[mod.name] = index;
            this.modsByNum[mod.number] = index;
        });
    }

    toArray(): ModType[] {
        return this.mods;
    }

    getNextNumber(): number {
        return this.mods.length + 1;
    }

    add(mod: ModType): void {
        const index: number = this.mods.push(mod) - 1;
        this.modsByName[mod.name] = index;
        this.modsByNum[mod.number] = index;
    }

    getByName(name: string): ModType | undefined {
        return this.mods[this.modsByName[name]];
    }

    setByName(name: string, mod: ModType): void {
        this.mods[this.modsByName[name]] = mod;
    }

    updateByName(name: string, update: ModUpdateType): void {
        Object.assign(this.mods[this.modsByName[name]], update);
    }

    removeByName(name: string): void {
        const remove: ModType | undefined = this.getByName(name);
        if (!remove) return;
        this.mods.splice(this.modsByName[name], 1);
        for (const mod of this.mods) {
            if (mod.number > remove.number) {
                mod.number--;
            }
        }
        this.indexAll();
    }

    getByNum(number: number): ModType | undefined {
        return this.mods[this.modsByNum[number]];
    }

    setByNum(number: number, mod: ModType): void {
        this.mods[this.modsByNum[number]] = mod;
    }

    updateByNum(number: number, update: ModUpdateType): void {
        Object.assign(this.mods[this.modsByNum[number]], update);
    }

    removeByNum(number: number): void {
        const remove: ModType | undefined = this.getByNum(number);
        if (!remove) return;
        this.mods.splice(this.modsByNum[number], 1);
        for (const mod of this.mods) {
            if (mod.number > remove.number) {
                mod.number--;
            }
        }
        this.indexAll();
    }
}

export class CharacterList extends ModList<Character, CharacterUpdate> {}

export class StageList extends ModList<Stage, StageUpdate> {}

export function error(message: string): never {
    throw new Error(message);
}

export function finishOp(
    id: number,
    body: string,
    postCompletion?: PostCompletion
): ((prev: Operation[]) => Operation[]) {
    return (prev: Operation[]) => {
        const newOperations: Operation[] = [...prev];
        newOperations[id].state = OpState.FINISHED;
        newOperations[id].body = body;
        newOperations[id].postCompletion = postCompletion;
        return newOperations;
    }
}