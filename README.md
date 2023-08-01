# CMC Mod Manager

## What
This project is a WIP mod manager for Super Smash Brothers Crusade CMC+. It allows for the installation and managing of mods through a gui.
### Supported Versions
- [ ] [CMC+ v8](https://gamebanana.com/mods/50383)
- [x] [CMC+ v7.1.1](https://gamebanana.com/mods/50383)
- [x] [CMC+ Open Build](https://discord.gg/kAbEBkx5Y4)
## Why
CMC+ has good modding support and modding the game currently isn't that hard why use a mod manager? The main reason I developed this mod manager is for the CSS (Character Selection Screen) editor. Although it is certainly possible, adding characters to the CSS by hand annoyed me because of the need to find character numbers and names (if you are removing unknown characters). CMC Mod Manager allows you to add, swap or remove chracters to/from the CSS (and soon the SSS) with drag and drop.

![CSS Editor](./CSS.png)
## Installation
Go [here](https://github.com/Inferno214221/CMCModManager/releases/latest) to install the latest release of CMC Mod Manager for your operating system.
### Windows
After downloading the zip, extract it in the directory you wish to install it in and run the exe.
#### NOTE:
When installing the basegame, merging, installing mods or completing any other task that requires file system operations Windows will say that the program is not responding. This is Window's fault not mine, the program is actually doing what it is supposed to, just wait for it to finish. The program makes two copies of the game, one without mods and one with mods, so it will sometimes take a while (I'm running it on an M.2 and I still had this issue so please just be patient).
### Linux
After downloading the zip, extract it and copy the `/out/cmcmodmanager-linux-x64/` folder to where you would like to install it, e.g. `/opt` (Feel free to rename it as well). Due to CMC+ being built for windows, the default permissions are very wierd with some directories being read only. To fix this it is very important that you run `sudo chmod 777 ./* -R` in your CMC game directory before installing it with your mod manager, otherwise the program will be unable to remove some of the files it is using.
#### NOTE:
If you are having issues running SSBC / CMC+ on Linux, use wine version 6 rather than 7 or 8 and it plays perfectly (Idk what proton version).
### MacOS
Install [Asahi Linux](https://asahilinux.org/), then procede with the Linux installation steps. 
#### NOTE:
The above statement is double reverse sarcastic.
## Usage
// ensure characters are correct
## Notes
This is my first time using Electron and therefore the code is a bit of a mess sorry.
## It's not working!
// if characters are correct
// manual fix
// github bug report

///////////////////
## Features (WIP)
This mod manager works by storing a copy of the basegame and all installed mods separately and then merging them in the designated order.

When installing characters, it is likely that some mods will not work properly unless they are in the correct format. Mods should be able to be copied straight into the CMC folder to install manually.
## Progress
### Main Page (Priority: 1)
- [x] Install the unmodified version of CMC
- [x] Merge installed characters
- [x] Open basegame and merged directories in local file manager
- [x] Run both the basegame and merged version
- [x] Save and load control profiles
- [x] Determine imported game's version
- [x] Update last merge time
- [x] Persist: contols, settings, record, favourite character, css
- [x] Remove unessecary files
- [x] Make fighters.txt on export
- [ ] Make stages.txt & others on export
- [x] Alerts
- [ ] Errors
### Character Manager (Priority: 2)
- [x] Install characters from a folder (very picky)
- [x] Install characters from a zip (extract, install folder, delete)
- [x] List installed mod characters
- [x] Remove installed characters
- [x] Open installed character's directory
- [x] Change character merge priority
- [x] Delete instructions txt file on merge
- [x] RAR support - no errors
- [ ] Errors
### Character Selection Screen (Priority: 3)
- [x] Display the CSS
- [x] Display unincluded characters (not alts)
- [x] Add characters to CSS
- [x] Remove from the CSS
- [x] Sort hidden characters
- [x] Export CSS
- [x] Remove all of a franchise
- [x] Save / load layouts
- [x] Drag and Drop
- [x] Replace characters
- [x] Change the number of rows & columns
- [x] Uninstalled characters are removed when the css is updated to prevent locked icons
- [ ] Alerts
- [ ] Errors
### Alts (Priority: 7)
- [ ] IDFK how I should deal with alts
- [ ] Alerts
- [ ] Errors
### Stage Manager (Priority: 5)
- [ ] Install stages from a folder
- [ ] Install stages from a zip (extract, install folder, delete)
- [ ] Manage stage merge priority
- [ ] Alerts
- [ ] Errors
### Stage Selection Screen (Priority: 6)
- [ ] Display the SSS w/ pages
- [ ] Display unincluded stages
- [ ] Add stages to SSS
- [ ] Remove from the SSS
- [ ] Sort hidden stages
- [ ] Export SSS
- [ ] Save / load layouts
- [ ] Change the number of rows & columns
- [ ] Add pages
- [ ] Alerts
- [ ] Errors
### Items (Priority: 8?)
- [ ] Install item mods - Not many mods & idk if it works with CMC+ v7
- [ ] Remove item mods
- [ ] Alerts
- [ ] Errors
### Miscellanious Mods (Priority: 4)
- [x] Add option to import other types of mods e.g. ui changes / music
- [x] RAR support - no errors
- [ ] Errors
