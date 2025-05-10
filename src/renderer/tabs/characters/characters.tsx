import { Dispatch, SetStateAction, useEffect, useState } from "react";
import IconButton from "../../icon-buttons/icon-button";
import ToggleIconButton from "../../icon-buttons/toggle-icon-button";
import CycleIconButton from "../../icon-buttons/cycle-icon-button";
import MISSING from "../../../assets/missing.png";
import { OpDep, OpState, SortTypeOptions, finishOp } from "../../../global/global";
import appStyles from "../../app/app.css";
import charactersStyles from "./characters.css";
const styles: typeof import("../../app/app.css") & typeof import("./characters.css") =
    Object.assign({}, appStyles, charactersStyles);

import { translations } from "../../../global/translations";
const { message }: ReturnType<typeof translations> = translations(global.language);

const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.NUMBER,
    SortTypeOptions.SERIES,
    SortTypeOptions.MENU_NAME
];

export function TabCharacters({
    setOperations,
    handle
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>,
    handle: <T>(promise: Promise<T>) => Promise<T>
}): JSX.Element {
    const [filterInstallation, setFilterInstallation]:
    [boolean | null, Dispatch<SetStateAction<boolean | null>>]
    = useState(null);
    
    const [updateCharacters, setUpdateCharacters]:
    [boolean | null, Dispatch<SetStateAction<boolean | null>>]
    = useState(null);

    const [altsAsCharacters, setAltsAsCharacters]:
    [boolean | null, Dispatch<SetStateAction<boolean | null>>]
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
    [Character | null, Dispatch<SetStateAction<Character | null>>]
    = useState(null);

    api.on("updateCharacterPages", readCharacters);
    api.on("updateStagePages", () => null);

    useEffect(() => {
        readCharacters();
        readDefaultConfig();
    }, []);

    async function readCharacters(): Promise<void> {
        setCharacters(await handle(api.readCharacters()));
    }

    async function readDefaultConfig(): Promise<void> {
        const data: AppData = await handle(api.readAppData());
        setFilterInstallation(data.config.filterCharacterInstallation);
        setUpdateCharacters(data.config.updateCharacters);
        setAltsAsCharacters(data.config.altsAsCharacters);
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
        writeSetting("filterCharacterInstallation", filterInstallation);
    }, [filterInstallation]);

    useEffect(() => {
        writeSetting("updateCharacters", updateCharacters);
    }, [updateCharacters]);

    useEffect(() => {
        writeAltsAsCharacters(altsAsCharacters);
    }, [altsAsCharacters]);

    async function writeSetting(
        name: "filterCharacterInstallation" | "updateCharacters" | "altsAsCharacters",
        value: boolean | null
    ): Promise<void> {
        const appData: AppData = await api.readAppData();
        if (value != null && appData.config[name] != value) {
            appData.config[name] = value;
            await api.writeAppData(appData);
        }
    }

    async function writeAltsAsCharacters(value: boolean | null): Promise<void> {
        const appData: AppData = await api.readAppData();
        if (value == null || appData.config["altsAsCharacters"] == value) return;

        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: value ? message("operation.alt.include.started.title") :
                    message("operation.alt.exclude.started.title"),
                body: value ? message("operation.alt.include.started.body") :
                    message("operation.alt.exclude.started.body"),
                state: OpState.QUEUED,
                icon: value ? "diversity_3" : "reduce_capacity",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.FIGHTERS, OpDep.ALTS, OpDep.FIGHTER_LOCK, OpDep.CSS],
                call: async () => {
                    appData.config["altsAsCharacters"] = value;
                    const toResolve: Promise<void>[] = [];
                    toResolve.push(api.writeAppData(appData));
                    toResolve.push(api.ensureAllAltsAreCharacters(value));
                    await Promise.allSettled(toResolve);

                    setOperations(finishOp(
                        operationId,
                        value ? message("operation.alt.include.finished.body") :
                            message("operation.alt.exclude.finished.body")
                    ));

                    readCharacters();
                }
            }) - 1;
            return newOperations;
        });
    }

    return (
        <section>
            <div id={styles.sortDiv}>
                <div className={styles.center}>
                    <div className={styles.tooltipWrapper + " " + styles.inlineSortOptions}>
                        <input
                            type={"text"}
                            placeholder={message("ui.searchPlaceholder")}
                            id={styles.characterSearch}
                            onInput={(event: any) => {
                                setSearchValue(event.target.value);
                                console.log(searchValue, sortType, reverseSort);
                            }}
                        />
                        <div className={styles.tooltip}>
                            <span>{message("tooltip.character.search")}</span>
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
                                message("tooltip.sortBy.number"),
                                message("tooltip.sortBy.series"),
                                message("tooltip.sortBy.alphabetical")
                            ]}
                            iconSize={"30px"}
                            setter={setSortType}
                        />
                        <ToggleIconButton
                            checked={reverseSort}
                            trueIcon={"north"}
                            trueTooltip={message("tooltip.sortDirection.backwards")}
                            falseIcon={"south"}
                            falseTooltip={message("tooltip.sortDirection.forwards")}
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
                            {sortTypes[sortType] == SortTypeOptions.SERIES ?
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
                        tooltip={message("tooltip.character.installDir")}
                        onClick={async () => {
                            api.selectAndInstallCharacters(
                                filterInstallation,
                                updateCharacters,
                                false,
                            );
                        }}
                    />
                    <IconButton
                        icon={"contact_page"}
                        iconSize={"50px"}
                        tooltip={message("tooltip.character.installArch")}
                        onClick={async () => {
                            api.selectAndInstallCharacters(
                                filterInstallation,
                                updateCharacters,
                                true,
                            );
                        }}
                    />
                    <IconButton
                        icon={"source"}
                        iconSize={"50px"}
                        tooltip={message("tooltip.openExtractionDir")}
                        onClick={async () => {
                            api.openDir(await api.getExtractedDir());
                        }}
                    />
                    {/* <hr className={styles.vr}/>
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
                    /> */}
                    <hr className={styles.vr}/>
                    <ToggleIconButton
                        checked={!!filterInstallation}
                        trueIcon={"filter_alt"}
                        trueTooltip={message("tooltip.installation.filter")}
                        falseIcon={"filter_alt_off"}
                        falseTooltip={message("tooltip.installation.all")}
                        iconSize={"50px"}
                        setter={setFilterInstallation}
                    />
                    <ToggleIconButton
                        checked={!!updateCharacters}
                        trueIcon={"sync"}
                        trueTooltip={message("tooltip.character.existing.update")}
                        falseIcon={"sync_disabled"}
                        falseTooltip={message("tooltip.character.existing.abort")}
                        iconSize={"50px"}
                        setter={setUpdateCharacters}
                    />
                    <ToggleIconButton
                        checked={!!altsAsCharacters}
                        trueIcon={"diversity_3"}
                        trueTooltip={message("tooltip.alt.asCharacters.included")}
                        falseIcon={"reduce_capacity"}
                        falseTooltip={message("tooltip.alt.asCharacters.excluded")}
                        iconSize={"50px"}
                        setter={setAltsAsCharacters}
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
    altTarget: Character | null,
    setAltTarget: Dispatch<SetStateAction<Character | null>>,
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
                title: message("operation.character.randomSelection.started.title"),
                body: message("operation.character.randomSelection.started.body", character.name),
                image: "img://" + character.mug,
                state: OpState.QUEUED,
                icon: randomSelection ? "help" : "help_outline",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.FIGHTER_LOCK],
                call: async () => {
                    api.writeCharacterRandom(character.name, randomSelection);
                    character.randomSelection = randomSelection;
                    setOperations(finishOp(
                        operationId,
                        message("operation.character.randomSelection.finished.body", character.name)
                    ));
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
                                event.target.src = MISSING;
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
                            tooltip={message("tooltip.character.delete")}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: message(
                                            "operation.character.deletion.started.title"
                                        ),
                                        body: message(
                                            "operation.character.deletion.started.body",
                                            character.name
                                        ),
                                        image: "img://" + character.mug,
                                        state: OpState.QUEUED,
                                        icon: "delete",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [
                                            OpDep.FIGHTERS, OpDep.ALTS, OpDep.FIGHTER_LOCK,
                                            OpDep.CSS
                                        ],
                                        call: async () => {
                                            await api.removeCharacter(character.name);
                                            setOperations(finishOp(
                                                operationId,
                                                message(
                                                    "operation.character.deletion.finished.body",
                                                    character.name
                                                )
                                            ));
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
                            tooltip={message("tooltip.character.extract")}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: message(
                                            "operation.character.extraction.started.title"
                                        ),
                                        body: message(
                                            "operation.character.extraction.started.body",
                                            character.name
                                        ),
                                        image: "img://" + character.mug,
                                        state: OpState.QUEUED,
                                        icon: "drive_file_move",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [OpDep.FIGHTERS],
                                        call: async () => {
                                            const extractDir: string =
                                                await api.extractCharacter(character.name);
                                            setOperations(finishOp(
                                                operationId,
                                                message(
                                                    "operation.character.extraction.finished.body",
                                                    character.name
                                                ),
                                                {
                                                    icon: "source",
                                                    tooltip: message("tooltip.openExtractedFiles"),
                                                    call: {
                                                        name: "openDir",
                                                        args: [extractDir]
                                                    }
                                                }
                                            ));
                                        }
                                    }) - 1;
                                    return newOperations;
                                });
                            }}
                        />
                        <ToggleIconButton
                            checked={randomSelection}
                            trueIcon={"help"}
                            trueTooltip={message("tooltip.randomSelection.enabled")}
                            falseIcon={"help_outline"}
                            falseTooltip={message("tooltip.randomSelection.disabled")}
                            iconSize={"30px"}
                            setter={setRandomSelection}
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
                        event.target.src = MISSING;
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
                    tooltip={message("tooltip.alt.remove")}
                    onClick={async () => {
                        let operationId: number;
                        setOperations((prev: Operation[]) => {
                            const newOperations: Operation[] = [...prev];
                            operationId = newOperations.push({
                                title: message("operation.alt.removal.started.title"),
                                body: message(
                                    "operation.alt.removal.started.body",
                                    alt.alt,
                                    alt.base
                                ),
                                image: "img://" + alt.mug,
                                state: OpState.QUEUED,
                                icon: "group_remove",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [OpDep.FIGHTERS, OpDep.ALTS],
                                call: async () => {
                                    await api.removeAlt(alt);
                                    setOperations(finishOp(
                                        operationId,
                                        message(
                                            "operation.alt.removal.finished.body",
                                            alt.alt,
                                            alt.base
                                        )
                                    ));
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
    altTarget: Character | null,
    setAltTarget: Dispatch<SetStateAction<Character | null>>,
    readCharacters: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    if (altTarget == null) {
        return (
            <IconButton
                icon={"group_add"}
                iconSize={"30px"}
                tooltip={message("tooltip.alt.addition.toThis")}
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
                tooltip={message("tooltip.alt.addition.cancel")}
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
            tooltip={message("tooltip.alt.addition.thisFor")}
            onClick={async () => {
                let operationId: number;
                setOperations((prev: Operation[]) => {
                    const newOperations: Operation[] = [...prev];
                    operationId = newOperations.push({
                        title: message("operation.alt.addition.started.title"),
                        body: message(
                            "operation.alt.addition.started.body",
                            character.name,
                            altTarget.name
                        ),
                        image: "img://" + character.mug,
                        state: OpState.QUEUED,
                        icon: "person_add",
                        animation: Math.floor(Math.random() * 3),
                        dependencies: [OpDep.FIGHTERS, OpDep.ALTS, OpDep.FIGHTER_LOCK, OpDep.CSS],
                        call: async () => {
                            await api.addAlt(altTarget, character);
                            setAltTarget(null);
                            setOperations(finishOp(
                                operationId,
                                message(
                                    "operation.alt.addition.finished.body",
                                    character.name,
                                    altTarget.name
                                )
                            ));
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
                    tooltip={message("tooltip.character.deleteSeries")}
                    onClick={async () => {
                        let operationId: number;
                        setOperations((prev: Operation[]) => {
                            const newOperations: Operation[] = [...prev];
                            operationId = newOperations.push({
                                title: message("operation.character.seriesDeletion.started.title"),
                                body: message(
                                    "operation.character.seriesDeletion.started.body",
                                    series
                                ),
                                state: OpState.QUEUED,
                                icon: "delete_sweep",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [
                                    OpDep.FIGHTERS, OpDep.ALTS, OpDep.FIGHTER_LOCK, OpDep.CSS
                                ],
                                call: async () => {
                                    await api.removeSeriesCharacters(series);
                                    setOperations(finishOp(
                                        operationId,
                                        message(
                                            "operation.character.seriesDeletion.finished.body",
                                            series
                                        )
                                    ));
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