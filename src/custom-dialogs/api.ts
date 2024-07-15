import { ipcRenderer } from "electron";

export default {
    ok: (
        id: string,
        value: any
    ) => ipcRenderer.invoke(id + "_dialogOk", value),
    cancel: (
        id: string
    ) => ipcRenderer.invoke(id + "_dialogCancel"),
    resize: (
        id: string,
        size: number
    ) => ipcRenderer.invoke(id + "_dialogResize", size),
}