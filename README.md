# CMC Mod Manager
![Downloads](https://img.shields.io/github/downloads/Inferno214221/CMCModManager/total?logo=github&logoColor=white&style=flat&label=Downloads&color=%232284F2)

Usage of this mod manager will 'spoil' the hidden characters as they are displayed in the program without the locked icon.
## Why 2.X.X already?
According to [SemVer](https://semver.org/), the first digit is used to represent a Major change that is incompatible with previous versions. I am releasing version 2.0.0 because I re-wrote the entire program (excluding the interface) so that it is more logical. Rather than making two copies of the CMC+ install, differentiating between builtin and installed characters, and storing information about every installed mod version 2.0.0 modifies the CMC+ installation it is given (making no copies) and uses the game's storage format to allow the same operations on all characters. Because of this, version two has a different file structure. Additionally, support for versions below CMC+ v8 has been dropped in CMC Mod Manager 2.0, because of the differences in features. If a CMC+ v7 character is installed with the mod manager, it's dat file will be converted automatically (It will not have a tmug or mbust).
### Change Notes
 - More intuitive user interface and experience (no constant re-merging).
 - Optimised game storage (5 - 10 GB smaller as a result of making no copies of the game).
 - The program no longer freezes (I didn't acutally fix this, it just doesn't copy the game anymore).
 - Some less important features have been removed (e.g. control profiles).
 - It is now possible to extract characters (gather all of their files) from the game.
 - It is now possible to remove any character from the game (this is why Open Build support was dropped).
 - Character installations can now be filtered to include only necessary files.
 - Errors with misc mod support can only be fixed by restoring backups (currently).

## What
This project is a WIP mod manager for Super Smash Brothers Crusade CMC+. It allows for the installation and management of mods through a GUI.
### Supported Versions
- [x] [CMC+ v8](https://gamebanana.com/mods/50383)
## Why
CMC+ has good modding support and modding the game currently isn't that hard why use a mod manager? The main reason I developed this mod manager is for the CSS (Character Selection Screen) editor. Although it is certainly possible, adding characters to the CSS by hand annoyed me because of the need to find character numbers and names (if you are removing unknown characters). CMC Mod Manager allows you to add, swap or remove characters to/from the CSS (and soon the SSS) with drag and drop. Additionally it allows the installation of CMC+ v7 mods for CMC+ v8 (with varying success).

![CSS Editor](./CSS.png)

## Installation
Go [here](https://github.com/Inferno214221/CMCModManager/releases/latest) to install the latest release of CMC Mod Manager for your operating system.
### Windows
After downloading the zip, extract it in the directory you wish to install it in and run the exe.
### Linux
After downloading the zip, extract it and copy the `./out/cmcmodmanager-linux-x64/` folder to where you would like to install it, e.g. `/opt` (Feel free to rename it as well). Due to CMC+ being built for Windows, the default permissions are very weird with some directories being read-only. To fix this it is very important that you run `sudo chmod 777 ./* -R` in your CMC game directory before installing it with your mod manager, otherwise, the program will be unable to remove some of the files it is using.
#### NOTE:
If you are having issues running SSBC / CMC+ on Linux, use Wine version 6 rather than 7 or 8 and it plays perfectly (Idk what proton version).
### MacOS
Install [Asahi Linux](https://asahilinux.org/), then proceed with the Linux installation steps. 
#### NOTE:
The above statement is double reverse sarcastic.
## Updating From v1.0.X To v2.X.X
Copy your `merged` directory from the program's `./resources/app` directory to a location of your choosing. You may rename this folder to anything (e.g. `CMC+ v8`), it will now be your Game folder. Download and extract CMC Mod Manager 2.X.X. Follow the usage steps below but select the copy of the `merged` directory you moved as the unmodded game.
## Usage
Please ensure that the game has been run once to create all the necessary files.

After installing CMC Mod Manager the first step is to select your CMC+ directory. Under the 'Home' tab choose 'Select CMC+ Directory' and select the folder with `CMC+ v8.exe` in it.

To install character mods, switch to the 'Character Manager' tab and select 'Install from Directory' or 'Install From Archive'. Any characters that you want to install needs to be formatted correctly so that the directory or archive you select contains the `fighter`, `data`, `gfx` directories (among others). Merging after mod installation is no longer a requirement, just add your character to the roster/s by dragging and dropping characters in the 'Character Selection Screen' tab.

[Usage Tutorial (v1.0.X)](https://raw.githubusercontent.com/Inferno214221/CMCModManager/main/CMCModManagerTutorial.mp4)

## It's not working!
Please ensure that all mods that are installed are in the correct format and that the program is the latest version (check GitHub / GB). If a breakage occurred installing a mod, try removing it via the mod manager.
## Notes
This is my first time using Electron and therefore the code is a bit of a mess sorry. Also, I am not very good at designing GUIs so this one might be unintuitive. Feel free to provide suggestions for interface improvements although be warned they may be declined.
## Progress
### Main Page
- [x] Select the CMC+ directory
- [x] Open CMC+ directory in local file manager
- [x] Run CMC+
- [ ] Remove unessecary files
- [x] Make fighters.txt on export
- [x] Alerts
- [x] Errors
### Character Manager
- [x] Install characters from a folder (very picky)
- [x] Install characters from an archive (extract, install folder, delete)
- [x] List characters
- [x] Extract characters
- [x] Remove characters
- [ ] Delete instructions txt file on merge
- [ ] Option to remove character from random list
- [x] Installed v7 characters can be converted to v8
- [x] Errors
### Character Selection Screen (Priority: 1)
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
- [x] Uninstalled characters are removed
- [x] Switch CSS Pages
- [ ] Add CSS Pages
- [ ] Edit Game Settings to change displayed list
- [x] Alerts
- [ ] Errors
- [ ] Fix spaces when adding rows
### Alts (Priority: 5)
- [ ] IDFK how I should deal with alts
- [ ] Alerts
- [ ] Errors
### Stage Manager (Priority: 4)
- [ ] Install stages from a folder
- [ ] Install stages from a zip (extract, install folder, delete)
- [ ] Manage stage merge priority
- [ ] Alerts
- [ ] Errors
### Stage Selection Screen (Priority: 4)
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
### Items (Priority: 6)
- [ ] Install item mods - Not many mods & idk if it works with CMC+ v7
- [ ] Remove item mods
- [ ] Alerts
- [ ] Errors
### Miscellanious Mods (Priority: 3)
- [x] Add option to import other types of mods e.g. ui changes / music
- [x] RAR support - no errors
- [ ] Remove misc mods by tracking file changes
- [x] Errors
