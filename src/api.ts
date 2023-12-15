import { ipcRenderer } from "electron"

export default {
    getGameVersion: (...args: [dir: string, list: string[]]) => ipcRenderer.invoke('getGameVersion', args),
    getGameDir: () => ipcRenderer.invoke('getGameDir'),
}