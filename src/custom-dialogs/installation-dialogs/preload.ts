import { contextBridge } from "electron";
import api from "./api";

import "../preload";

contextBridge.exposeInMainWorld("api", api);