# CMC Mod Manager
## What
This project is a WIP mod manager for Super Smash Brothers Crusade CMC+. (Aimed to release asap after CMC+ v8)

### Supported Versions
- [x] [CMC+ v7.1.1](https://gamebanana.com/mods/50383)
- [x] [CMC+ Open Build](https://discord.gg/kAbEBkx5Y4)
- [ ] [CMC+ v8](https://youtu.be/VCl5DMRHYbM)
- [ ] [SSBC- v2.1](https://gamebanana.com/mods/417588)
## Install
I haven't compiled this yet as it is currently unfinished, although when finished it will support Windows and Linux.
## Features (WIP)
This mod manager works by storing a copy of the basegame and all installed mods seperatly and then merging them in the designated order.

When installing characters, it is likely that some mods will not work properly unless they are in the correct format. Mods should be able to be copied straight into the CMC folder to install manually.
### Main Page (Priority: 1)
- [x] Install the unmodified version of CMC
- [x] Merge installed characters
- [x] Open basegame and merged directories in local file manager
- [x] Run both the basegame and merged version
- [x] Save and load control profiles
- [x] Determine imported game's version
- [x] Update last merge time
- [x] Persist: contols, settings, record, favourite character, css
- [x] Make fighters.txt on export
- [ ] Make stages.txt & others on export
- [x] Alerts
- [ ] Errors
- [ ] Remove unessecary files? /tools, /data/*.dat if CMC
### Character Manager (Priority: 2)
- [x] Install characters from a folder (very picky)
- [x] Install characters from a zip (extract, install folder, delete)
- [x] List installed mod characters
- [x] Remove installed characters
- [x] Open installed character's directory
- [x] Change character merge priority
- [ ] Delete instructions txt file on import
- [x] Alerts
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
- [ ] User can over write default and css currently persists, making it impossbile to reset without reimporting basegame
- [x] Change the number of rows & columns
- [x] Alerts
- [ ] Errors
### Alts (Priority: 5)
- [ ] IDFK how I should deal with alts
- [ ] Alerts
- [ ] Errors
### Stage Manager (Priority: 6)
- [ ] Install stages from a folder
- [ ] Install stages from a zip (extract, install folder, delete)
- [ ] Manage stage merge priority
- [ ] Alerts
- [ ] Errors
### Stage Selection Screen (Priority: 7)
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
- [ ] Add option to import other types of mods e.g. obama cube / ui changes
- [ ] Alerts
- [ ] Errors
## Usage
E
## Notes
This is my first time using Electron and therefore the code is a bit of a mess sorry.
