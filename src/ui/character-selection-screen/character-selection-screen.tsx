import { Dispatch, SetStateAction, useState, useEffect } from "react";
import "./character-selection-screen.css";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import IconButton from "../global/icon-button/icon-button";
import { Character, CssPage, SortTypes } from "../../interfaces";

export default function TabCharacterSelectionScreen(): JSX.Element {
    const [characters, setCharacters]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

    const [cssPages, setCssPages]:
    [CssPage[], Dispatch<SetStateAction<CssPage[]>>]
    = useState([]);

    const [activePage, setActivePage]:
    [CssPage, Dispatch<SetStateAction<CssPage>>]
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

    return (
        <section>
            <div id={"pages-div"}>
                <div className={"center"}>
                    <div id={"pages-wrapper"}>
                        {cssPages.map((page: CssPage) => 
                            <CssPageDisplay
                                page={page}
                                activePage={activePage}
                                key={page.name}
                            />
                        )}
                    </div>
                </div>
            </div>
            <hr/>
            <div id={"css-div"}>
                E
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
            <div className={"excluded-display-mug"}>
                <img src={"img://" + character.mug} draggable={false}/>
            </div>
            <div className={"excluded-display-name"}>
                <span>{character.displayName}</span>
            </div>
        </div>
    );
}

function CssPageDisplay({ page, activePage }: { page: CssPage, activePage: CssPage }): JSX.Element {
    return (
        <div className={"css-page" + (activePage == page ? " css-page-active" : "")}>
            <button
                type={"button"}
                onClick={() => {console.log(page.path)}}
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