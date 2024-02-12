import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./characters.css";
import IconButton from "../global/icon-button/icon-button";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import CycleIconButton from "../global/icon-button/cycle-icon-button";
import {
    Alt, AppData, Character, SortTypeOptions, StatusDisplayInfo, StatusDisplayState, sortTypes
} from "../../interfaces";
import missing from "../../assets/missing.png";
import { displayError } from "../global/app";

export function TabCharacters({
    setDisplays
}: {
    setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>
}): JSX.Element {
    const [filterInstallation, setFilterInstallation]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(null);
    
    const [updateCharacters, setUpdateCharacters]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(null);

    const [characters, setCharacters]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

    const [preSorted, setPreSorted]:
    [Character[][], Dispatch<SetStateAction<Character[][]>>]
    = useState([[], [], []]);

    const [sortedCharacters, setSortedCharacters]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

    const [searchValue, setSearchValue]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    const [sortType, setSortType]:
    [number, Dispatch<SetStateAction<number>>]
    = useState(0);

    const [reverseSort, setReverseSort]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);

    const [altTarget, setAltTarget]:
    [Character, Dispatch<SetStateAction<Character>>]
    = useState(null);

    useEffect(() => {
        readCharacters();
        readDefaultConfig();
    }, []);

    async function readCharacters(): Promise<void> {
        setCharacters(await api.readCharacters());
    }

    async function readDefaultConfig(): Promise<void> {
        const data: AppData = await api.readAppData();
        setFilterInstallation(data.config.filterCharacterInstallation);
        setUpdateCharacters(data.config.updateCharacters);
    }

    useEffect(() => {
        setPreSorted(() => {
            const retVal: Character[][] = [];
            sortTypes.forEach((sortType: SortTypeOptions, index: number) => {
                retVal[index] = characters.toSorted((a: Character, b: Character) =>
                    (a[sortType] > b[sortType] ? 1 : -1)
                );
            });
            return retVal;
        });
    }, [characters]);

    useEffect(() => {
        setSortedCharacters(sortCharacters(preSorted[sortType]));
    }, [preSorted, sortType, reverseSort, searchValue]);

    function sortCharacters(characters: Character[]): Character[] {
        let sortedCharacters: Character[] = characters;
        if (searchValue != "") {
            sortedCharacters = sortedCharacters.filter((character: Character) =>
                (character.menuName.toLowerCase().includes(searchValue))
            );
        }
        if (reverseSort) {
            return sortedCharacters.toReversed();
        }
        return sortedCharacters;
    }

    useEffect(() => {
        writeFilterInstallation();
    }, [filterInstallation]);

    async function writeFilterInstallation(): Promise<void> {
        const appData: AppData = await api.readAppData();
        if (
            filterInstallation != null &&
            appData.config.filterCharacterInstallation != filterInstallation
        ) {
            appData.config.filterCharacterInstallation = filterInstallation;
            await api.writeAppData(appData);
        }
    }

    useEffect(() => {
        writeUpdateCharacters();
    }, [updateCharacters]);

    async function writeUpdateCharacters(): Promise<void> {
        const appData: AppData = await api.readAppData();
        if (
            updateCharacters != null &&
            appData.config.updateCharacters != updateCharacters
        ) {
            appData.config.updateCharacters = updateCharacters;
            await api.writeAppData(appData);
        }
    }

    return (
        <section>
            <div id={"sort-div"}>
                <div className={"center"}>
                    <div className={"tooltip-wrapper inline-sort-options"}>
                        <input
                            type={"text"}
                            placeholder={"Search"}
                            id={"character-search"}
                            onInput={(event: any) => {
                                setSearchValue(event.target.value);
                                console.log(searchValue, sortType, reverseSort);
                            }}
                        />
                        <div className={"tooltip"}>
                            <span>Search For Characters</span>
                        </div>
                    </div>
                    <div className={"inline-sort-options"}>
                        <CycleIconButton
                            index={sortType}
                            icons={[
                                "format_list_numbered",
                                "group",
                                "sort_by_alpha"
                            ]}
                            tooltips={[
                                "Sort By: Internal Number",
                                "Sort By: Series",
                                "Sort By: Alphabetical"
                            ]}
                            iconSize={"30px"}
                            setter={setSortType}
                        />
                        <ToggleIconButton
                            checked={reverseSort}
                            trueIcon={"north"}
                            trueTooltip={"Sort Direction: Backwards"}
                            falseIcon={"south"}
                            falseTooltip={"Sort Direction: Forwards"}
                            iconSize={"30px"}
                            setter={setReverseSort}
                        />
                    </div>
                </div>
            </div>
            <div id={"character-div"}>
                <div className={"center"}>
                    <table>
                        <tbody>
                            {sortType == sortTypes.indexOf(SortTypeOptions.series) ?
                                sortedCharacters.map((
                                    character: Character,
                                    index: number
                                ) => {
                                    const characterDisplay: JSX.Element = (
                                        <CharacterDisplay
                                            character={character}
                                            readCharacters={readCharacters}
                                            altTarget={altTarget}
                                            setAltTarget={setAltTarget}
                                            setDisplays={setDisplays}
                                            key={character.name}
                                        />
                                    );
                                    if (
                                        index == 0 ||
                                        character.series != sortedCharacters[index - 1].series
                                    ) {
                                        return (
                                            <>
                                                <SeriesDisplay
                                                    series={character.series}
                                                    readCharacters={readCharacters}
                                                    setDisplays={setDisplays}
                                                />
                                                {characterDisplay}
                                            </>
                                        );
                                    }
                                    return characterDisplay;
                                }) :
                                sortedCharacters.map((
                                    character: Character
                                ) => 
                                    <CharacterDisplay
                                        character={character}
                                        readCharacters={readCharacters}
                                        altTarget={altTarget}
                                        setAltTarget={setAltTarget}
                                        setDisplays={setDisplays}
                                        key={character.name}
                                    />
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <hr/>
            <div id={"button-div"}>
                <div className={"center"}>
                    <IconButton
                        icon={"folder_shared"}
                        iconSize={"50px"}
                        tooltip={"Install Character From Directory"}
                        onClick={async () => {
                            let displayId: number;
                            setDisplays((prev: StatusDisplayInfo[]) => {
                                const newDisplays: StatusDisplayInfo[] = [...prev];
                                displayId = newDisplays.push({
                                    title: "Character Installation",
                                    body: "Installing a character from a directory.",
                                    state: StatusDisplayState.started,
                                    icon: "folder_shared",
                                    animation: Math.floor(Math.random() * 3)
                                }) - 1;
                                return newDisplays;
                            });

                            try {
                                const character: Character = await api.installCharacterDir(
                                    filterInstallation,
                                    updateCharacters
                                );
                                setDisplays((prev: StatusDisplayInfo[]) => {
                                    const newDisplays: StatusDisplayInfo[] = [...prev];
                                    if (character == null) {
                                        newDisplays[displayId].state = StatusDisplayState.canceled;
                                    } else {
                                        newDisplays[displayId].state = StatusDisplayState.finished;
                                        newDisplays[displayId].body = "Installed character: '" +
                                        character.name + "' from a directory.";
                                        newDisplays[displayId].image = character.mug;
                                    }
                                    return newDisplays;
                                });
                                readCharacters();
                            } catch (error: any) {
                                displayError(error, displayId, setDisplays);
                            }
                        }}
                    />
                    <IconButton
                        icon={"contact_page"}
                        iconSize={"50px"}
                        tooltip={"Install Character From Archive"}
                        onClick={async () => {
                            let displayId: number;
                            setDisplays((prev: StatusDisplayInfo[]) => {
                                const newDisplays: StatusDisplayInfo[] = [...prev];
                                displayId = newDisplays.push({
                                    title: "Character Installation",
                                    body: "Installing a character from an archive.",
                                    state: StatusDisplayState.started,
                                    icon: "contact_page",
                                    animation: Math.floor(Math.random() * 3)
                                }) - 1;
                                return newDisplays;
                            });

                            try {
                                const character: Character = await api.installCharacterArchive(
                                    filterInstallation,
                                    updateCharacters
                                );
                                setDisplays((prev: StatusDisplayInfo[]) => {
                                    const newDisplays: StatusDisplayInfo[] = [...prev];
                                    if (character == null) {
                                        newDisplays[displayId].state = StatusDisplayState.canceled;
                                    } else {
                                        newDisplays[displayId].state = StatusDisplayState.finished;
                                        newDisplays[displayId].body = "Installed character: '" +
                                            character.name + "' from an archive.";
                                        newDisplays[displayId].image = character.mug;
                                    }
                                    return newDisplays;
                                });
                                readCharacters();
                            } catch (error: any) {
                                displayError(error, displayId, setDisplays);
                            }
                        }}
                    />
                    <IconButton
                        icon={"source"}
                        iconSize={"50px"}
                        tooltip={"Open Extraction Directory"}
                        onClick={async () => {
                            api.openDir(await api.getExtractedDir());
                        }}
                    />
                    <hr className={"vr"}/>
                    <IconButton
                        icon={"delete_sweep"}
                        iconSize={"50px"}
                        tooltip={"Remove All Characters"}
                        onClick={() => {console.log("a")}}
                    />
                    <IconButton
                        icon={"drive_file_move"}
                        iconSize={"50px"}
                        tooltip={"Extract All Characters"}
                        onClick={() => {console.log("a")}}
                    />
                    {/* <IconButton
                        icon={"folder_zip"}
                        iconSize={"50px"}
                        tooltip={"Unbin All Characters"}
                        onClick={() => {console.log("a")}}
                    /> */}
                    <hr className={"vr"}/>
                    <ToggleIconButton
                        checked={filterInstallation}
                        trueIcon={"filter_alt"}
                        trueTooltip={"Installation: Only Necessary Files"}
                        falseIcon={"filter_alt_off"}
                        falseTooltip={"Installation: All Files"}
                        iconSize={"50px"}
                        setter={setFilterInstallation}
                    />
                    <ToggleIconButton
                        checked={updateCharacters}
                        trueIcon={"sync"}
                        trueTooltip={"Existing Characters: Update"}
                        falseIcon={"sync_disabled"}
                        falseTooltip={"Existing Characters: Abort"}
                        iconSize={"50px"}
                        setter={setUpdateCharacters}
                    />
                </div>
            </div>
        </section>
    );
}

function CharacterDisplay({
    character,
    readCharacters,
    altTarget,
    setAltTarget,
    setDisplays
}: {
    character: Character,
    readCharacters: () => Promise<void>,
    altTarget: Character,
    setAltTarget: Dispatch<SetStateAction<Character>>,
    setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>
}): JSX.Element {
    const [randomSelection, setRandomSelection]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(character.randomSelection);

    useEffect(() => {
        if (randomSelection == character.randomSelection) return;
        api.writeCharacterRandom(character.name, randomSelection);
        character.randomSelection = randomSelection;
    }, [randomSelection]);

    return (
        <tr className={"character-display-row"}>
            <td>
                <div className={"character-display-wrapper"}>
                    <div className={"character-display-mug"}>
                        <img
                            src={"img://" + character.mug}
                            draggable={false}
                            onError={(event: any) => {
                                event.target.src = missing;
                            }}
                        />
                    </div>
                    <div className={"character-display-name"}>
                        <span>{character.menuName}</span>
                    </div>
                    <div className={"character-display-actions"}>
                        <IconButton
                            icon={"delete"}
                            iconSize={"30px"}
                            tooltip={"Delete Character"}
                            onClick={async () => {
                                let displayId: number;
                                setDisplays((prev: StatusDisplayInfo[]) => {
                                    const newDisplays: StatusDisplayInfo[] = [...prev];
                                    displayId = newDisplays.push({
                                        title: "Character Deletion",
                                        body: "Deleting character: '" + character.name + "'.",
                                        image: character.mug,
                                        state: StatusDisplayState.started,
                                        icon: "delete",
                                        animation: Math.floor(Math.random() * 3)
                                    }) - 1;
                                    return newDisplays;
                                });

                                try {
                                    await api.removeCharacter(character.name);
                                    setDisplays((prev: StatusDisplayInfo[]) => {
                                        const newDisplays: StatusDisplayInfo[] = [...prev];
                                        newDisplays[displayId].state = StatusDisplayState.finished;
                                        newDisplays[displayId].body = "Deleted character: '" +
                                            character.name + "'.";
                                        return newDisplays;
                                    });
                                    readCharacters();
                                } catch (error: any) {
                                    displayError(error, displayId, setDisplays);
                                }
                            }}
                        />
                        <IconButton
                            icon={"drive_file_move"}
                            iconSize={"30px"}
                            tooltip={"Extract Character"}
                            onClick={async () => {
                                let displayId: number;
                                setDisplays((prev: StatusDisplayInfo[]) => {
                                    const newDisplays: StatusDisplayInfo[] = [...prev];
                                    displayId = newDisplays.push({
                                        title: "Character Extraction",
                                        body: "Extracting character: '" + character.name + "'.",
                                        image: character.mug,
                                        state: StatusDisplayState.started,
                                        icon: "drive_file_move",
                                        animation: Math.floor(Math.random() * 3)
                                    }) - 1;
                                    return newDisplays;
                                });

                                try {
                                    await api.extractCharacter(character.name);
                                    setDisplays((prev: StatusDisplayInfo[]) => {
                                        const newDisplays: StatusDisplayInfo[] = [...prev];
                                        newDisplays[displayId].state = StatusDisplayState.finished;
                                        newDisplays[displayId].body = "Extracted character: '" +
                                            character.name + "'.";
                                        return newDisplays;
                                    });
                                } catch (error: any) {
                                    displayError(error, displayId, setDisplays);
                                }
                            }}
                        />
                        <ToggleIconButton
                            checked={randomSelection}
                            trueIcon={"help"}
                            trueTooltip={"Random Selection: Enabled"}
                            falseIcon={"help_outline"}
                            falseTooltip={"Random Selection: Disabled"}
                            iconSize={"30px"}
                            setter={setRandomSelection}
                            //     (state: boolean) => {
                            //     console.log(character.name, state);
                            //     api.writeCharacterRandom(character.name, state);
                            //     setRandomSelection(state);
                            // }}
                        />
                        <AddAltButton
                            character={character}
                            altTarget={altTarget}
                            setAltTarget={setAltTarget}
                            readCharacters={readCharacters}
                            setDisplays={setDisplays}
                        />
                    </div>
                </div>
            </td>
            <td>
                <div className={"character-display-alts"}>
                    {character.alts.filter((alt: Alt) => alt.base != alt.alt)
                        .map((alt: Alt, index: number) =>
                            <CharacterAltDisplay
                                alt={alt}
                                readCharacters={readCharacters}
                                setDisplays={setDisplays}
                                key={index}
                            />
                        )
                    }
                </div>
            </td>
        </tr>
    );
}

function CharacterAltDisplay({
    alt,
    readCharacters,
    setDisplays
}: {
    alt: Alt,
    readCharacters: () => Promise<void>,
    setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>
}): JSX.Element {
    return (
        <div className={"alt-display-wrapper"}>
            <div className={"alt-display-mug"}>
                <img
                    src={"img://" + alt.mug}
                    draggable={false}
                    onError={(event: any) => {
                        event.target.src = missing;
                    }}
                />
            </div>
            <div className={"alt-display-name"}>
                <span>{alt.menuName}</span>
            </div>
            <div className={"alt-display-actions"}>
                <IconButton
                    icon={"group_remove"}
                    iconSize={"30px"}
                    tooltip={"Remove Alt"}
                    onClick={async () => {
                        let displayId: number;
                        setDisplays((prev: StatusDisplayInfo[]) => {
                            const newDisplays: StatusDisplayInfo[] = [...prev];
                            displayId = newDisplays.push({
                                title: "Alt Removal",
                                body: "Removing alt: '" + alt.alt + "' from character: '" +
                                    alt.base + "'.",
                                image: alt.mug,
                                state: StatusDisplayState.started,
                                icon: "group_remove",
                                animation: Math.floor(Math.random() * 3)
                            }) - 1;
                            return newDisplays;
                        });

                        try {
                            await api.removeAlt(alt);
                            setDisplays((prev: StatusDisplayInfo[]) => {
                                const newDisplays: StatusDisplayInfo[] = [...prev];
                                newDisplays[displayId].state = StatusDisplayState.finished;
                                newDisplays[displayId].body = "Removed alt: '" + alt.alt +
                                    "' from character: '" + alt.base + "'.";
                                return newDisplays;
                            });
                            readCharacters();
                        } catch (error: any) {
                            displayError(error, displayId, setDisplays);
                        }
                    }}
                />
            </div>
        </div>
    );
}

function AddAltButton({
    character,
    altTarget,
    setAltTarget,
    readCharacters,
    setDisplays
}: {
    character: Character,
    altTarget: Character,
    setAltTarget: Dispatch<SetStateAction<Character>>,
    readCharacters: () => Promise<void>,
    setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>
}): JSX.Element {
    if (altTarget == null) {
        return (
            <IconButton
                icon={"group_add"}
                iconSize={"30px"}
                tooltip={"Add Alt To This Character"}
                onClick={() => {
                    setAltTarget(character);
                }}
            />
        );
    }
    if (altTarget.name == character.name) {
        return (
            <IconButton
                icon={"cancel"}
                iconSize={"30px"}
                tooltip={"Cancel Alt Addition"}
                onClick={() => {
                    setAltTarget(null);
                }}
            />
        );
    }
    return (
        <IconButton
            icon={"person_add"}
            iconSize={"30px"}
            tooltip={"Add As Alt To Selected Character"}
            onClick={async () => {
                let displayId: number;
                setDisplays((prev: StatusDisplayInfo[]) => {
                    const newDisplays: StatusDisplayInfo[] = [...prev];
                    displayId = newDisplays.push({
                        title: "Alt Addition",
                        body: "Adding alt: '" + character.name + "' to character: '" +
                            altTarget.name + "'.",
                        image: character.mug,
                        state: StatusDisplayState.started,
                        icon: "person_add",
                        animation: Math.floor(Math.random() * 3)
                    }) - 1;
                    return newDisplays;
                });

                try {
                    await api.addAlt(altTarget, character);
                    setAltTarget(null);
                    setDisplays((prev: StatusDisplayInfo[]) => {
                        const newDisplays: StatusDisplayInfo[] = [...prev];
                        newDisplays[displayId].state = StatusDisplayState.finished;
                        newDisplays[displayId].body = "Added alt: '" + character.name +
                            "' to character: '" + altTarget.name + "'.";
                        return newDisplays;
                    });
                    readCharacters();
                } catch (error: any) {
                    displayError(error, displayId, setDisplays);
                }
            }}
        />
    );
}

function SeriesDisplay({
    series,
    readCharacters,
    setDisplays
}: {
    series: string,
    readCharacters: () => Promise<void>,
    setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>
}): JSX.Element {
    return (
        <tr>
            <th className={"series-display-wrapper"}>
                <div className={"series-display-name"}>
                    <span>{series.toUpperCase()}</span>
                </div>
                <IconButton
                    icon={"delete_sweep"}
                    iconSize={"30px"}
                    tooltip={"Delete All Characters In Series"}
                    onClick={async () => {
                        let displayId: number;
                        setDisplays((prev: StatusDisplayInfo[]) => {
                            const newDisplays: StatusDisplayInfo[] = [...prev];
                            displayId = newDisplays.push({
                                title: "Series Deletion",
                                body: "Deleting all characters in series: '" + series + "'.",
                                state: StatusDisplayState.started,
                                icon: "delete_sweep",
                                animation: Math.floor(Math.random() * 3)
                            }) - 1;
                            return newDisplays;
                        });
                        api.getGameDir().then((gameDir: string) => {
                            api.pathJoin(
                                gameDir, "gfx", "seriesicon", series + ".png"
                            ).then((path: string) => {
                                setDisplays((prev: StatusDisplayInfo[]) => {
                                    const newDisplays: StatusDisplayInfo[] = [...prev];
                                    newDisplays[displayId].image = path;
                                    return newDisplays;
                                });
                            });
                        });

                        try {
                            await api.removeSeriesCharacters(series);
                            setDisplays((prev: StatusDisplayInfo[]) => {
                                const newDisplays: StatusDisplayInfo[] = [...prev];
                                newDisplays[displayId].state = StatusDisplayState.finished;
                                newDisplays[displayId].body = "Deleted all characters in series: " +
                                    "'" + series + "'.";
                                return newDisplays;
                            });
                            readCharacters();
                        } catch (error: any) {
                            displayError(error, displayId, setDisplays);
                        }
                    }}
                />
            </th>
        </tr>
    );
}