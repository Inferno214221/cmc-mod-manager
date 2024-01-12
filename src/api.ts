import { ipcRenderer } from "electron"
import { CharacterList, CharacterDat, CssPage, CssData, Character, Download } from "./interfaces"

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
    
    getCharacters:
    (...args: [
        dir?: string
    ]): Promise<Character[]> => ipcRenderer.invoke("getCharacters", args),
    
    readCharacterList:
    (...args: [
        dir?: string
    ]): Promise<CharacterList> => ipcRenderer.invoke("readCharacterList", args),

    writeCharacterList:
    (...args: [
        characterList: CharacterList,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacterList", args),
    
    writeCharacterRandom:
    (...args: [
        character: string,
        randomSelection: boolean,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("writeCharacterRandom", args),

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

    getCharacterDat:
    (...args: [
        character: string,
        dir?: string
    ]): Promise<CharacterDat> => ipcRenderer.invoke("getCharacterDat", args),

    readCharacterDat:
    (...args: [
        datPath: string,
        character?: string
    ]): Promise<CharacterDat> => ipcRenderer.invoke("readCharacterDat", args),

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
}