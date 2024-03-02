// import { contextBridge, ipcRenderer } from "electron";
/* eslint-disable */
const electron = require("electron");

electron.contextBridge.exposeInMainWorld("dialog", {
    onStart: (callback) =>
        electron.ipcRenderer.on("dialogOnStart", (event, value) => callback(value)),
    ok: (id, value) => electron.ipcRenderer.invoke(id + "_dialogOk", value),
    cancel: (id) => electron.ipcRenderer.invoke(id + "_dialogCancel"),
    resize: (id, value) => electron.ipcRenderer.invoke(id + "_dialogResize", value),
});