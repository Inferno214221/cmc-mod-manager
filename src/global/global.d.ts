declare const api: typeof import("./api").default;
declare module "*.png";
declare module "*.jpg";
declare module "*.css";

declare const global: {
    win: BrowserWindow,
    gameDir: string,
    appData: AppData,
    appDir: string,
    temp: string,
    confirmedClose: boolean,
    updateOnExit: boolean
    cancelFunctions: { [id: string]: () => void }
};

interface Character {
    name: string,
    menuName: string,
    series: string,
    randomSelection: boolean,
    number: number,
    alts: Alt[],
    mug: string
}

interface Alt {
    base: string, // Storing base and alt would result in a recursive structure
    alt: string, //  so they are stored as characters names
    number: number,
    menuName: string,
    battleName: string,
    mug: string
}

interface CharacterUpdate {
    name?: string,
    menuName?: string,
    series?: string,
    randomSelection?: boolean,
    number?: number,
    alts?: Alt[],
    mug?: string
}

interface CharacterDat {
    name: string, // File name
    displayName: string, // Line 1
    menuName: string, // Line 2
    battleName: string, //Line 3
    series: string, // Line 4
    homeStages: string[], // After "---Classic Home Stages Below---"
    randomDatas: string[], // After "---Random Datas---""
    palettes: CharacterPalette[] // After "---From Here is Individual Palettes data---"
}

interface CharacterPalette {
    name: string,
    0: number,
    1: number,
    2: number,
    3: number,
    4: number
}

interface CssPage {
    name: string,
    path: string
}

type CssData = string[][];

interface DndData {
    type: DndDataType,
    number: string,
    x?: number,
    y?: number
}

interface AppConfig {
    enableLogs: boolean,
    altsAsCharacters: boolean,
    filterCharacterInstallation: boolean,
    updateCharacters: boolean,
    filterStageInstallation: boolean,
    updateStages: boolean
}

interface AppData {
    dir: string,
    config: AppConfig
}

interface Stage {
    name: string,
    menuName: string,
    source: string,
    series: string,
    randomSelection: boolean,
    number: number,
    icon: string
}

interface StageUpdate {
    name?: string,
    menuName?: string,
    source?: string,
    series?: string,
    randomSelection?: boolean,
    number?: number,
    icon?: string
}

interface SssPage {
    name: string,
    pageNumber: number
    data: SssData
}

type SssData = string[][];

interface Operation {
    id?: string,
    title: string,
    body: string,
    image?: string,
    state: OpState,
    icon: string,
    animation: number,
    dependencies: OpDep[],
    call: (() => Promise<void>) | MainCall,
    cancelable?: boolean
}

interface OperationUpdate {
    id: string,
    title?: string,
    body?: string,
    image?: string,
    state?: OpState,
    cancelable?: boolean
}

interface MainCall {
    name: string,
    args: []
}

interface Options {
    id: string,
    body: string,
    title?: string,
}

interface AlertOptions extends Options {
    okLabel?: string
}

interface ConfirmOptions extends Options {
    okLabel?: string,
    cancelLabel?: string
}

interface PromptOptions extends Options {
    placeholder?: string,
    invalidCharacters?: RegExp,
    okLabel?: string,
    cancelLabel?: string
}