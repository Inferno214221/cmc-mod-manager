import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./characters.css";
import IconButton from "../global/icon-button/icon-button";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import CycleIconButton from "../global/icon-button/cycle-icon-button";
import {
    Alt, AppData, Character, SortTypeOptions, StatusDisplayInfo, sortTypes
} from "../../interfaces";
import missing from "../../assets/missing.png";

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
                            await api.installCharacterDir(
                                filterInstallation,
                                updateCharacters
                            );
                            readCharacters();
                        }}
                    />
                    <IconButton
                        icon={"contact_page"}
                        iconSize={"50px"}
                        tooltip={"Install Character From Archive"}
                        onClick={async () => {
                            await api.installCharacterArchive(
                                filterInstallation,
                                updateCharacters
                            );
                            readCharacters();
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
    setAltTarget
}: {
    character: Character,
    readCharacters: () => Promise<void>,
    altTarget: Character,
    setAltTarget: Dispatch<SetStateAction<Character>>
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
                                await api.removeCharacter(character.name);
                                readCharacters();
                            }}
                        />
                        <IconButton
                            icon={"drive_file_move"}
                            iconSize={"30px"}
                            tooltip={"Extract Character"}
                            onClick={() => {
                                api.extractCharacter(character.name);
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
    readCharacters
}: {
    alt: Alt,
    readCharacters: () => Promise<void>
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
                        await api.removeAlt(alt);
                        readCharacters();
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
    readCharacters
}: {
    character: Character,
    altTarget: Character,
    setAltTarget: Dispatch<SetStateAction<Character>>,
    readCharacters: () => Promise<void>
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
                await api.addAlt(altTarget, character);
                setAltTarget(null);
                readCharacters();
            }}
        />
    );
}

function SeriesDisplay({
    series,
    readCharacters
}: {
    series: string,
    readCharacters: () => Promise<void>
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
                        await api.removeSeriesCharacters(series);
                        readCharacters();
                    }}
                />
            </th>
        </tr>
    );
}