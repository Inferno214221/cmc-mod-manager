import { contextBridge } from "electron";
import api from "./api"

contextBridge.exposeInMainWorld("dialog", api);
contextBridge.exposeInMainWorld("options", JSON.parse(process.argv.pop()));