import { contextBridge } from "electron";
import api from "./api";
import { error } from "../global/global";

contextBridge.exposeInMainWorld("dialog", api);
contextBridge.exposeInMainWorld("options",
    JSON.parse(process.argv.pop() ?? error("No process args found."))
);