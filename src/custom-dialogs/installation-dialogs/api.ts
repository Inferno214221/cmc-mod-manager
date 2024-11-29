import { ipcRenderer } from "electron";

export default {
    findCharacters: ((...args: [
        targetDir: string
    ]): Promise<FoundCharacter[]> => ipcRenderer.invoke("findCharacters", args)),


    findStages: ((...args: [
        targetDir: string
    ]): Promise<FoundStage[]> => ipcRenderer.invoke("findStages", args)),

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

    queStageInstallation: ((...args: [
        targetDir: string,
        foundStage: FoundStage,
        filterInstallation: boolean,
        updateStages: boolean,
        location: string,
        dir?: string
    ]): Promise<void> => ipcRenderer.invoke("queStageInstallation", args)),

    readAlts: ((...args: [
        dir?: string
    ]): Promise<Alt[]> => ipcRenderer.invoke("readAlts", args)),

    readCharacters: ((...args: [
        dir?: string
    ]): Promise<Character[]> => ipcRenderer.invoke("readCharacters", args)),

    readStages: ((...args: [
        dir?: string
    ]): Promise<Stage[]> => ipcRenderer.invoke("readStages", args)),
}