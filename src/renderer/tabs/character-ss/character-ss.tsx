import { Dispatch, SetStateAction, useEffect, useState } from "react";
import IconButton from "../../icon-buttons/icon-button";
import ToggleIconButton from "../../icon-buttons/toggle-icon-button";
import CycleIconButton from "../../icon-buttons/cycle-icon-button";
import missing from "../../../assets/missing.png";
import {
    CharacterList, DndDataType, OpDep, OpState, SortTypeOptions
} from "../../../global/global";
import appStyles from "../../app/app.css";
import characterSsStyles from "./character-ss.css";
const styles: typeof import("../../app/app.css") & typeof import("./character-ss.css") =
    Object.assign({}, appStyles, characterSsStyles);

const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.number,
    SortTypeOptions.series,
    SortTypeOptions.menuName
];

export function TabCharacterSelectionScreen({
    setOperations
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
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

    api.on("installCharacter", getInfo);
    api.on("installStage", (): void => null);

    async function getInfo(): Promise<void> {
        const characters: Character[] = await api.readCharacters();
        // characters[9998] = {
        characters.push({
            name: "random",
            menuName: "Random",
            series: "random",
            randomSelection: false,
            number: 9999,
            alts: [],
            mug: await api.pathJoin(await api.getGameDir(), "gfx", "mugs", "random.png")
        });
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
                if (row.includes(("0000" + character.number).slice(-4))) {
                    return false;
                }
            }
            return true;
        }));
    }, [characters, cssData]);

    async function updateCssData(data: CssData): Promise<void> {
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "Write CSS Data",
                body: "Writing modified CSS data to page: '" + activePage.name + "'.",
                state: OpState.queued,
                icon: "pan_tool_alt",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.css],
                call: async () => {
                    await api.writeCssData(activePage, data);
                    getCssData();
                    setOperations((prev: Operation[]) => {
                        const newOperations: Operation[] = [...prev];
                        newOperations[operationId].state = OpState.finished;
                        newOperations[operationId].body = "Wrote modified CSS data to page: '" +
                            activePage.name + "'.";
                        return newOperations;
                    });
                }
            }) - 1;
            return newOperations;
        });
    }

    function characterDragAndDrop(from: DndData, to: DndData): void {
        console.log(from, to);
        const newCssData: CssData = cssData;
        if (from.type == DndDataType.ssNumber) {
            if (to.type == DndDataType.ssNumber) {
                newCssData[from.y][from.x] = to.number;
                newCssData[to.y][to.x] = from.number;
            } else {
                newCssData[from.y][from.x] = "0000";
            }
        } else {
            if (to.type == DndDataType.ssNumber) {
                newCssData[to.y][to.x] = from.number;
            } else {
                return;
            }
        }
        updateCssData(newCssData);
    }

    return (
        <section>
            <div id={styles.pagesDiv}>
                <div className={styles.center}>
                    <CssPages
                        cssPages={cssPages}
                        activePage={activePage}
                        setActivePage={setActivePage}
                        getPages={getPages}
                        setOperations={setOperations}
                    />
                </div>
            </div>
            <hr/>
            <div id={styles.cssDiv}>
                <div id={styles.cssWrapper}>
                    <div className={styles.center}>
                        <table id={styles.cssTable}>
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
    [number, Dispatch<SetStateAction<number>>]
    = useState(0);

    const [reverseSort, setReverseSort]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);

    const [showAllCharacters, setShowAllCharacters]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);

    const [sortedCharacters, setSortedCharacters]:
    [Character[], Dispatch<SetStateAction<Character[]>>]
    = useState([]);

    useEffect(() => {
        setSortedCharacters(sortCharacters(characters));
        console.log(sortCharacters(characters));
    }, [characters, excluded, sortType, reverseSort, showAllCharacters, searchValue]);

    function sortCharacters(characters: Character[]): Character[] {
        let sortedCharacters: Character[] = showAllCharacters ? characters : excluded;
        if (searchValue != "") {
            sortedCharacters = sortedCharacters.filter((character: Character) =>
                (character.menuName.toLowerCase().includes(searchValue))
            );
        }
        sortedCharacters = sortedCharacters.toSorted((a: Character, b: Character) =>
            (a[sortTypes[sortType]] > b[sortTypes[sortType]] ? 1 : -1)
        );
        if (reverseSort) {
            sortedCharacters.reverse();
        }
        return sortedCharacters;
    }

    return (
        <>
            <div id={styles.sortExcludedDiv}>
                <div className={styles.center}>
                    <div className={styles.tooltipWrapper + " " + styles.inlineSortOptions}>
                        <input
                            type={"text"}
                            placeholder={"Search"}
                            id={styles.excludedSearch}
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
                                "Sort By: Franchise",
                                "Sort By: Alphabetical"
                            ]}
                            iconSize={"30px"}
                            setter={setSortType}
                        />
                        <ToggleIconButton
                            checked={reverseSort}
                            trueIcon={"west"}
                            trueTooltip={"Sort Direction: Backwards"}
                            falseIcon={"east"}
                            falseTooltip={"Sort Direction: Forwards"}
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
            <div id={styles.excludedDiv}>
                <div className={styles.center}>
                    <div id={styles.excludedWrapper}>
                        {sortType == sortTypes.indexOf(SortTypeOptions.series) ?
                            sortedCharacters.map((
                                character: Character,
                                index: number
                            ) => {
                                if (character == undefined) return null;
                                const characterDisplay: JSX.Element = (
                                    <CharacterDisplay
                                        character={character}
                                        characterDragAndDrop={characterDragAndDrop}
                                        key={character.name}
                                    />
                                );
                                if (
                                    index == 0 ||
                                    character.series != sortedCharacters[index - 1].series
                                ) {
                                    return (
                                        <>
                                            <div className={styles.seriesName}>
                                                <span>
                                                    <b>{character.series.toUpperCase()}</b>
                                                </span>
                                            </div>
                                            {characterDisplay}
                                        </>
                                    );
                                }
                                return characterDisplay;
                            }) :
                            sortedCharacters.map((
                                character: Character
                            ) => character == undefined ? null :
                                <CharacterDisplay
                                    character={character}
                                    characterDragAndDrop={characterDragAndDrop}
                                    key={character.name}
                                />
                            )
                        }
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
        type: DndDataType.excluded,
        number: ("0000" + character.number).slice(-4)
    }
    return (
        <div className={styles.excludedDisplayWrapper + " " + styles.tooltipWrapper}>
            <div
                className={styles.excludedDisplayMug}
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
                <img
                    src={"img://" + character.mug}
                    draggable={false}
                    onError={(event: any) => {
                        event.target.src = missing;
                    }}
                />
                <div className={styles.excludedDisplayName}>
                    <span>{character.menuName}</span>
                </div>
            </div>
            <div className={styles.tooltip + " " + styles.excludedTooltip}>
                <span>{character.menuName}</span>
            </div>
        </div>
    );
}

function CssPages({
    cssPages,
    activePage,
    setActivePage,
    getPages,
    setOperations
}: {
    cssPages: CssPage[],
    activePage: CssPage,
    setActivePage: Dispatch<SetStateAction<CssPage>>,
    getPages: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [newPageName, setNewPageName]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    return (
        <div id={styles.pagesWrapper}>
            {cssPages.map((page: CssPage) =>
                <CssPageDisplay
                    page={page}
                    activePage={activePage}
                    setActivePage={setActivePage}
                    getPages={getPages}
                    setOperations={setOperations}
                    key={page.name}
                />
            )}
            <div className={styles.cssPage + " " + styles.addCssPage}>
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
                            let operationId: number;
                            setOperations((prev: Operation[]) => {
                                const newOperations: Operation[] = [...prev];
                                operationId = newOperations.push({
                                    title: "CSS Page Addition",
                                    body: "Adding new CSS page: '" + newPageName + "'.",
                                    state: OpState.queued,
                                    icon: "add",
                                    animation: Math.floor(Math.random() * 3),
                                    dependencies: [OpDep.css, OpDep.gameSettings],
                                    call: async () => {
                                        await api.addCssPage(newPageName);
                                        setOperations((prev: Operation[]) => {
                                            const newOperations: Operation[] = [...prev];
                                            newOperations[operationId].state = OpState.finished;
                                            newOperations[operationId].body = "Added new CSS " +
                                                "page: '" + newPageName + "'.";
                                            return newOperations;
                                        });
                                        getPages();
                                    }
                                }) - 1;
                                return newOperations;
                            });
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
    getPages,
    setOperations
}: {
    page: CssPage,
    activePage: CssPage,
    setActivePage: (state: CssPage) => void,
    getPages: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    return (
        <div className={
            styles.cssPage + (activePage.path == page.path ? " " + styles.cssPageActive : "")
        }>
            <button
                type={"button"}
                onClick={() => {
                    setActivePage(page);
                }}
                className={styles.cssPageButton}
            >
                {page.name}
            </button>
            <IconButton
                icon={"delete"}
                iconSize={"18px"}
                tooltip={"Delete Page"}
                onClick={async () => {
                    let operationId: number;
                    setOperations((prev: Operation[]) => {
                        const newOperations: Operation[] = [...prev];
                        operationId = newOperations.push({
                            title: "CSS Page Deletion",
                            body: "Deleting CSS page: '" + page.name + "'.",
                            state: OpState.queued,
                            icon: "delete",
                            animation: Math.floor(Math.random() * 3),
                            dependencies: [OpDep.css, OpDep.gameSettings],
                            call: async () => {
                                await api.removeCssPage(page);
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    newOperations[operationId].state = OpState.finished;
                                    newOperations[operationId].body = "Deleted CSS page: '" +
                                        page.name + "'.";
                                    return newOperations;
                                });
                                getPages();
                            }
                        }) - 1;
                        return newOperations;
                    });
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
                <th className="cssColumnHeader" id={styles.cssAddColumn}>
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
                <th className="cssRowHeader" id={styles.cssAddRow}>
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
        type: DndDataType.ssNumber,
        number: cell,
        x: x,
        y: y
    };
    const character: Character = characterList.getCharacterByNum(parseInt(cell));
    if (character == undefined) {
        return (
            <td
                className={styles.cssCharacterDisplay}
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
        <td className={styles.cssCharacterDisplay}>
            <div className={styles.tooltipWrapper}>
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
                    <img
                        src={"img://" + character.mug}
                        draggable={false}
                        onError={(event: any) => {
                            event.target.src = missing;
                        }}
                    />
                    <span>{character.menuName}</span>
                </div>
                <div
                    className={styles.tooltip + " " + styles.cssTooltip}
                    hidden={true}
                    onDragEnter={(event: any) => {
                        // console.log(event);
                        event.target.hidden = true;
                    }}
                >
                    <span>{character.menuName}</span>
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
            className={styles.cssColumnHeader}
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
            className={styles.cssRowHeader}
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