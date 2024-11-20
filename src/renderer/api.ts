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
    ]): Promise<CssPage> => ipcRenderer.invoke("addCssPage", args)),

    addSssPage: ((...args: [
        pageName: string,
        dir?: string
    ]): Promise<CssPage> => ipcRenderer.invoke("addSssPage", args)),

    alert: ((...args: [
        options: AlertOptions
    ]): Promise<void> => ipcRenderer.invoke("alert", args)),

    cancelOperation: ((...args: [
        id: string
    ]): Promise<void> => ipcRenderer.invoke("cancelOperation", args)),

    characterInstallation: ((...args: [
        targetDir: string
    ]): Promise<void> => ipcRenderer.invoke("characterInstallation", args)),

    characterInstallationOp: ((...args: [
        targetDir: string,
        id: string
    ]): Promise<void> => ipcRenderer.invoke("characterInstallationOp", args)),

    checkForUpdates: ((): Promise<void> => ipcRenderer.invoke("checkForUpdates")),

    confirm: ((...args: [
        options: ConfirmOptions
    ]): Promise<boolean> => ipcRenderer.invoke("confirm", args)),

    confirmDestructiveAction: ((): Promise<boolean> =>
        ipcRenderer.invoke("confirmDestructiveAction")),

    correctCharacterDir: ((...args: [
        targetDir: string
    ]): Promise<string> => ipcRenderer.invoke("correctCharacterDir", args)),

    correctStageDir: ((...args: [
        targetDir: string
    ]): Promise<string> => ipcRenderer.invoke("correctStageDir", args)),

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
    ]): Promise<string> => ipcRenderer.invoke("extractCharacter", args)),

    extractStage: ((...args: [
        extract: string,
        dir?: string
    ]): Promise<string> => ipcRenderer.invoke("extractStage", args)),

    findCharacters: ((...args: [
        targetDir: string
    ]): Promise<FoundCharacter[]> => ipcRenderer.invoke("findCharacters", args)),

    findStages: ((...args: [
        targetDir: string
    ]): Promise<string[]> => ipcRenderer.invoke("findStages", args)),

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

    getMissingDatInfo: ((...args: [
        dat: CharacterDat,
        targetDir: string
    ]): Promise<CharacterDat> => ipcRenderer.invoke("getMissingDatInfo", args)),

    getMissingStageInfo: ((...args: [
        stage: Stage,
        targetDir: string
    ]): Promise<Stage> => ipcRenderer.invoke("getMissingStageInfo", args)),

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
        uri: string | undefined
    ]): Promise<void> => ipcRenderer.invoke("handleURI", args)),

    handleProcessArgs: ((): Promise<void> => ipcRenderer.invoke("handleProcessArgs")),

    installCharacter: ((...args: [
        targetDir: string,
        foundCharacter: FoundCharacter,
        filterInstallation: boolean,
        updateCharacters: boolean,
        dir?: string
    ]): Promise<Character | null> => ipcRenderer.invoke("installCharacter", args)),

    installCharacters: ((...args: [
        targetDir: string,
        filterInstallation: boolean,
        updateCharacters: boolean,
        location: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("installCharacters", args)),

    installCharacterOp: ((...args: [
        targetDir: string,
        foundCharacter: FoundCharacter,
        filterInstallation: boolean,
        updateCharacters: boolean,
        id: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("installCharacterOp", args)),

    installDownloadedCharacters: ((...args: [
        targetDir: string
    ]): Promise<void> => ipcRenderer.invoke("installDownloadedCharacters", args)),

    installStage: ((...args: [
        targetDir: string,
        foundStage: string,
        filterInstallation: boolean,
        updateStages: boolean,
        dir?: string
    ]): Promise<Stage | null> => ipcRenderer.invoke("installStage", args)),

    installStages: ((...args: [
        targetDir: string,
        filterInstallation: boolean,
        updateStages: boolean,
        location: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("installStages", args)),

    installStageOp: ((...args: [
        targetDir: string,
        foundStage: string,
        filterInstallation: boolean,
        updateStages: boolean,
        id: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("installStageOp", args)),

    installDownloadedStages: ((...args: [
        targetDir: string
    ]): Promise<void> => ipcRenderer.invoke("installDownloadedStages", args)),

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
    ]): Promise<string | undefined> => ipcRenderer.invoke("prompt", args)),

    queCharacterInstallation: ((...args: [
        targetDir: string,
        foundCharacter: FoundCharacter,
        filterInstallation: boolean,
        updateCharacters: boolean,
        location: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("queCharacterInstallation", args)),

    queStageInstallation: ((...args: [
        target: string,
        foundStage: string,
        filterInstallation: boolean,
        updateStages: boolean,
        location: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("queStageInstallation", args)),

    readAlts: ((...args: [
        dir?: string
    ]): Promise<Alt[]> => ipcRenderer.invoke("readAlts", args)),

    readAppData: ((): Promise<AppData> => ipcRenderer.invoke("readAppData")),

    readCharacterDat: ((...args: [
        character: string,
        dir?: string
    ]): Promise<CharacterDat | null> => ipcRenderer.invoke("readCharacterDat", args)),

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

    renameCssPage: ((...args: [
        index: number,
        pageName: string,
        dir?: string
    ]): Promise<CssPage> => ipcRenderer.invoke("renameCssPage", args)),

    renameSssPage: ((...args: [
        index: number,
        pageName: string,
        dir?: string
    ]): Promise<SssPage> => ipcRenderer.invoke("renameSssPage", args)),

    reorderCssPage: ((...args: [
        from: number,
        to: number,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("reorderCssPage", args)),

    reorderSssPage: ((...args: [
        from: number,
        to: number,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("reorderSssPage", args)),

    runGame: ((...args: [
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("runGame", args)),

    selectAndInstallCharacters: ((...args: [
        filterInstallation?: boolean,
        updateCharacters?: boolean,
        fromArchive?: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("selectAndInstallCharacters", args)),

    selectAndInstallStages: ((...args: [
        filterInstallation?: boolean,
        updateStages?: boolean,
        fromArchive?: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("selectAndInstallStages", args)),

    selectGameDir: ((): Promise<string | null> => ipcRenderer.invoke("selectGameDir")),

    selectPathsArch: ((): Promise<string[]> => ipcRenderer.invoke("selectPathsArch")),

    selectPathsDir: ((): Promise<string[]> => ipcRenderer.invoke("selectPathsDir")),

    v7CharacterLookup: ((...args: [
        name: string
    ]): Promise<V7CharacterInfo> => ipcRenderer.invoke("v7CharacterLookup", args)),

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