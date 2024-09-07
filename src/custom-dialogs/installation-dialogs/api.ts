import { ipcRenderer } from "electron";

export default {
    findCharacters: ((...args: [
        targetDir: string
    ]): Promise<FoundCharacter[]> => ipcRenderer.invoke("findCharacters", args)),

    // installCharacterDialog: ((...args: [
    //     targetDir: string,
    //     character: FoundCharacter,
    //     dir?: string
    // ]): Promise<void> => ipcRenderer.invoke("installCharacterDialog", args)),

    pathJoin: ((...args: [
        ...paths: string[]
    ]): Promise<string> => ipcRenderer.invoke("pathJoin", args)),

    queCharacterInstallation: ((...args: [
        targetDir: string,
        foundCharacter: FoundCharacter,
        filterInstallation: boolean,
        updateCharacters: boolean,
        location: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("queCharacterInstallation", args)),

    readAlts: ((...args: [
        dir?: string
    ]): Promise<Alt[]> => ipcRenderer.invoke("readAlts", args)),

    readCharacters: ((...args: [
        dir?: string
    ]): Promise<Character[]> => ipcRenderer.invoke("readCharacters", args)),
}