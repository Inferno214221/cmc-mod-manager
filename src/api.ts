// import { ipcRenderer } from "electron";
// import * as main from "./main";

// require.resolve("./unrar.wasm");

// const API: any = {};
// Object.keys(main).forEach((func: keyof typeof import("./main")) => {
//     /* eslint-disable import/namespace */
//     if (typeof main[func] != "function") return;
//     if (main[func].length == 0) {
//         API[func] = (): Promise<ReturnType<typeof main[keyof typeof main]>> =>
//             ipcRenderer.invoke(func);
//         return;
//     }
//     API[func] = (
//         ...args: Parameters<typeof main[keyof typeof main]>
//     ): Promise<ReturnType<typeof main[keyof typeof main]>> =>
//         ipcRenderer.invoke(func, args);
// });

// API.pathJoin = (
//     args: any
// ): any => ipcRenderer.invoke("pathJoin", args);

// // API.pathJoin = (
// //     args: Parameters<typeof path.join>
// // ): Promise<ReturnType<typeof path.join>> => ipcRenderer.invoke("pathJoin", args);

// API.openExternal = (
//     args: any
// ): any => ipcRenderer.invoke("openExternal", args);

// // API.openExternal = (
// //     args: Parameters<typeof import("electron").shell.openExternal>
// // ): Promise<ReturnType<typeof import("electron").openExternal>> =>
// //     ipcRenderer.invoke("openExternal", args);

// export default API;

import { ipcRenderer } from "electron";
import {
    CharacterList, CharacterDat, CssPage, CssData, Character, Download, Alt, AppData
} from "./interfaces";

// console.log(API);

export default {
    getGameDir:
    (): Promise<string> => ipcRenderer.invoke("getGameDir"),
    
    getExtractedDir:
    (): Promise<string> => ipcRenderer.invoke("getExtractedDir"),

    getDownloads:
    (): Promise<Download[]> => ipcRenderer.invoke("getDownloads"),
    
    getGameVersion:
    (...args: [
        dir?: string,
        list?: string[]
    ]): Promise<string | null> => ipcRenderer.invoke("getGameVersion", args),
    
    isValidGameDir:
    (...args: [
        dir?: string
    ]): Promise<boolean> => ipcRenderer.invoke("isValidGameDir", args),
    
    selectGameDir:
    (): Promise<string | null> => ipcRenderer.invoke("selectGameDir"),
    
    openDir:
    (...args: [
        dir: string
    ]): Promise<void> => ipcRenderer.invoke("openDir", args),
    
    runGame:
    (...args: [
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("runGame", args),
    
    openExternal:
    (...args: [
        url?: string,
        options?: Electron.OpenExternalOptions
    ]): Promise<void> => ipcRenderer.invoke("openExternal", args),

    pathJoin:
    (...args: [
        ...paths: string[]
    ]): Promise<string> => ipcRenderer.invoke("pathJoin", args),
    
    readCharacters:
    (...args: [
        dir?: string
    ]): Promise<Character[]> => ipcRenderer.invoke("readCharacters", args),
    
    readCharacterList:
    (...args: [
        dir?: string
    ]): Promise<CharacterList> => ipcRenderer.invoke("readCharacterList", args),

    writeCharacters:
    (...args: [
        characterList: CharacterList,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacters", args),
    
    writeCharacterRandom:
    (...args: [
        character: string,
        randomSelection: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacterRandom", args),

    readAlts:
    (...args: [
        dir?: string
    ]): Promise<Character[]> => ipcRenderer.invoke("readAlts", args),

    writeAlts:
    (...args: [
        alts: Alt[],
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeAlts", args),

    addAlt:
    (...args: [
        base: Character,
        newAlt: Character,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("addAlt", args),
    
    removeAlt:
    (...args: [
        alt: Alt,
        ensureAccessible?: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeAlt", args),

    installCharacterDir:
    (...args: [
        filterInstallation: boolean,
        updateCharacters: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("installCharacterDir", args),

    installCharacterArchive:
    (...args: [
        filterInstallation: boolean,
        updateCharacters: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("installCharacterArchive", args),

    extractCharacter:
    (...args: [
        extract: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("extractCharacter", args),

    removeCharacter:
    (...args: [
        remove: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeCharacter", args),

    readCharacterDat:
    (...args: [
        character: string,
        dir?: string
    ]): Promise<CharacterDat> => ipcRenderer.invoke("readCharacterDat", args),

    readCharacterDatPath:
    (...args: [
        datPath: string,
        character?: string
    ]): Promise<CharacterDat> => ipcRenderer.invoke("readCharacterDatPath", args),

    writeCharacterDat:
    (...args: [
        dat: CharacterDat,
        destination: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacterDat", args),

    readCssPages:
    (...args: [
        dir?: string
    ]): Promise<CssPage[]> => ipcRenderer.invoke("readCssPages", args),

    writeCssPages:
    (...args: [
        pages: CssPage[],
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCssPages", args),

    addCssPage:
    (...args: [
        pageName: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("addCssPage", args),

    removeCssPage:
    (...args: [
        page: CssPage,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeCssPage", args),

    readCssData:
    (...args: [
        page: CssPage
    ]): Promise<CssData> => ipcRenderer.invoke("readCssData", args),

    writeCssData:
    (...args: [
        page: CssPage,
        data: CssData
    ]): Promise<void> => ipcRenderer.invoke("writeCssData", args),

    removeSeries:
    (...args: [
        series: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("removeSeries", args),

    getCharacterRegExps:
    (...args: [
        characterDat: CharacterDat,
        includeExtraFiles: boolean,
        ignoreSeries: boolean
    ]): Promise<void> => ipcRenderer.invoke("getCharacterRegExps", args),

    readAppData:
    (): Promise<AppData> => ipcRenderer.invoke("readAppData"),

    writeAppData:
    (...args: [
        data: AppData
    ]): Promise<void> => ipcRenderer.invoke("writeAppData", args),

    isURIAssociated:
    (): Promise<boolean> => ipcRenderer.invoke("isURIAssociated"),
}