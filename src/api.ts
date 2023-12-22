import { ipcRenderer } from "electron"

export default {
    getGameDir: () =>
        ipcRenderer.invoke("getGameDir"),
    getGameVersion: (...args: [dir?: string, list?: string[]]) =>
        ipcRenderer.invoke("getGameVersion", args),
    isValidGameDir: (...args: [dir?: string]) =>
        ipcRenderer.invoke("isValidGameDir", args),
    selectGameDir: () =>
        ipcRenderer.invoke("selectGameDir"),
    openDir: (...args: [dir: string]) =>
        ipcRenderer.invoke("openDir", args),
    runGame: (...args: [dir?: string]) =>
        ipcRenderer.invoke("runGame", args),
    openExternal: (...args: [url?: string, options?: Electron.OpenExternalOptions]) => 
        ipcRenderer.invoke("openExternal", args),
    getCharacters: (...args: [dir?: string]) =>
        ipcRenderer.invoke("getCharacters", args),
}