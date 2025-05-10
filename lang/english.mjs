/* eslint-disable @stylistic/js/max-len */
export default {
    operation: {
        update: {
            download: {
                started: {
                    title: "Download Update",
                    body: "Downloading the latest version of CMC Mod Manager.",
                },
                finished: {
                    title: "Update Downloaded",
                    body: "Downloaded the latest version of CMC Mod Manager."
                }
            },
            install: {
                started: {
                    title: "Install Update",
                    body: "Installing the latest version of CMC Mod Manager."
                },
                finished: {
                    body: "Please close CMC Mod Manager to finish the update."
                }
            }
        },
        mod: {
            download: {
                started: {
                    title: "Mod Download",
                    body: "Downloading a mod from GameBanana."
                },
                // TODO: refactor
                progress: {
                    0: {
                        title: "{0} Download",
                        body: "Downloading mod: '{0}' from GameBanana.",
                    },
                    1: {
                        body: "Extracting downloaded mod.",
                    },
                },
                finished: {
                    body: "Downloaded mod: '{0}' from GameBanana."
                }
            }
        },
        character: {
            bulkInstallation: {
                started: {
                    title: "Bulk Character Installation",
                    body: "Selecting characters to install from '{0}'."
                },
                finished: {
                    body: "Selected characters to install from '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Character Installation",
                    body: "Installing a character from {0}."
                },
                finished: {
                    body: "Installed character: '{0}' from {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Character Selection",
                    body: "Toggling the ability for character: '{0}' to be selected at random."
                },
                finished: {
                    body: "Toggled the ability for character: '{0}' to be selected at random."
                }
            },
            deletion: {
                started: {
                    title: "Character Deletion",
                    body: "Deleting character: '{0}'."
                },
                finished: {
                    body: "Deleted character: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Character Extraction",
                    body: "Extracting character: '{0}'."
                },
                finished: {
                    body: "Extracted character: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Series Deletion",
                    body: "Deleting all characters in series: '{0}'."
                },
                finished: {
                    body: "Deleted all characters in series: '{0}'."
                }
            }
        },
        stage: {
            bulkInstallation: {
                started: {
                    title: "Bulk Stage Installation",
                    body: "Selecting stages to install from '{0}'."
                },
                finished: {
                    body: "Selected stages to install from '{0}'."
                }
            },
            installation: {
                started: {
                    title: "Stage Installation",
                    body: "Installing a stage from {0}."
                },
                finished: {
                    body: "Installed stage: '{0}' from {1}."
                }
            },
            randomSelection: {
                started: {
                    title: "Stage Selection",
                    body: "Toggling the ability for stage: '{0}' to be selected at random."
                },
                finished: {
                    body: "Toggled the ability for stage: '{0}' to be selected at random."
                }
            },
            deletion: {
                started: {
                    title: "Stage Deletion",
                    body: "Deleting stage: '{0}'."
                },
                finished: {
                    body: "Deleted stage: '{0}'."
                }
            },
            extraction: {
                started: {
                    title: "Stage Extraction",
                    body: "Extracting stage: '{0}'."
                },
                finished: {
                    body: "Extracted stage: '{0}'."
                }
            },
            seriesDeletion: {
                started: {
                    title: "Series Deletion",
                    body: "Deleting all stages in series: '{0}'."
                },
                finished: {
                    body: "Deleted all stages in series: '{0}'."
                }
            }
        },
        alt: {
            include: {
                started: {
                    title: "Alt Inclusion",
                    body: "Ensuring that alts are included in the character list."
                },
                finished: {
                    body: "Ensured that alts are included in the character list."
                }
            },
            exclude: {
                started: {
                    title: "Alt Exclusion",
                    body: "Ensuring that alts are excluded from the character list."
                },
                finished: {
                    body: "Ensured that alts are excluded in the character list."
                }
            },
            removal: {
                started: {
                    title: "Alt Removal",
                    body: "Removing alt: '{0}' from character: '{1}'."
                },
                finished: {
                    body: "Removed alt: '{0}' from character: '{1}'."
                }
            },
            addition: {
                started: {
                    title: "Alt Addition",
                    body: "Adding alt: '{0}' to character: '{1}'."
                },
                finished: {
                    body: "Added alt: '{0}' to character: '{1}'."
                }
            }
        },
        css: {
            writeData: {
                started: {
                    title: "Write CSS Data",
                    body: "Writing modified CSS data to page: '{0}'."
                },
                finished: {
                    body: "Wrote modified CSS data to page: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reorder CSS Pages",
                    body: "Moving CSS page: '{0}' to index: {1}."
                },
                finished: {
                    body: "Moved CSS page: '{0}' to index: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "CSS Page Addition",
                    body: "Adding new CSS page: '{0}'."
                },
                finished: {
                    body: "Added new CSS page: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Rename CSS Page",
                    body: "Renaming CSS page: '{0}' to '{1}'."
                },
                finished: {
                    body: "Renamed CSS page: '{0}' to '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "CSS Page Deletion",
                    body: "Deleting CSS page: '{0}'."
                },
                finished: {
                    body: "Deleted CSS page: '{0}'."
                }
            }
        },
        sss: {
            writeData: {
                started: {
                    title: "Write SSS Data",
                    body: "Writing modified SSS data to page: '{0}'."
                },
                finished: {
                    body: "Wrote modified SSS data to page: '{0}'."
                }
            },
            reorderPages: {
                started: {
                    title: "Reorder SSS Pages",
                    body: "Moving SSS page: '{0}' to index: {1}."
                },
                finished: {
                    body: "Moved SSS page: '{0}' to index: {1}."
                }
            },
            pageAddition: {
                started: {
                    title: "SSS Page Addition",
                    body: "Adding new SSS page: '{0}'."
                },
                finished: {
                    body: "Added new SSS page: '{0}'."
                }
            },
            renamePage: {
                started: {
                    title: "Rename SSS Page",
                    body: "Renaming SSS page: '{0}' to '{1}'."
                },
                finished: {
                    body: "Renamed SSS page: '{0}' to '{1}'."
                }
            },
            pageDeletion: {
                started: {
                    title: "SSS Page Deletion",
                    body: "Deleting SSS page: '{0}'."
                },
                finished: {
                    body: "Deleted SSS page: '{0}'."
                }
            }
        }
    },
    dialog: {
        alert: {
            selfContainedDir: {
                title: "Invalid Game Location Warning",
                body: "The selected game directory is contained within CMC Mod Manager's own directory. CMC Mod Manager deletes all files within this directory when updating, so it cannot be used to store your game files, please move them to a different location."
            },
            invalidGameDir: {
                title: "Invalid Directory Selected",
                body: "The selected directory is invalid as it does not contain one of the identifying executables."
            },
            postUpdate: {
                title: "Post Update Message",
                body: "Thanks for updating CMC Mod Manager! The CMC Mod Manager website has also been updated, so please consider checking it out: https://inferno214221.com/cmc-mod-manager/ (a link is also available in the 'Home' tab). I've also setup a 'Buy Me A Coffee' page if you'd like to support the project!"
            },
            noDirSelected: {
                title: "No Directory Selected",
                body: "Please select your CMC+ directory before continuing."
            },
            languageUpdated: {
                title: "Language Updated",
                body: "Please close and relaunch CMC Mod Manager to apply changes."
            },
            licenseNotice: {
                title: "License Notice",
            }
        },
        confirm: {
            programUpdate: {
                title: "Program Update",
                body: "CMC Mod Manager requires an update. This update will now be installed automatically. This update will remove all files within CMC Mod Manager's  directory, if this is problematic, please cancel this update and remove any affected files.",
                okLabel: "Continue"
            },
            destructiveAction: {
                title: "Destructive Action Confirmation",
                body: "This action is destructive and cannot be undone. Are you sure that you want to continue?",
                okLabel: "Continue"
            },
            closeUnfinishedOperations: {
                title: "Unfinished Operations",
                body: "Are you sure you want to close CMC Mod Manager? Some operations are unfinished and will be canceled if you close (or reload) the program.",
                okLabel: "Close Anyway"
            },
            beginCharacterInput: {
                title: "Character Installation",
                body: "The character that is being installed's dat file uses the vanilla format and you will be required to enter some information for the installation. This information can usually be found in a txt file in the mod's top level directory.",
                okLabel: "Continue"
            },
            openCharacterDir: {
                title: "Character Installation",
                body: "Would you like to open the mod's directory to find any txt files manually?",
                okLabel: "Yes",
                cancelLabel: "No"
            },
            beginStageInput: {
                title: "Stage Installation",
                body: "Because of CMC+'s current modding format, you will be required to enter some information about the stage you are installing. This information can usually be found in a txt file in the mod's top level directory. (If such a txt file exists and contains four lines, the first one likely is unnecessary.)",
                okLabel: "Continue"
            },
            openStageDir: {
                title: "Stage Installation",
                body: "Would you like to open the mod's directory to find any txt files manually?",
                okLabel: "Yes",
                cancelLabel: "No"
            }
        },
        prompt: {
            characterMenuName: {
                title: "Character Installation",
                body: "Please enter the character's 'menu name'. (This is the name displayed on the when the character is selected on the character selection screen.)",
                placeholder: "Character's Menu Name"
            },
            characterBattleName: {
                title: "Character Installation",
                body: "Please enter the character's 'battle name'. (This is the name displayed as a part of the HUD during a match.)",
                placeholder: "Character's Battle Name",
            },
            characterSeries: {
                title: "Character Installation",
                body: "Please enter the character's 'series'. (This name will be used to select the icon to use on the character selection screen. This value is usually short and in all lowercase letters.)",
                placeholder: "Character's Series",
            },
            stageMenuName: {
                title: "Stage Installation",
                body: "Please enter the stage's 'menu name'. (The name that will be displayed on the stage selection screen.)",
                placeholder: "Stage's Menu Name"
            },
            stageSource: {
                title: "Stage Installation",
                body: "Please enter the stage's 'source'. (The name of the source content that the stage is originally from, such as the title of the game.)",
                placeholder: "Stage's Source",
            },
            stageSeries: {
                title: "Stage Installation",
                body: "Please enter the stage's 'series'. (This name will be used to select the  icon to use on the stage selection screen. This value is usually short and in all lowercase letters.)",
                placeholder: "Stage's Series",
            }
        },
        defaults: {
            okLabel: "OK",
            cancelLabel: "Cancel"
        },
        notification: {
            oneClickDownload: {
                title: "1-Click Download initialized",
                body: "Downloading mod with id: '{0}' from GameBanana."
            }
        },
        installation: {
            character: {
                title: "Select Characters To Install"
            },
            stage: {
                title: "Select Stages To Install"
            }
        }
    },
    error: {
        noStringFound: "Unable to get string for key: '{0}'.",
        invalidStringArgs: "Invalid number of arguments when substituting into string.",
        missingDialogOptions: "Dialog options not found.",
        unsupportedArchiveType: "Unsupported archive type: '{0}'.",
        unknownModType: "Unknown mod type: '{0}'.",
        invalidSemverString: "Invalid semver string: '{0}'.",
        cantUpdateDevMode: "Cannot update in dev mode.",
        missingUpdateFiles: "Update files not found.",
        streamError: "A stream error occurred: '{0}'.",
        noSingleInstanceLock: "Single instance lock failed.",
        noRecursiveAlts: "A character with alts can't be assigned as an alt.",
        maxAltsReached: "Character already has the maximum number of alts.",
        characterNotFound: "Character not found: '{0}'.",
        stageNotFound: "Stage not found: '{0}'.",
        incompleteDat: "Character dat is incomplete: '{0}'.",
        characterInstallTargetSelf: "Cannot install characters from the directory that they are being installed to.",
        stageInstallTargetSelf: "Cannot install stage from the directory that they are being installed to.",
        noValidCharactersFound: "No valid characters found in directory: '{0}'.",
        noValidStagesFound: "No valid characters found in directory: '{0}'.",
        noTopDir: "File path has no directory: '{0}'.",
        noFighterSubdir: "No 'fighter' subdirectory found in directory: '{0}'.",
        noStageSubdir: "No 'stage' subdirectory found in directory: '{0}'.",
        noUpdateCharacter: "Character already installed, updates disabled.",
        noUpdateStage: "Stage already installed, updates disabled.",
        noDatFile: "Character has no dat file.",
        customCssDisabled: "Custom CSS pages disabled in game_settings.",
        operationCallNotFound: "Operation function not found: '{0}'."
    },
    tooltip: {
        character: {
            install: "Install Character",
            update: "Update Character",
            search: "Search For Characters",
            installDir: "Install Character From Directory",
            installArch: "Install Character From Archive",
            delete: "Delete Character",
            extract: "Extract Character",
            deleteSeries: "Delete All Characters In Series",
            showing: {
                all: "Showing: All Characters",
                new: "Showing: New Characters",
                excluded: "Showing: Excluded Characters"
            },
            existing: {
                update: "Existing Characters: Update",
                abort: "Existing Characters: Abort"
            }
        },
        stage: {
            install: "Install Stage",
            update: "Update Stage",
            search: "Search For Stages",
            installDir: "Install Stage From Directory",
            installArch: "Install Stage From Archive",
            delete: "Delete Stage",
            extract: "Extract Stage",
            deleteSeries: "Delete All Stages In Series",
            showing: {
                all: "Showing: All Stages",
                new: "Showing: New Stages",
                excluded: "Showing: Excluded Stages"
            },
            existing: {
                update: "Existing Stages: Update",
                abort: "Existing Stages: Abort"
            }
        },
        alt: {
            remove: "Remove Alt",
            addition: {
                toThis: "Add Alt To This Character",
                thisFor: "Add As Alt To Selected Character",
                cancel: "Cancel Alt Addition"
            },
            asCharacters: {
                included: "Alts: Included As Characters",
                excluded: "Alts: Excluded From Characters"
            }
        },
        ss: {
            addPage: "Add Page",
            deletePage: "Delete Page",
            column: {
                add: "Add Column",
                remove: "Remove Column"
            },
            row: {
                add: "Add Row",
                remove: "Remove Row"
            }
        },
        sortBy: {
            number: "Sort By: Internal Number",
            series: "Sort By: Series",
            alphabetical: "Sort By: Alphabetical"
        },
        sortDirection: {
            backwards: "Sort Direction: Backwards",
            forwards: "Sort Direction: Forwards"
        },
        installation: {
            filter: "Installation: Only Necessary Files",
            all: "Installation: All Files"
        },
        randomSelection: {
            enabled: "Random Selection: Enabled",
            disabled: "Random Selection: Disabled"
        },
        operationPanel: {
            show: "Show Operations",
            hide: "Hide Operations"
        },
        operation: {
            cancel: "Cancel Operation"
        },
        gameDir: {
            noneSelected: "(None Selected)",
            change: "Change CMC+ Directory",
            open: "Open CMC+ Directory",
            run: "Run CMC+"
        },
        site: {
            homepage: "Homepage"
        },
        closeWindow: "Close Window",
        openExtractionDir: "Open Extraction Directory",
        openExtractedFiles: "Open Extracted Files"
    },
    ui: {
        tabs: {
            home: {
                title: "Home"
            },
            characters: {
                title: "Characters",
                desc: "Install, extract or delete characters from CMC+."
            },
            characterSelectionScreen: {
                title: "Character Selection Screen",
                desc: "Modify CMC+'s character selection screen."
            },
            stages: {
                title: "Stages",
                desc: "Install, extract or delete stages from CMC+."
            },
            stageSelectionScreen: {
                title: "Stage Selection Screen",
                desc: "Modify CMC+'s stage selection screen."
            }
        },
        currentGameDir: "Current CMC+ Directory: ",
        searchPlaceholder: "Search",
        pagePlaceholder: "Page Name",
        showLicense: "Show License (GNU GPLv3)",
        errorDisplay: "An error being displayed here means that it isn't associated with an operation and is preventing the tab from rendering.",
        operations: "Operations"
    },
    enumDisplayName: {
        character: "Character",
        stage: "Stage"
    },
    other: {
        dat: {
            homeStages: "---Home Stages (Classic Mode)---",
            randomData: "---Other Information---",
            paletteNumber: "---Palette Number---",
            paletteData: "---Palette Data---",
            formatUpdated: "Updated to the CMC+ v8 dat format by CMC Mod Manager.",
        },
        selector: {
            archives: "Archives",
            all: "All Files"
        },
        autoUpdateFailed: "Due to the way CMC Mod Manager has been installed, it can't be updated automatically. Please download the latest version from GitHub or GameBanana. (Check the Home tab for links.)",
        defaultPageName: "Default",
        languageName: "English"
    }
};