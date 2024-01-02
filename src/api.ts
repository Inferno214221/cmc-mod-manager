import { ipcRenderer } from "electron"
import { CharacterList, CharacterDat } from "./interfaces"

export default {
    getGameDir:
    () => ipcRenderer.invoke("getGameDir"),
    
    getExtractedDir:
    () => ipcRenderer.invoke("getExtractedDir"),
    
    getGameVersion:
    (...args: [
        dir?: string,
        list?: string[]
    ]) => ipcRenderer.invoke("getGameVersion", args),
    
    isValidGameDir:
    (...args: [
        dir?: string
    ]) => ipcRenderer.invoke("isValidGameDir", args),
    
    selectGameDir:
    () => ipcRenderer.invoke("selectGameDir"),
    
    openDir:
    (...args: [
        dir: string
    ]) => ipcRenderer.invoke("openDir", args),
    
    runGame:
    (...args: [
        dir?: string
    ]) => ipcRenderer.invoke("runGame", args),
    
    openExternal:
    (...args: [
        url?: string,
        options?: Electron.OpenExternalOptions
    ]) => ipcRenderer.invoke("openExternal", args),
    
    getCharacters:
    (...args: [
        dir?: string
    ]) => ipcRenderer.invoke("getCharacters", args),
    
    readCharacterList:
    (...args: [
        dir?: string
    ]) => ipcRenderer.invoke("readCharacterList", args),

    writeCharacterList:
    (...args: [
        characterList: CharacterList,
        dir?: string
    ]) => ipcRenderer.invoke("writeCharacterList", args),
    
    writeCharacterRandom:
    (...args: [
        character: string,
        randomSelection: boolean,
        dir?: string
    ]) => ipcRenderer.invoke("writeCharacterRandom", args),

    installCharacterDir:
    (...args: [
        filterInstallation: boolean,
        updateCharacters: boolean,
        dir?: string
    ]) => ipcRenderer.invoke("installCharacterDir", args),

    installCharacterArchive:
    (...args: [
        filterInstallation: boolean,
        updateCharacters: boolean,
        dir?: string
    ]) => ipcRenderer.invoke("installCharacterArchive", args),

    extractCharacter:
    (...args: [
        extract: string,
        dir?: string
    ]) => ipcRenderer.invoke("extractCharacter", args),

    removeCharacter:
    (...args: [
        remove: string,
        dir?: string
    ]) => ipcRenderer.invoke("removeCharacter", args),

    getCharacterDat:
    (...args: [
        character: string,
        dir?: string
    ]) => ipcRenderer.invoke("getCharacterDat", args),

    readCharacterDat:
    (...args: [
        datPath: string,
        character?: string
    ]) => ipcRenderer.invoke("readCharacterDat", args),

    writeCharacterDat:
    (...args: [
        dat: CharacterDat,
        destination: string
    ]) => ipcRenderer.invoke("writeCharacterDat", args),

    filterCharacterFiles:
    (...args: [
        characterDat: CharacterDat,
        ignoreSeries?: boolean
    ]) => ipcRenderer.invoke("filterCharacterFiles", args),
}