import { Dispatch, SetStateAction, useState, useEffect } from "react";
import "./character-selection-screen.css";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import IconButton from "../global/icon-button/icon-button";
import {
    Character, CharacterList, CssPage, CssData, SortTypes, DndData, DndDataType
} from "../../interfaces";

export default function TabCharacterSelectionScreen(): JSX.Element {
    const [characters, setCharacters]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

    const [characterList, setCharacterList]:
    [CharacterList, Dispatch<SetStateAction<CharacterList>>]
    = useState(null);

    const [excluded, setExcluded]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

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
        const characters: Character[] = await api.readCharcters();
        characters[9998] = {
            name: "random",
            displayName: "Random",
            series: null,
            randomSelection: false,
            cssNumber: 9999,
            alts: [],
            mug: await api.pathJoin(await api.getGameDir(), "gfx", "mugs", "random.png")
        };
        setCharacters(characters)
        getPages();
    }

    async function getPages(): Promise<void> {
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

    useEffect(() => {
        if (characters == null || cssData == null) return;
        setExcluded(characters.filter((character: Character) => {
            for (const row of cssData) {
                if (row.includes(("0000" + character.cssNumber).slice(-4))) {
                    return false;
                }
            }
            return true;
        }));
    }, [characters, cssData]);

    async function updateCssData(data: CssData): Promise<void> {
        await api.writeCssData(activePage, data);
        getCssData();
    }

    function characterDragAndDrop(from: DndData, to: DndData): void {
        console.log(from, to);
        const newCssData: CssData = cssData;
        if (from.type == DndDataType.cssCharacter) {
            if (to.type == DndDataType.cssCharacter) {
                newCssData[from.y][from.x] = to.cssNumber;
                newCssData[to.y][to.x] = from.cssNumber;
            } else {
                newCssData[from.y][from.x] = "0000";
            }
        } else {
            if (to.type == DndDataType.cssCharacter) {
                newCssData[to.y][to.x] = from.cssNumber;
            } else {
                return;
            }
        }
        updateCssData(newCssData);
    }

    return (
        <section>
            <div id={"pages-div"}>
                <div className={"center"}>
                    <CssPages
                        cssPages={cssPages}
                        activePage={activePage}
                        setActivePage={setActivePage}
                        getPages={getPages}
                    />
                </div>
            </div>
            <hr/>
            <div id={"css-div"}>
                <div id={"css-wrapper"}>
                    <div className={"center"}>
                        <table id={"css-table"}>
                            <tbody>
                                <CssTableContents
                                    cssData={cssData}
                                    setCssData={setCssData}
                                    characterList={characterList}
                                    updateCssData={updateCssData}
                                    characterDragAndDrop={characterDragAndDrop}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <hr/>
            <ExcludedCharacters
                characters={characters}
                excluded={excluded}
                characterDragAndDrop={characterDragAndDrop}
            />
        </section>
    );
}

function ExcludedCharacters({
    characters,
    excluded,
    characterDragAndDrop
}: {
    characters: Character[],
    excluded: Character[],
    characterDragAndDrop: (from: DndData, to: DndData) => void
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

    const [showAllCharacters, setShowAllCharacters]:
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
                        <ToggleIconButton
                            checked={showAllCharacters}
                            trueIcon={"groups"}
                            trueTooltip={"Showing: All Characters"}
                            falseIcon={"person_outline"}
                            falseTooltip={"Showing: Excluded Characters"}
                            iconSize={"30px"}
                            setter={setShowAllCharacters}
                        />
                    </div>
                </div>
            </div>
            <div id={"excluded-div"}>
                <div className={"center"}>
                    <div id={"excluded-wrapper"}>
                        {sortCharacters(
                            showAllCharacters ? characters : excluded
                        ).map((character: Character) =>
                            character == undefined ? null :
                                <CharacterDisplay
                                    character={character}
                                    characterDragAndDrop={characterDragAndDrop}
                                    key={character.name}
                                />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function CharacterDisplay({
    character,
    characterDragAndDrop
}: {
    character: Character,
    characterDragAndDrop: (from: DndData, to: DndData) => void
}): JSX.Element {
    const dndData: DndData = {
        type: DndDataType.excludedCharacter,
        cssNumber: ("0000" + character.cssNumber).slice(-4)
    }
    return (
        <div className={"excluded-display-wrapper tooltip-wrapper"}>
            <div
                className={"excluded-display-mug"}
                draggable={true}
                onDragStart={(event: any) => {
                    event.dataTransfer.setData("data", JSON.stringify(dndData));
                }}
                onDragOver={(event: any) => {
                    event.preventDefault();
                }}
                onDrop={(event: any) => {
                    characterDragAndDrop(
                        JSON.parse(event.dataTransfer.getData("data")),
                        dndData
                    );
                }}
            >
                <img src={"img://" + character.mug} draggable={false} />
                <div className={"excluded-display-name"}>
                    <span>{character.displayName}</span>
                </div>
            </div>
            <div className={"tooltip excluded-tooltip"}>
                <span>{character.displayName}</span>
            </div>
        </div>
    );
}

function CssPages({
    cssPages,
    activePage,
    setActivePage,
    getPages
}: {
    cssPages: CssPage[],
    activePage: CssPage,
    setActivePage: Dispatch<SetStateAction<CssPage>>,
    getPages: () => Promise<void>
}): JSX.Element {
    const [newPageName, setNewPageName]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    return (
        <div id={"pages-wrapper"}>
            {cssPages.map((page: CssPage) =>
                <CssPageDisplay
                    page={page}
                    activePage={activePage}
                    setActivePage={setActivePage}
                    getPages={getPages}
                    key={page.name}
                />
            )}
            <div className={"css-page add-css-page"}>
                <input
                    type={"text"}
                    placeholder={"Page Name"}
                    onInput={(event: any) => {
                        event.target.value = event.target.value.replace(/'|"/g, "");
                        setNewPageName(event.target.value);
                    }}
                />
                <IconButton
                    icon={"add"}
                    iconSize={"18px"}
                    tooltip={"Add Page"}
                    onClick={async () => {
                        if (newPageName != "") {
                            await api.addCssPage(newPageName);
                            getPages();
                        }
                    }}
                />
            </div>
        </div>
    );
}

function CssPageDisplay({
    page,
    activePage,
    setActivePage,
    getPages
}: {
    page: CssPage,
    activePage: CssPage,
    setActivePage: (state: CssPage) => void,
    getPages: () => Promise<void>
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
                onClick={async () => {
                    await api.removeCssPage(page);
                    getPages()
                }}
            />
        </div>
    );
}

function CssTableContents({
    cssData,
    setCssData,
    characterList,
    updateCssData,
    characterDragAndDrop
}: {
    cssData: CssData,
    setCssData: Dispatch<SetStateAction<CssData>>,
    characterList: CharacterList,
    updateCssData: (data: CssData) => Promise<void>,
    characterDragAndDrop: (from: DndData, to: DndData) => void
}): JSX.Element {
    return (cssData == null || characterList == null) ? null : (
        <>
            <tr>
                <th></th>
                {cssData[0].map((cell: string, index: number) =>
                    <CssColumnHeader
                        column={index}
                        setCssData={setCssData}
                        updateCssData={updateCssData}
                        key={index}
                    />
                )}
                <th className="css-column-header" id={"css-add-column"}>
                    <IconButton
                        icon={"add"}
                        iconSize={"11pt"}
                        tooltip={"Add Column"}
                        onClick={() => setCssData((prev: CssData) => {
                            prev = prev.map((row: string[]) => {
                                row.push("0000");
                                return row;
                            });
                            updateCssData(prev);
                            return prev;
                        })}
                    />
                </th>
            </tr>
            {cssData.map((row: string[], yIndex: number) =>
                <tr key={yIndex}>
                    <CssRowHeader
                        row={yIndex}
                        setCssData={setCssData}
                        updateCssData={updateCssData}
                        key={yIndex}
                    />
                    {row.map((cell: string, xIndex: number) =>
                        <CssCharacterDisplay
                            cell={cell}
                            characterList={characterList}
                            x={xIndex}
                            y={yIndex}
                            characterDragAndDrop={characterDragAndDrop}
                            key={xIndex}
                        />
                    )}
                </tr>
            )}
            <tr>
                <th className="css-row-header" id={"css-add-row"}>
                    <IconButton
                        icon={"add"}
                        iconSize={"11pt"}
                        tooltip={"Add Row"}
                        onClick={() => setCssData((prev: CssData) => {
                            prev.push([]);
                            prev[0].forEach(() => {
                                prev[prev.length - 1].push("0000");
                            });
                            updateCssData(prev);
                            return prev;
                        })}
                    />
                </th>
            </tr>
        </>
    );
}

function CssCharacterDisplay({
    cell,
    characterList,
    x, y,
    characterDragAndDrop
}: {
    cell: string,
    characterList: CharacterList,
    x: number, y: number,
    characterDragAndDrop: (from: DndData, to: DndData) => void
}): JSX.Element {
    const dndData: DndData = {
        type: DndDataType.cssCharacter,
        cssNumber: cell,
        x: x,
        y: y
    };
    const character: Character = characterList.getCharacterByNum(parseInt(cell));
    if (character == undefined) {
        return (
            <td
                className={"css-character-display"}
                onDragOver={(event: any) => {
                    event.preventDefault();
                }}
                onDrop={(event: any) => {
                    characterDragAndDrop(
                        JSON.parse(event.dataTransfer.getData("data")),
                        dndData
                    );
                }}
            >
            </td>
        );
    }
    return (
        <td className={"css-character-display"}>
            <div className={"tooltip-wrapper"}>
                <div
                    draggable={true}
                    onDragStart={(event: any) => {
                        // console.log(event);
                        event.dataTransfer.setData("data", JSON.stringify(dndData));
                    }}
                    onDragOver={(event: any) => {
                        event.preventDefault();
                    }}
                    onDrop={(event: any) => {
                        characterDragAndDrop(
                            JSON.parse(event.dataTransfer.getData("data")),
                            dndData
                        );
                    }}
                    onMouseEnter={(event: any) => {
                        // console.log(event);
                        event.target
                            .parentElement
                            .nextElementSibling
                            .firstElementChild
                            .hidden = false;
                    }}
                >
                    <img src={"img://" + character.mug} draggable={false}/>
                    <span>{character.displayName}</span>
                </div>
                <div
                    className={"tooltip css-tooltip"}
                    hidden={true}
                    onDragEnter={(event: any) => {
                        // console.log(event);
                        event.target.hidden = true;
                    }}
                >
                    <span>{character.displayName}</span>
                </div>
            </div>
        </td>
    );
}

function CssColumnHeader({
    column,
    setCssData,
    updateCssData
}: {
    column: number,
    setCssData: Dispatch<SetStateAction<CssData>>,
    updateCssData: (data: CssData) => Promise<void>
}): JSX.Element {
    const [hovered, setHovered]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);
    return (
        <th
            className={"css-column-header"}
            onMouseOver={() => {
                setHovered(true);
            }}
            onMouseOut={() => {
                setHovered(false);
            }}
        >
            {hovered ?
                <IconButton
                    icon={"remove"}
                    iconSize={"11pt"}
                    tooltip={"Remove Column"}
                    onClick={() => setCssData((prev: CssData) => {
                        prev.map((row: string[]) => {
                            row.splice(column, 1);
                            return row;
                        });
                        // prev.splice(row, 1);
                        updateCssData(prev);
                        return prev;
                    })}
                />
                : column
            }
        </th>
    );
}

function CssRowHeader({
    row,
    setCssData,
    updateCssData
}: {
    row: number,
    setCssData: Dispatch<SetStateAction<CssData>>,
    updateCssData: (data: CssData) => Promise<void>
}): JSX.Element {
    const [hovered, setHovered]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);
    return (
        <th
            className={"css-row-header"}
            onMouseOver={() => {
                setHovered(true);
            }}
            onMouseOut={() => {
                setHovered(false);
            }}
        >
            {hovered ?
                <IconButton
                    icon={"remove"}
                    iconSize={"11pt"}
                    tooltip={"Remove Row"}
                    onClick={() => setCssData((prev: CssData) => {
                        prev.splice(row, 1);
                        updateCssData(prev);
                        return prev;
                    })}
                />
                : row
            }
        </th>
    );
}