import { Dispatch, SetStateAction, useEffect, useState } from "react";
import IconButton from "../../icon-buttons/icon-button";
import ToggleIconButton from "../../icon-buttons/toggle-icon-button";
import CycleIconButton from "../../icon-buttons/cycle-icon-button";
import missing from "../../../assets/missing.png";
import { OpDep, OpState, SortTypeOptions } from "../../../global/global";
import appStyles from "../../app/app.css";
import charactersStyles from "./characters.css";
const styles: typeof import("../../app/app.css") & typeof import("./characters.css") =
    Object.assign({}, appStyles, charactersStyles);

const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.number,
    SortTypeOptions.series,
    SortTypeOptions.menuName
];

export function TabCharacters({
    setOperations
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>
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

    api.on("installCharacter", readCharacters);
    api.on("installStage", (): void => null);

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
            <div id={styles.sortDiv}>
                <div className={styles.center}>
                    <div className={styles.tooltipWrapper + " " + styles.inlineSortOptions}>
                        <input
                            type={"text"}
                            placeholder={"Search"}
                            id={styles.characterSearch}
                            onInput={(event: any) => {
                                setSearchValue(event.target.value);
                                console.log(searchValue, sortType, reverseSort);
                            }}
                        />
                        <div className={styles.tooltip}>
                            <span>Search For Characters</span>
                        </div>
                    </div>
                    <div className={styles.inlineSortOptions}>
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
            <div id={styles.characterDiv}>
                <div className={styles.center}>
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
                                            setOperations={setOperations}
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
                                                    setOperations={setOperations}
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
                                        setOperations={setOperations}
                                        key={character.name}
                                    />
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <hr/>
            <div id={styles.buttonDiv}>
                <div className={styles.center}>
                    <IconButton
                        icon={"folder_shared"}
                        iconSize={"50px"}
                        tooltip={"Install Character From Directory"}
                        onClick={async () => {
                            let operationId: number;
                            setOperations((prev: Operation[]) => {
                                const newOperations: Operation[] = [...prev];
                                operationId = newOperations.push({
                                    title: "Character Installation",
                                    body: "Installing a character from a directory.",
                                    state: OpState.queued,
                                    icon: "folder_shared",
                                    animation: Math.floor(Math.random() * 3),
                                    dependencies: [OpDep.fighters],
                                    call: async () => {
                                        const character: Character = await api.installCharacterDir(
                                            filterInstallation,
                                            updateCharacters
                                        );
                                        setOperations((prev: Operation[]) => {
                                            const newOperations: Operation[] = [...prev];
                                            if (character == null) {
                                                newOperations[operationId].state = OpState.canceled;
                                            } else {
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Installed " +
                                                    "character: '" + character.name +
                                                    "' from a directory.";
                                                newOperations[operationId].image = "img://" +
                                                    character.mug;
                                            }
                                            return newOperations;
                                        });
                                        readCharacters();
                                    }
                                }) - 1;
                                return newOperations;
                            });
                        }}
                    />
                    <IconButton
                        icon={"contact_page"}
                        iconSize={"50px"}
                        tooltip={"Install Character From Archive"}
                        onClick={async () => {
                            let operationId: number;
                            setOperations((prev: Operation[]) => {
                                const newOperations: Operation[] = [...prev];
                                operationId = newOperations.push({
                                    title: "Character Installation",
                                    body: "Installing a character from an archive.",
                                    state: OpState.queued,
                                    icon: "contact_page",
                                    animation: Math.floor(Math.random() * 3),
                                    dependencies: [OpDep.fighters],
                                    call: async () => {
                                        const character: Character =
                                            await api.installCharacterArchive(
                                                filterInstallation,
                                                updateCharacters
                                            );
                                        setOperations((prev: Operation[]) => {
                                            const newOperations: Operation[] = [...prev];
                                            if (character == null) {
                                                newOperations[operationId].state = OpState.canceled;
                                            } else {
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Installed " +
                                                    "character: '" + character.name +
                                                    "' from an archive.";
                                                newOperations[operationId].image = "img://" +
                                                    character.mug;
                                            }
                                            return newOperations;
                                        });
                                        readCharacters();
                                    }
                                }) - 1;
                                return newOperations;
                            });
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
                    <hr className={styles.vr}/>
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
                    <hr className={styles.vr}/>
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
    setOperations
}: {
    character: Character,
    readCharacters: () => Promise<void>,
    altTarget: Character,
    setAltTarget: Dispatch<SetStateAction<Character>>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [randomSelection, setRandomSelection]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(character.randomSelection);

    useEffect(() => {
        if (randomSelection == character.randomSelection) return;
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "Character Selection",
                body: "Toggling the ability for character: '" + character.name + "' to be " +
                    "selected at random.",
                image: "img://" + character.mug,
                state: OpState.queued,
                icon: randomSelection ? "help" : "help_outline",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.fighterLock],
                call: async () => {
                    api.writeCharacterRandom(character.name, randomSelection);
                    character.randomSelection = randomSelection;
                    setOperations((prev: Operation[]) => {
                        const newOperations: Operation[] = [...prev];
                        newOperations[operationId].state = OpState.finished;
                        newOperations[operationId].body = "Toggled the ability for character: '" +
                            character.name + "' to be selected at random."
                        return newOperations;
                    });
                }
            }) - 1;
            return newOperations;
        });
    }, [randomSelection]);

    return (
        <tr className={styles.characterDisplayRow}>
            <td>
                <div className={styles.characterDisplayWrapper}>
                    <div className={styles.characterDisplayMug}>
                        <img
                            src={"img://" + character.mug}
                            draggable={false}
                            onError={(event: any) => {
                                event.target.src = missing;
                            }}
                        />
                    </div>
                    <div className={styles.characterDisplayName}>
                        <span>{character.menuName}</span>
                    </div>
                    <div className={styles.characterDisplayActions}>
                        <IconButton
                            icon={"delete"}
                            iconSize={"30px"}
                            tooltip={"Delete Character"}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: "Character Deletion",
                                        body: "Deleting character: '" + character.name + "'.",
                                        image: "img://" + character.mug,
                                        state: OpState.queued,
                                        icon: "delete",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [
                                            OpDep.fighters, OpDep.alts, OpDep.fighterLock, OpDep.css
                                        ],
                                        call: async () => {
                                            await api.removeCharacter(character.name);
                                            setOperations((prev: Operation[]) => {
                                                const newOperations: Operation[] = [...prev];
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Deleted " +
                                                    "character: '" + character.name + "'.";
                                                return newOperations;
                                            });
                                            readCharacters();
                                        }
                                    }) - 1;
                                    return newOperations;
                                });
                            }}
                        />
                        <IconButton
                            icon={"drive_file_move"}
                            iconSize={"30px"}
                            tooltip={"Extract Character"}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: "Character Extraction",
                                        body: "Extracting character: '" + character.name + "'.",
                                        image: "img://" + character.mug,
                                        state: OpState.queued,
                                        icon: "drive_file_move",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [OpDep.fighters],
                                        call: async () => {
                                            await api.extractCharacter(character.name);
                                            setOperations((prev: Operation[]) => {
                                                const newOperations: Operation[] = [...prev];
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Extracted " +
                                                    "character: '" + character.name + "'.";
                                                return newOperations;
                                            });
                                        }
                                    }) - 1;
                                    return newOperations;
                                });
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
                            setOperations={setOperations}
                        />
                    </div>
                </div>
            </td>
            <td>
                <div className={styles.characterDisplayAlts}>
                    {character.alts.filter((alt: Alt) => alt.base != alt.alt)
                        .map((alt: Alt, index: number) =>
                            <CharacterAltDisplay
                                alt={alt}
                                readCharacters={readCharacters}
                                setOperations={setOperations}
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
    setOperations
}: {
    alt: Alt,
    readCharacters: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    return (
        <div className={styles.altDisplayWrapper}>
            <div className={styles.altDisplayMug}>
                <img
                    src={"img://" + alt.mug}
                    draggable={false}
                    onError={(event: any) => {
                        event.target.src = missing;
                    }}
                />
            </div>
            <div className={styles.altDisplayName}>
                <span>{alt.menuName}</span>
            </div>
            <div className={styles.altDisplayActions}>
                <IconButton
                    icon={"group_remove"}
                    iconSize={"30px"}
                    tooltip={"Remove Alt"}
                    onClick={async () => {
                        let operationId: number;
                        setOperations((prev: Operation[]) => {
                            const newOperations: Operation[] = [...prev];
                            operationId = newOperations.push({
                                title: "Alt Removal",
                                body: "Removing alt: '" + alt.alt + "' from character: '" +
                                    alt.base + "'.",
                                image: "img://" + alt.mug,
                                state: OpState.queued,
                                icon: "group_remove",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [OpDep.fighters, OpDep.alts],
                                call: async () => {
                                    await api.removeAlt(alt);
                                    setOperations((prev: Operation[]) => {
                                        const newOperations: Operation[] = [...prev];
                                        newOperations[operationId].state = OpState.finished;
                                        newOperations[operationId].body = "Removed alt: '" +
                                            alt.alt + "' from character: '" + alt.base + "'.";
                                        return newOperations;
                                    });
                                    readCharacters();
                                }
                            }) - 1;
                            return newOperations;
                        });
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
    setOperations
}: {
    character: Character,
    altTarget: Character,
    setAltTarget: Dispatch<SetStateAction<Character>>,
    readCharacters: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
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
                let operationId: number;
                setOperations((prev: Operation[]) => {
                    const newOperations: Operation[] = [...prev];
                    operationId = newOperations.push({
                        title: "Alt Addition",
                        body: "Adding alt: '" + character.name + "' to character: '" +
                            altTarget.name + "'.",
                        image: "img://" + character.mug,
                        state: OpState.queued,
                        icon: "person_add",
                        animation: Math.floor(Math.random() * 3),
                        dependencies: [OpDep.fighters, OpDep.alts, OpDep.fighterLock, OpDep.css],
                        call: async () => {
                            await api.addAlt(altTarget, character);
                            setAltTarget(null);
                            setOperations((prev: Operation[]) => {
                                const newOperations: Operation[] = [...prev];
                                newOperations[operationId].state = OpState.finished;
                                newOperations[operationId].body = "Added alt: '" + character.name +
                                    "' to character: '" + altTarget.name + "'.";
                                return newOperations;
                            });
                            readCharacters();
                        }
                    }) - 1;
                    return newOperations;
                });
            }}
        />
    );
}

function SeriesDisplay({
    series,
    readCharacters,
    setOperations
}: {
    series: string,
    readCharacters: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    return (
        <tr>
            <th className={styles.seriesDisplayWrapper}>
                <div className={styles.seriesDisplayName}>
                    <span>{series.toUpperCase()}</span>
                </div>
                <IconButton
                    icon={"delete_sweep"}
                    iconSize={"30px"}
                    tooltip={"Delete All Characters In Series"}
                    onClick={async () => {
                        let operationId: number;
                        setOperations((prev: Operation[]) => {
                            const newOperations: Operation[] = [...prev];
                            operationId = newOperations.push({
                                title: "Series Deletion",
                                body: "Deleting all characters in series: '" + series + "'.",
                                state: OpState.queued,
                                icon: "delete_sweep",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [
                                    OpDep.fighters, OpDep.alts, OpDep.fighterLock, OpDep.css
                                ],
                                call: async () => {
                                    await api.removeSeriesCharacters(series);
                                    setOperations((prev: Operation[]) => {
                                        const newOperations: Operation[] = [...prev];
                                        newOperations[operationId].state = OpState.finished;
                                        newOperations[operationId].body = "Deleted all " +
                                            "characters in series: '" + series + "'.";
                                        return newOperations;
                                    });
                                    readCharacters();
                                }
                            }) - 1;
                            return newOperations;
                        });
                        api.getGameDir().then((gameDir: string) => {
                            api.pathJoin(
                                gameDir, "gfx", "seriesicon", series + ".png"
                            ).then((path: string) => {
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    newOperations[operationId].image = "img://" + path;
                                    return newOperations;
                                });
                            });
                        });
                    }}
                />
            </th>
        </tr>
    );
}