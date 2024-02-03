// import { contextBridge, ipcRenderer } from "electron";
/* eslint-disable */
const electron = require("electron");

electron.contextBridge.exposeInMainWorld("dialog", {
    onStart: (callback) =>
        electron.ipcRenderer.on("dialogOnStart", (event, value) => callback(value)),
    ok: (value) => electron.ipcRenderer.invoke("dialogOk", value),
    cancel: () => electron.ipcRenderer.invoke("dialogCancel"),
    resize: (value) => electron.ipcRenderer.invoke("dialogResize", value),
});