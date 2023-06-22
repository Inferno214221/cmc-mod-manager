module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: "Inferno214221",
        // exe: "cmc-mod-manager.exe",
        name: "cmc-mod-manager",
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        name: "cmc-mod-manager",
        description: "A WIP Mod Manager For SSBC CMC+ v7 Made With Electron",
        license: "GNU General Public License v3.0",
        categories: ["Utility"],
      },
    },
  ],
};
