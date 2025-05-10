import { IpcRendererEvent, ipcRenderer } from "electron";

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

    on: ((
        channel: string,
        call: ((...args: any) => void)
    ) => {
        ipcRenderer.removeAllListeners(channel);
        ipcRenderer.on(channel, (
            _event: IpcRendererEvent,
            ...args: any
        ) => call(...args));
    }),

    readAppData: ((): Promise<AppData> => ipcRenderer.invoke("readAppData")),
}