import { Dispatch, SetStateAction, useState, useEffect } from "react";
import "./characters.css";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import IconButton from "../global/icon-button/icon-button";
import { Character, SortTypes } from "../../interfaces";

export default function TabCharacters(): JSX.Element {
    const [filterInstallation, setFilterInstallation]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(true);
    const [updateCharacters, setUpdateCharacters]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);
    const [characters, setCharacters]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

    async function getCharacters(): Promise<void> {
        setCharacters(await api.getCharacters());
    }

    useEffect(() => {
        getCharacters();
    }, []);

    return (
        <>
            <section>
                <CharacterList
                    characters={characters}
                    getCharacters={getCharacters}
                />
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
                                getCharacters();
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
                                getCharacters();
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
                        <IconButton
                            icon={"delete_sweep"}
                            iconSize={"50px"}
                            tooltip={"Remove All Characters"}
                            onClick={() => {console.log("a")}}
                        />
                        {/* <vr/> */}
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
        </>
    );
}

function CharacterList({
    characters,
    getCharacters
}: {
    characters: Character[],
    getCharacters: () => Promise<void>
}): JSX.Element {
    const [searchValue, setSearchValue]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    const [sortType, setSortType]:
    [SortTypes, Dispatch<SetStateAction<SortTypes>>]
    = useState(SortTypes.cssNumber);

    const [reverseSort, setReverseSort]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);
    
    function sortCharacters(characters: Character[]): Character[] {
        let sortedCharacters: Character[] = characters;
        if (searchValue != "") {
            sortedCharacters = sortedCharacters.filter((character: Character) => 
                (character.displayName.toLowerCase().includes(searchValue))
            );
        }
        sortedCharacters = sortedCharacters.toSorted((a: Character, b: Character) => 
            (a[sortType] > b[sortType] ? 1 : -1)
        );
        if (reverseSort) {
            sortedCharacters.reverse();
        }
        return sortedCharacters;
    }
    return (
        <>
            <div id={"sort-div"}>
                <div className={"center"}>
                    <div className={"tooltip-wrapper inline-sort-options"}>
                        <input
                            type={"text"}
                            placeholder={"Search"}
                            // id={"characterSearch"}
                            onInput={(event: any) => {
                                setSearchValue(event.target.value);
                                console.log(searchValue, sortType, reverseSort);
                            }}
                        />
                        <div className={"tooltip"}>
                            <span>Search For Characters</span>
                        </div>
                    </div>
                    <div className={"tooltip-wrapper inline-sort-options"}>
                        <select
                            id="sort-type-select"
                            onChange={(event: any) => {
                                setSortType(event.target.value);
                            }}
                        >
                            <option value="cssNumber">Internal Number</option>
                            <option value="series">Franchise</option>
                            <option value="displayName">Alphabetical</option>
                        </select>
                        <div className={"tooltip"}>
                            <span>Sorting Method</span>
                        </div>
                    </div>
                    <div className={"inline-sort-options"}>
                        <ToggleIconButton
                            checked={reverseSort}
                            trueIcon={"north"}
                            trueTooltip={"Sorted Direction: Backwards"}
                            falseIcon={"south"}
                            falseTooltip={"Sorted Direction: Forwards"}
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
                            {sortCharacters(characters).map((character: Character) => {
                                return (
                                    <CharacterDisplay
                                        character={character}
                                        key={character.name}
                                        getCharacters={getCharacters}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>        
            </div>
        </>
    );
}

function CharacterDisplay({
    character,
    getCharacters
}: {
    character: Character,
    getCharacters: () => Promise<void>
}): JSX.Element {
    const [randomSelection, setRandomSelection]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(character.randomSelection);

    return (
        <tr>
            <td>
                <img src={"img://" + character.mug} draggable={false}/>
            </td>
            <td>
                <span>{character.displayName}</span>
            </td>
            <td>
                <IconButton
                    icon={"launch"}
                    iconSize={"30px"}
                    tooltip={"Extract Character"}
                    onClick={() => {
                        api.extractCharacter(character.name);
                    }}
                />
                <IconButton
                    icon={"delete"}
                    iconSize={"30px"}
                    tooltip={"Remove Character"}
                    onClick={async () => {
                        await api.removeCharacter(character.name);
                        getCharacters();
                    }}
                />
                <ToggleIconButton
                    checked={randomSelection}
                    trueIcon={"shuffle_on"}
                    trueTooltip={"Random Selection: Enabled"}
                    falseIcon={"shuffle"}
                    falseTooltip={"Random Selection: Disabled"}
                    iconSize={"30px"}
                    setter={(state: boolean) => {
                        setRandomSelection(state);
                        api.writeCharacterRandom(character.name, state);
                    }}
                />
            </td>
        </tr>
    );
}