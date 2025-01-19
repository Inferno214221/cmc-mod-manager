declare const api: typeof import("./api").default;
declare module "*.png";
declare module "*.svg";
declare module "*.css";

declare const global: {
    win: BrowserWindow,
    dialogs: BrowserWindow[],
    gameDir: string,
    appData: AppData,
    appDir: string,
    temp: string,
    confirmedClose: boolean,
    updateOnExit: boolean
    cancelFunctions: { [id: string]: () => void },
    platform: string,
    arch: string
};

interface Mod {
    name: string,
    number: number,
}

interface ModUpdate {
    name?: string,
    number?: number,
}

interface Character extends Mod {
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

interface CharacterUpdate extends ModUpdate {
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
    // TODO: this shouldn't be optional, and I should have a proper partial class but it's probably
    // not worth fixing now
    displayName?: string, // Line 1
    menuName?: string, // Line 2
    battleName?: string, //Line 3
    series?: string, // Line 4
    homeStages: string[], // After "---Classic Home Stages Below---"
    randomDatas: string[], // After "---Random Datas---""
    palettes: CharacterPalette[] // After "---From Here is Individual Palettes data---"
}

interface PartialDatInfo {
    displayName?: string,
    menuName?: string,
    battleName?: string,
    series?: string
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

interface DndDataSsNumber {
    type: DndDataType.SS_NUMBER,
    number: string,
    x: number,
    y: number
}

interface DndDataExcluded {
    type: DndDataType.EXCLUDED,
    number: string
}

type DndData = DndDataSsNumber | DndDataExcluded;

interface FoundCharacter {
    name: string,
    dat: CharacterDat,
    mug: string
}

interface FoundStage {
    name: string,
    info?: StageInfo,
    icon: string
}

interface StageInfo {
    menuName: string,
    source: string,
    series?: string
}

interface V7CharacterInfo {
    displayName: string,
    series: string
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

interface WipStage extends Mod {
    name: string,
    menuName?: string,
    source?: string,
    series?: string,
    randomSelection: boolean,
    number: number,
    icon: string
}

interface Stage extends WipStage {
    menuName: string,
    source: string,
}

interface StageUpdate extends ModUpdate {
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
    call?: (() => Promise<void>) | MainCall,
    cancelable?: boolean,
    action?: OpAction
}

interface OperationUpdate {
    id: string,
    title?: string,
    body?: string,
    image?: string,
    state?: OpState,
    cancelable?: boolean,
    action?: OpAction
}

interface OpAction {
    icon: string,
    tooltip: string,
    call: (() => Promise<void>) | MainCall
}

interface MainCall {
    name: string,
    args: any[]
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
    defaultValue?: string,
    invalidCharacters?: RegExp,
    okLabel?: string,
    cancelLabel?: string
}

interface CharacterInstallOptions extends Options {
    targetDir: string
}

interface StageInstallOptions extends Options {
    targetDir: string
}

interface StringNode {
    name: string,
    isExtra?: boolean,
    nonExhaustive?: boolean,
    contents?: StringNode[]
}

interface RegExpNode {
    pattern: RegExp,
    nonExhaustive?: boolean,
    contents?: RegExpNode[]
}