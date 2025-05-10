import { contextBridge } from "electron";
import api from "./api";

contextBridge.exposeInMainWorld("dialog", api);
// I've just removed the attempts at error handling here, preload doesn't throw them anywhere
// visible or useful.
contextBridge.exposeInMainWorld("options", JSON.parse(process.argv.pop()!));