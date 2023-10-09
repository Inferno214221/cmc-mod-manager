module.exports = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                authors: "Inferno214221",
                name: "cmc-mod-manager",
                iconUrl: "https://github.com/Inferno214221/CMCModManager/blob/main/gb/cmcmm.ico",
            },
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: ["darwin","linux","win32"],
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                name: "cmc-mod-manager",
                description: "A Mod Manager For SSBC CMC+ v8 Made With Electron",
                license: "GNU General Public License v3.0",
                categories: ["Utility"],
                icon: "./gb/icon.png",
                version: "2.1.1",
            },
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {
                name: "cmc-mod-manager",
                description: "A Mod Manager For SSBC CMC+ v8 Made With Electron",
                license: "GNU General Public License v3.0",
                categories: ["Utility"],
                icon: "./gb/icon.png",
                version: "2.1.1",
            },
        },
    ],
    hooks: {
        postPackage: async (config, packageResult) => {
            const fs = require("fs-extra");
            const path = require("path");
            fs.removeSync(path.join(packageResult.outputPaths[0], "resources", "app", "gb"));
            let dataFile = path.join(packageResult.outputPaths[0], "resources", "app", "program", "data.json");
            let data = require(dataFile);
            data.platform = packageResult.platform + "-" + packageResult.arch;
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
        },
    },
};
