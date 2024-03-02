import { IpcRendererEvent, ipcRenderer } from "electron";

export default {
    onStart: (
        callback: ( options: AnyOptions ) => void
    ) => ipcRenderer.on("dialogOnStart", (
        _event: IpcRendererEvent,
        options: AnyOptions
    ) => callback(options)),
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