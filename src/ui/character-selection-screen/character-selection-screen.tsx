import { Dispatch, SetStateAction, useState, useEffect } from "react";
import "./character-selection-screen.css";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import IconButton from "../global/icon-button/icon-button";
import { Character, CharacterList, CssPage, CssData, SortTypes } from "../../interfaces";

export default function TabCharacterSelectionScreen(): JSX.Element {
    const [characters, setCharacters]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

    const [characterList, setCharacterList]:
    [CharacterList, Dispatch<SetStateAction<CharacterList>>]
    = useState(null);

    const [cssPages, setCssPages]:
    [CssPage[], Dispatch<SetStateAction<CssPage[]>>]
    = useState([]);

    const [activePage, setActivePage]:
    [CssPage, Dispatch<SetStateAction<CssPage>>]
    = useState(null);

    const [cssData, setCssData]:
    [CssData, Dispatch<SetStateAction<CssData>>]
    = useState(null);

    async function getInfo(): Promise<void> {
        setCharacters(await api.getCharacters());
        const pages: CssPage[] = await api.readCssPages();
        setCssPages(pages);
        setActivePage(pages[0]);
    }

    useEffect(() => {
        getInfo();
    }, []);

    async function getCssData(): Promise<void> {
        if (activePage == null) return;
        setCssData(await api.readCssData(activePage));
        console.log(await api.readCssData(activePage));
    }

    useEffect(() => {
        getCssData();
    }, [activePage]);

    useEffect(() => {
        setCharacterList(new CharacterList(characters));
    }, [characters]);

    return (
        <section>
            <div id={"pages-div"}>
                <div className={"center"}>
                    <div id={"pages-wrapper"}>
                        {cssPages.map((page: CssPage) =>
                            <CssPageDisplay
                                page={page}
                                activePage={activePage}
                                setActivePage={setActivePage}
                                key={page.name}
                            />
                        )}
                    </div>
                </div>
            </div>
            <hr/>
            <div id={"css-div"}>
                <div id={"css-wrapper"}>
                    <div className={"center"}>
                        <table>
                            <tbody>
                                <CssTableContents
                                    cssData={cssData}
                                    characterList={characterList}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <hr/>
            <ExcludedCharacters
                characters={characters}
            />
        </section>
    );
}

function ExcludedCharacters({ characters }: { characters: Character[] }): JSX.Element {
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
            <div id={"sort-excluded-div"}>
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
                            trueIcon={"west"}
                            trueTooltip={"Sorted Direction: Backwards"}
                            falseIcon={"east"}
                            falseTooltip={"Sorted Direction: Forwards"}
                            iconSize={"30px"}
                            setter={setReverseSort}
                        />
                    </div>
                </div>
            </div>
            <div id={"excluded-div"}>
                <div className={"center"}>
                    <div id={"excluded-wrapper"}>
                        {sortCharacters(characters).map((character: Character) =>
                            <CharacterDisplay
                                character={character}
                                key={character.name}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function CharacterDisplay({ character }: { character: Character }): JSX.Element {
    // Draggable
    return (
        <div className={"excluded-display-wrapper"}>
            <div className={"excluded-display-mug tooltip-wrapper"}>
                <img src={"img://" + character.mug} draggable={false}/>
                <div className={"tooltip excluded-tooltip"}>
                    <span>{character.displayName}</span>
                </div>
            </div>
            <div className={"excluded-display-name"}>
                <span>{character.displayName}</span>
            </div>
        </div>
    );
}

function CssPageDisplay({
    page,
    activePage,
    setActivePage
}: {
    page: CssPage,
    activePage: CssPage,
    setActivePage: (state: CssPage) => void
}): JSX.Element {
    return (
        <div className={"css-page" + (activePage == page ? " css-page-active" : "")}>
            <button
                type={"button"}
                onClick={() => {
                    setActivePage(page);
                }}
                className={"css-page-button"}
            >
                {page.name}
            </button>
            <IconButton
                icon={"delete"}
                iconSize={"18px"}
                tooltip={"Delete Page"}
                onClick={() => {console.log("e")}}
            />
        </div>
    );
}

function CssTableContents({
    cssData,
    characterList
}: {
    cssData: CssData,
    characterList: CharacterList
}): JSX.Element {
    return (cssData == null || characterList == null) ? null : (
        <>
            <tr>
                <th></th>
                {cssData[0].map((cell: string, index: number) =>
                    <th key={index}>{index}</th>
                )}
                <td rowSpan={cssData.length + 1}>
                    <div className={"center"}>
                        <button>-</button>
                    </div>
                </td>
                <td rowSpan={cssData.length + 1}>
                    <div className={"center"}>
                        <button>+</button>
                    </div>
                </td>
            </tr>
            {cssData.map((row: string[], index: number) =>
                <tr key={index}>
                    <th>{index}</th>
                    {row.map((cell: string, index: number) =>
                        <th key={index}>{
                            (characterList.getCharacterByNum(parseInt(cell)) == undefined) ? null :
                                characterList.getCharacterByNum(parseInt(cell)).displayName
                                // <CharacterDisplay
                                //     character={characterList.getCharacterByNum(parseInt(cell))}
                                // />
                        }</th>
                    )}
                </tr>
            )}
            <tr>
                <td colSpan={cssData[0].length + 1}>
                    <div className={"center"}>
                        <button>-</button>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={cssData[0].length + 1}>
                    <div className={"center"}>
                        <button>+</button>
                    </div>
                </td>
            </tr>
        </>
    );
}