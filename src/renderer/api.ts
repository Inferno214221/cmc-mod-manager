import { IpcRendererEvent, ipcRenderer } from "electron";

export default {
    addAlt: ((...args: [
        base: Character,
        newAlt: Character,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("addAlt", args)),

    addCssPage: ((...args: [
        pageName: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("addCssPage", args)),

    addSssPage: ((...args: [
        pageName: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("addSssPage", args)),

    alert: ((...args: [
        options: AlertOptions
    ]): Promise<void> => ipcRenderer.invoke("alert", args)),

    cancelOperation: ((...args: [
        id: string
    ]): Promise<void> => ipcRenderer.invoke("cancelOperation", args)),

    checkForUpdates: ((): Promise<void> => ipcRenderer.invoke("checkForUpdates")),

    confirm: ((...args: [
        options: ConfirmOptions
    ]): Promise<boolean> => ipcRenderer.invoke("confirm", args)),

    confirmDestructiveAction: ((): Promise<boolean> =>
        ipcRenderer.invoke("confirmDestructiveAction")),

    downloadMod: ((...args: [
        url: string,
        modId: string,
        id: string
    ]): Promise<void> => ipcRenderer.invoke("downloadMod", args)),

    downloadUpdate: ((...args: [
        tagName: string,
        id: string
    ]): Promise<void> => ipcRenderer.invoke("downloadUpdate", args)),

    ensureAllAltsAreCharacters: ((...args: [
        areCharacter: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("ensureAllAltsAreCharacters", args)),

    ensureAltIsCharacter: ((...args: [
        alt: Alt,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("ensureAltIsCharacter", args)),

    ensureAltIsntCharacter: ((...args: [
        alt: Alt,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("ensureAltIsCharacter", args)),

    extractCharacter: ((...args: [
        extract: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("extractCharacter", args)),

    extractStage: ((...args: [
        extract: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("extractStage", args)),

    focusWindow: ((): Promise<void> => ipcRenderer.invoke("focusWindow")),

    getCharacterFiles: ((...args: [
        characterDat: CharacterDat,
        includeExtraFiles: boolean,
        ignoreSeries: boolean,
        dir?: string,
        similarNames?: string[]
    ]): Promise<string[]> => ipcRenderer.invoke("getCharacterFiles", args)),

    getCharacterRegExps: ((...args: [
        characterDat: CharacterDat,
        includeExtraFiles: boolean,
        ignoreSeries?: boolean
    ]): Promise<RegExp[]> => ipcRenderer.invoke("getCharacterRegExps", args)),

    getDownloadInfo: ((...args: [
        url: string,
        modIf: number
    ]): Promise<void> => ipcRenderer.invoke("getDownloadInfo", args)),

    getExtractedDir: ((): Promise<string> => ipcRenderer.invoke("getExtractedDir")),

    getGameDir: ((): Promise<string> => ipcRenderer.invoke("getGameDir")),

    getGameVersion: ((...args: [
        dir?: string,
        list?: string[]
    ]): Promise<string | null> => ipcRenderer.invoke("getGameVersion", args)),

    getOperations: ((... args: [
        operations: string
    ]): Promise<void> => ipcRenderer.invoke("getOperations", args)),

    getStageFiles: ((...args: [
        stage: Stage,
        ignoreSeries: boolean,
        dir?: string,
        similarName?: string[]
    ]): Promise<string[]> => ipcRenderer.invoke("getStageFiles", args)),

    getStageRegExps: ((...args: [
        stage: Stage,
        ignoreSeries?: boolean
    ]): Promise<RegExp[]> => ipcRenderer.invoke("getStageRegExps", args)),

    handleURI: ((... args: [
        uri: string
    ]): Promise<void> => ipcRenderer.invoke("handleURI", args)),

    handleProcessArgs: ((): Promise<void> => ipcRenderer.invoke("handleProcessArgs")),

    installCharacter: ((...args: [
        characterDir: string,
        filterInstallation?: boolean,
        updateCharacters?: boolean,
        dir?: string
    ]): Promise<Character> => ipcRenderer.invoke("installCharacter", args)),

    installCharacterArchive: ((...args: [
        filterInstallation: boolean,
        updateCharacters: boolean,
        dir?: string
    ]): Promise<Character> => ipcRenderer.invoke("installCharacterArchive", args)),

    installCharacterDir: ((...args: [
        filterInstallation: boolean,
        updateCharacters: boolean,
        dir?: string
    ]): Promise<Character> => ipcRenderer.invoke("installCharacterDir", args)),

    installDownloadedCharacter: ((...args: [
        targetDir: string
    ]): Promise<void> => ipcRenderer.invoke("installDownloadedCharacter", args)),

    installDownloadedStage: ((...args: [
        targetDir: string
    ]): Promise<void> => ipcRenderer.invoke("installDownloadedStage", args)),

    installStage: ((...args: [
        stageDir: string,
        filterInstallation?: boolean,
        updateCharacters?: boolean,
        dir?: string
    ]): Promise<Stage | null> => ipcRenderer.invoke("installStage", args)),

    installStageArchive: ((...args: [
        filterInstallation: boolean,
        updateStages: boolean,
        dir?: string
    ]): Promise<Stage | null> => ipcRenderer.invoke("installStageArchive", args)),

    installStageDir: ((...args: [
        filterInstallation: boolean,
        updateStages: boolean,
        dir?: string
    ]): Promise<Stage | null> => ipcRenderer.invoke("installStageDir", args)),

    installUpdate: ((...args: [
        id: string
    ]): Promise<void> => ipcRenderer.invoke("installUpdate", args)),

    isValidGameDir: ((...args: [
        dir?: string
    ]): Promise<boolean> => ipcRenderer.invoke("isValidGameDir", args)),

    openExternal: ((...args: [
        url: string,
        options?: Electron.OpenExternalOptions
    ]): Promise<void> => ipcRenderer.invoke("openExternal", args)),

    openDir: ((...args: [
        dir: string
    ]): Promise<void> => ipcRenderer.invoke("openDir", args)),

    pathJoin: ((...args: [
        ...paths: string[]
    ]): Promise<string> => ipcRenderer.invoke("pathJoin", args)),

    prompt: ((...args: [
        options: PromptOptions
    ]): Promise<string> => ipcRenderer.invoke("prompt", args)),

    readAlts: ((...args: [
        dir?: string
    ]): Promise<Alt[]> => ipcRenderer.invoke("readAlts", args)),

    readAppData: ((): Promise<AppData> => ipcRenderer.invoke("readAppData")),

    readCharacterDat: ((...args: [
        character: string,
        dir?: string
    ]): Promise<CharacterDat> => ipcRenderer.invoke("readCharacterDat", args)),

    readCharacterDatPath: ((...args: [
        datPath: string,
        character?: string
    ]): Promise<CharacterDat | null> => ipcRenderer.invoke("readCharacterDatPath", args)),

    readCharacters: ((...args: [
        dir?: string
    ]): Promise<Character[]> => ipcRenderer.invoke("readCharacters", args)),

    readCssData: ((...args: [
        page: CssPage
    ]): Promise<CssData> => ipcRenderer.invoke("readCssData", args)),

    readCssPages: ((...args: [
        dir?: string
    ]): Promise<CssPage[]> => ipcRenderer.invoke("readCssPages", args)),

    readSssPages: ((...args: [
        dir?: string
    ]): Promise<SssPage[]> => ipcRenderer.invoke("readSssPages", args)),

    readStages: ((...args: [
        dir?: string
    ]): Promise<Stage[]> => ipcRenderer.invoke("readStages", args)),

    removeAllAlts: ((...args: [
        character: Character,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeAllAlts", args)),

    removeAlt: ((...args: [
        alt: Alt,
        ensureAccessible?: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeAlt", args)),

    removeCharacter: ((...args: [
        remove: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeCharacter", args)),

    removeCharacterCss: ((...args: [
        character: Character,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeCharacterCss", args)),

    removeCssPage: ((...args: [
        page: CssPage,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeCssPage", args)),

    removeSeriesCharacters: ((...args: [
        series: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeSeriesCharacters", args)),

    removeSeriesStages: ((...args: [
        series: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeSeriesStages", args)),

    removeSssPage: ((...args: [
        page: SssPage,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeSssPage", args)),

    removeStage: ((...args: [
        remove: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeStage", args)),

    removeStageSss: ((...args: [
        page: SssPage,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeStageSss", args)),

    runGame: ((...args: [
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("runGame", args)),

    selectGameDir: ((): Promise<string | null> => ipcRenderer.invoke("selectGameDir")),

    writeAlts: ((...args: [
        alts: Alt[],
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeAlts", args)),

    writeAppData: ((...args: [
        data: AppData
    ]): Promise<void> => ipcRenderer.invoke("writeAppData", args)),

    writeCharacterDat: ((...args: [
        dat: CharacterDat,
        destination: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacterDat", args)),

    writeCharacterRandom: ((...args: [
        character: string,
        randomSelection: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacterRandom", args)),

    writeCharacter: ((...args: [
        characters: Character[],
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacter", args)),

    writeCssData: ((...args: [
        page: CssPage,
        data: CssData
    ]): Promise<void> => ipcRenderer.invoke("writeCssData", args)),

    writeCssPages: ((...args: [
        pages: CssPage[],
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCssPages", args)),

    writeSssPages: ((...args: [
        pages: SssPage[],
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeSssPages", args)),

    writeStageRandom: ((...args: [
        stage: string,
        randomSelection: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeStageRandom", args)),

    on: ((
        channel: string,
        call: ((...args: any) => void)
    ) => {
        ipcRenderer.removeAllListeners(channel);
        ipcRenderer.on(channel, (
            _event: IpcRendererEvent,
            ...args: any
        ) => call(...args));
    }),
}