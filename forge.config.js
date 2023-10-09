module.exports = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                authors: "Inferno214221",
                name: "cmc-mod-manager",
                iconUrl: "https://github.com/Inferno214221/CMCModManager/blob/main/gb/cmcmm.ico",
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                name: "cmc-mod-manager",
                description: "A Mod Manager For SSBC CMC+ v8 Made With Electron",
                license: "GNU General Public License v3.0",
                categories: ["Utility"],
                icon: "./gb/icon.png",
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                name: "cmc-mod-manager",
                description: "A Mod Manager For SSBC CMC+ v8 Made With Electron",
                license: "GNU General Public License v3.0",
                categories: ["Utility"],
                icon: "./gb/icon.png",
            },
        },
    ],
    hooks: {
        postPackage: async (forgeConfig, options) => {
            const fs = require("fs-extra");
            const path = require("path");
            fs.removeSync(path.join(options.outputPaths[0], "resources", "app", "gb"));
        },
    },
};
