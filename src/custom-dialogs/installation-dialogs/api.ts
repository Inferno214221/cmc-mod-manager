import { ipcRenderer } from "electron";

export default {
    findCharacters: ((...args: [
        targetDir: string
    ]): Promise<FoundCharacter[]> => ipcRenderer.invoke("findCharacters", args)),

    installCharacterDialog: ((...args: [
        targetDir: string,
        character: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("installCharacterDialog", args)),

    pathJoin: ((...args: [
        ...paths: string[]
    ]): Promise<string> => ipcRenderer.invoke("pathJoin", args)),

    readCharacters: ((...args: [
        dir?: string
    ]): Promise<Character[]> => ipcRenderer.invoke("readCharacters", args)),
}