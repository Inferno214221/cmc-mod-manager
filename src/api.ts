import { ipcRenderer } from "electron"
import {
    CharacterList, CharacterDat, CssPage, CssData, Character, Download, Alt
} from "./interfaces"

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
}