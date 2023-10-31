module.exports = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                authors: "Inferno214221",
                name: "CMC Mod Manager",
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
                productName: "CMC Mod Manager",
                name: "cmc-mod-manager",
                description: "A mod manager for CMC+ v8 made with Electron",
                license: "GNU General Public License v3.0",
                categories: ["Utility"],
                icon: "./gb/icon.png",
                version: "2.2.0",
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
                icon: "./gb/icon.png",
                version: "2.2.0",
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
