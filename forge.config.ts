import type { ForgeConfig } from "@electron-forge/shared-types";
// import { MakerSquirrel } from "@electron-forge/maker-squirrel";
// import { MakerZIP } from "@electron-forge/maker-zip";
// import { MakerDeb } from "@electron-forge/maker-deb";
// import { MakerRpm } from "@electron-forge/maker-rpm";
// import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import fs from "fs-extra";
import path from "path";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const config: ForgeConfig = {
    packagerConfig: {
        asar: false,
        icon: "./gb/icon"
    },
    rebuildConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                authors: "Inferno214221",
                name: "CMC Mod Manager"
            },
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: ["darwin", "linux", "win32"],
            config: { 
                icon: "./gb/icon.ico"
            }
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                productName: "CMC Mod Manager",
                name: "cmc-mod-manager",
                description: "A mod manager for CMC+ v8 made with Electron",
                license: "GNU General Public License v3.0",
                categories: ["Utility"],
                icon: "./gb/icon.svg",
                version: "3.1.0",
                mimeType: ["x-scheme-handler/cmcmm"]
            },
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {
                productName: "CMC Mod Manager",
                name: "cmc-mod-manager",
                description: "A mod manager for CMC+ v8 made with Electron",
                license: "GNU General Public License v3.0",
                categories: ["Utility"],
                icon: "./gb/icon.svg",
                version: "3.1.0",
                mimeType: ["x-scheme-handler/cmcmm"]
            },
        },
    ],
    plugins: [
        // new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            mainConfig,
            devContentSecurityPolicy:
                "default-src'self' https://fonts.gstatic.com img://* 'unsafe-inline' \
                'unsafe-eval'",
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: "./src/renderer/renderer.html",
                        js: "./src/renderer/renderer.ts",
                        name: "main_window",
                        preload: {
                            js: "./src/renderer/preload.ts",
                        },
                    },
                    {
                        html: "./src/custom-dialogs/custom-dialogs.html",
                        js: "./src/custom-dialogs/alert.tsx",
                        name: "dialog_alert",
                        preload: {
                            js: "./src/custom-dialogs/preload.ts",
                        },
                    },
                    {
                        html: "./src/custom-dialogs/custom-dialogs.html",
                        js: "./src/custom-dialogs/confirm.tsx",
                        name: "dialog_confirm",
                        preload: {
                            js: "./src/custom-dialogs/preload.ts",
                        },
                    },
                    {
                        html: "./src/custom-dialogs/custom-dialogs.html",
                        js: "./src/custom-dialogs/prompt.tsx",
                        name: "dialog_prompt",
                        preload: {
                            js: "./src/custom-dialogs/preload.ts",
                        },
                    },
                    {
                        html: "./src/custom-dialogs/custom-dialogs.html",
                        js: "./src/custom-dialogs/installation-dialogs/character-install.tsx",
                        name: "dialog_character_install",
                        preload: {
                            js: "./src/custom-dialogs/installation-dialogs/preload.ts",
                        },
                    },
                    {
                        html: "./src/custom-dialogs/custom-dialogs.html",
                        js: "./src/custom-dialogs/installation-dialogs/stage-install.tsx",
                        name: "dialog_stage_install",
                        preload: {
                            js: "./src/custom-dialogs/installation-dialogs/preload.ts",
                        },
                    }
                ],
            },
        }),
    ],
    hooks: {
        generateAssets: async (_config: any, platform: string, arch: string) => {
            fs.writeFileSync(
                "build.json",
                JSON.stringify({
                    platform: platform,
                    arch: arch
                }, null, 2),
                { encoding: "utf-8" }
            );
        },
        postPackage: async (_config: any, packageResult: any) => {
            fs.copySync(
                path.join(__dirname, "LICENSE"),
                path.join(packageResult.outputPaths[0], "LICENSE"),
                { overwrite: true }
            );
            let updateScript: string = "update.";
            switch (packageResult.platform) {
                case "win32":
                    updateScript += "bat";
                    break;
                case "linux":
                    fs.copySync(
                        path.join(__dirname, "src", "assets", "cmc-mod-manager.desktop"),
                        path.join(packageResult.outputPaths[0], "cmc-mod-manager.desktop"),
                        { overwrite: true }
                    );
                    fs.copySync(
                        path.join(__dirname, "src", "assets", "icon.svg"),
                        path.join(packageResult.outputPaths[0], "cmc-mod-manager.svg"),
                        { overwrite: true }
                    );
                    updateScript += "sh";
                    break;
                default:
                    throw new Error("Invalid platform");
            }
            fs.copySync(
                path.join(__dirname, "src", "updater", updateScript),
                path.join(packageResult.outputPaths[0], "updater", updateScript),
                { overwrite: true }
            );
        },
    },
};

export default config;
