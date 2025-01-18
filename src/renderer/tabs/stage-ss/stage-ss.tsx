import { Dispatch, SetStateAction, useEffect, useState } from "react";
import IconButton from "../../icon-buttons/icon-button";
import ToggleIconButton from "../../icon-buttons/toggle-icon-button";
import CycleIconButton from "../../icon-buttons/cycle-icon-button";
import MISSING from "../../../assets/missing.png";
import {
    DndDataType, OpDep, OpState, SortTypeOptions, StageList, finishOp
} from "../../../global/global";
import appStyles from "../../app/app.css";
import stageSsStyles from "./stage-ss.css";
const styles: typeof import("../../app/app.css") & typeof import("./stage-ss.css") =
    Object.assign({}, appStyles, stageSsStyles);

const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.NUMBER,
    SortTypeOptions.SERIES,
    SortTypeOptions.MENU_NAME
];

export function TabStageSelectionScreen({
    setOperations
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [stages, setStages]:
    [Stage[], Dispatch<SetStateAction<Stage[]>>]
    = useState([]);

    const [stageList, setStageList]:
    [StageList | null, Dispatch<SetStateAction<StageList | null>>]
    = useState(null);

    const [excluded, setExcluded]:
    [Stage[], Dispatch<SetStateAction<Stage[]>>]
    = useState([]);

    const [sssPages, setSssPages]:
    [SssPage[], Dispatch<SetStateAction<SssPage[]>>]
    = useState([]);

    const [activePage, setActivePage]:
    [number, Dispatch<SetStateAction<number>>]
    = useState(0);

    const [sssData, setSssData]:
    [SssData | null, Dispatch<SetStateAction<SssData | null>>]
    = useState(null);

    api.on("updateCharacterPages", () => null);
    api.on("updateStagePages", getInfo);

    async function getInfo(): Promise<void> {
        const stages: Stage[] = await api.readStages();
        stages.push({
            name: "random",
            menuName: "Random",
            source: "???",
            series: "random",
            randomSelection: false,
            number: 9999,
            icon: await api.pathJoin(await api.getGameDir(), "gfx", "stgicons", "random.png")
        });
        setStages(stages)
        getPages();
    }

    async function getPages(newActivePage?: number): Promise<void> {
        const pages: SssPage[] = await api.readSssPages();
        setSssPages(pages);
        setActivePage(newActivePage ?? 0);
    }

    useEffect(() => {
        getInfo();
    }, []);

    useEffect(() => {
        setStageList(new StageList(stages));
    }, [stages]);

    useEffect(() => {
        if (stages == null || sssPages[activePage] == undefined) return;
        setExcluded(stages.filter((stage: Stage) => {
            for (const row of sssPages[activePage].data) {
                if (row.includes(("0000" + stage.number).slice(-4))) {
                    return false;
                }
            }
            return true;
        }));
    }, [stages, sssPages]);

    function stageDragAndDrop(from: DndData, to: DndData): void {
        console.log(from, to);
        // Can't be called unless sssData has a value
        const newSssData: SssData = [...sssData!];
        if (from.type == DndDataType.SS_NUMBER) {
            if (to.type == DndDataType.SS_NUMBER) {
                newSssData[(from as DndDataSsNumber).y][(from as DndDataSsNumber).x] = to.number;
                newSssData[(to as DndDataSsNumber).y][(to as DndDataSsNumber).x] = from.number;
            } else {
                newSssData[(from as DndDataSsNumber).y][(from as DndDataSsNumber).x] = "0000";
            }
        } else {
            if (to.type == DndDataType.SS_NUMBER) {
                newSssData[(to as DndDataSsNumber).y][(to as DndDataSsNumber).x] = from.number;
            } else {
                return;
            }
        }
        setSssData(newSssData);
    }

    useEffect(() => {
        if (sssPages[activePage] == undefined) return;
        setSssData(sssPages[activePage].data);
    }, [sssPages, activePage]);

    useEffect(() => {
        if (sssPages[activePage] == undefined) return;
        if (sssData == sssPages[activePage].data) return;
        const updatedPages: SssPage[] = [...sssPages];
        updatedPages[activePage].data = sssData!;
        setSssPages(updatedPages);
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "Write SSS Data",
                body: "Writing modified SSS data to page: '" + sssPages[activePage].name + "'.",
                state: OpState.QUEUED,
                icon: "location_pin",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    await api.writeSssPages(sssPages);
                    setOperations(finishOp(
                        operationId,
                        "Wrote modified SSS data to page: '" + sssPages[activePage].name + "'."
                    ));
                }
            }) - 1;
            return newOperations;
        });
    }, [sssData]);

    return (
        <section>
            <div id={styles.pagesDiv}>
                <div className={styles.center}>
                    <SssPages
                        sssPages={sssPages}
                        activePage={activePage}
                        setActivePage={setActivePage}
                        getPages={getPages}
                        setOperations={setOperations}
                    />
                </div>
            </div>
            <hr/>
            <div id={styles.sssDiv}>
                <div id={styles.sssWrapper}>
                    <div className={styles.center}>
                        <table id={styles.sssTable}>
                            <tbody>
                                <SssTableContents
                                    sssData={sssData}
                                    stageList={stageList}
                                    stageDragAndDrop={stageDragAndDrop}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <hr/>
            <ExcludedStages
                stages={stages}
                excluded={excluded}
                stageDragAndDrop={stageDragAndDrop}
            />
        </section>
    );
}

function ExcludedStages({
    stages,
    excluded,
    stageDragAndDrop
}: {
    stages: Stage[],
    excluded: Stage[],
    stageDragAndDrop: (from: DndData, to: DndData) => void
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

    const [showAllStages, setShowAllStages]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);

    const [sortedStages, setSortedStages]:
    [Stage[], Dispatch<SetStateAction<Stage[]>>]
    = useState([]);

    useEffect(() => {
        setSortedStages(sortStages(stages));
        console.log(sortStages(stages));
    }, [stages, excluded, sortType, reverseSort, showAllStages, searchValue]);

    function sortStages(stages: Stage[]): Stage[] {
        let sortedStages: Stage[] = showAllStages ? stages : excluded;
        if (searchValue != "") {
            sortedStages = sortedStages.filter((stage: Stage) =>
                (stage.menuName.toLowerCase().includes(searchValue))
            );
        }
        sortedStages = sortedStages.toSorted((a: Stage, b: Stage) =>
            ((a[sortTypes[sortType]] ?? "zzzzz") > (b[sortTypes[sortType]] ?? "zzzzz") ? 1 : -1)
        );
        if (reverseSort) {
            sortedStages.reverse();
        }
        return sortedStages;
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
                            <span>Search For Stages</span>
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
                            checked={showAllStages}
                            trueIcon={"groups"}
                            trueTooltip={"Showing: All Stages"}
                            falseIcon={"person_outline"}
                            falseTooltip={"Showing: Excluded Stages"}
                            iconSize={"30px"}
                            setter={setShowAllStages}
                        />
                    </div>
                </div>
            </div>
            <div id={styles.excludedDiv}>
                <div className={styles.center}>
                    <div id={styles.excludedWrapper}>
                        {sortTypes[sortType] == SortTypeOptions.SERIES ?
                            sortedStages.map((
                                stage: Stage,
                                index: number
                            ) => {
                                if (stage == undefined) return null;
                                const stageDisplay: JSX.Element = (
                                    <StageDisplay
                                        stage={stage}
                                        stageDragAndDrop={stageDragAndDrop}
                                        key={stage.name}
                                    />
                                );
                                if (
                                    index == 0 ||
                                    stage.series != sortedStages[index - 1].series
                                ) {
                                    return (
                                        <>
                                            <div className={styles.seriesName}>
                                                <span>
                                                    <b>
                                                        {stage.series?.toUpperCase() ?? "undefined"}
                                                    </b>
                                                </span>
                                            </div>
                                            {stageDisplay}
                                        </>
                                    );
                                }
                                return stageDisplay;
                            }) :
                            sortedStages.map((
                                stage: Stage
                            ) => stage == undefined ? null :
                                <StageDisplay
                                    stage={stage}
                                    stageDragAndDrop={stageDragAndDrop}
                                    key={stage.name}
                                />
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

function StageDisplay({
    stage,
    stageDragAndDrop
}: {
    stage: Stage,
    stageDragAndDrop: (from: DndData, to: DndData) => void
}): JSX.Element {
    const dndData: DndData = {
        type: DndDataType.EXCLUDED,
        number: ("0000" + stage.number).slice(-4)
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
                    stageDragAndDrop(
                        JSON.parse(event.dataTransfer.getData("data")),
                        dndData
                    );
                }}
            >
                <img
                    src={"img://" + stage.icon}
                    draggable={false}
                    onError={(event: any) => {
                        event.target.src = MISSING;
                    }}
                />
                <div className={styles.excludedDisplayName}>
                    <span>{stage.menuName}</span>
                </div>
            </div>
            <div className={styles.tooltip + " " + styles.excludedTooltip}>
                <span>{stage.menuName}</span>
            </div>
        </div>
    );
}

function SssPages({
    sssPages,
    activePage,
    setActivePage,
    getPages,
    setOperations
}: {
    sssPages: SssPage[],
    activePage: number,
    setActivePage: Dispatch<SetStateAction<number>>,
    getPages: (newActivePage?: number) => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [newPageName, setNewPageName]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    function reorderSssPage(from: number, to: number): void {
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "Reorder SSS Pages",
                body: "Moving SSS page: '" + sssPages[from].name + "' to index: " +
                    (to > from ? to - 1 : to) + ".",
                state: OpState.QUEUED,
                icon: "swap_horiz",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    await api.reorderSssPage(from, to);
                    setOperations(finishOp(
                        operationId,
                        "Moved SSS page: '" + sssPages[from].name + "' to index: " +
                        (to > from ? to - 1 : to) + "."
                    ));
                    getPages();
                }
            }) - 1;
            return newOperations;
        });
    }

    function createNewPage(): void {
        if (newPageName == "") return;
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "SSS Page Addition",
                body: "Adding new SSS page: '" + newPageName + "'.",
                state: OpState.QUEUED,
                icon: "add",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    const newPage: SssPage = await api.addSssPage(newPageName);
                    setOperations(finishOp(
                        operationId,
                        "Added new SSS page: '" + newPageName + "'."
                    ));
                    getPages(newPage.pageNumber);
                }
            }) - 1;
            return newOperations;
        });
    }

    return (
        <div id={styles.pagesWrapper}>
            {sssPages.map((page: SssPage, index: number) =>
                <SssPageDisplay
                    page={page}
                    activePage={activePage}
                    pageIndex={index}
                    setActivePage={setActivePage}
                    getPages={getPages}
                    setOperations={setOperations}
                    reorderSssPage={reorderSssPage}
                    key={page.name}
                />
            )}
            <div className={styles.sssPage + " " + styles.addSssPage}>
                <input
                    type={"text"}
                    placeholder={"Page Name"}
                    onInput={(event: any) => {
                        event.target.value = event.target.value.replace(/'|"/g, "");
                        setNewPageName(event.target.value);
                    }}
                    onDragOver={(event: any) => {
                        event.preventDefault();
                    }}
                    onDrop={(event: any) => {
                        reorderSssPage(
                            parseInt(event.dataTransfer.getData("data")),
                            sssPages.length
                        );
                    }}
                    onKeyUp={(event: any) => {
                        if (event.key == "Enter") {
                            createNewPage();
                            event.target.value = "";
                            setNewPageName("");
                        }
                    }}
                />
                <IconButton
                    icon={"add"}
                    iconSize={"18px"}
                    tooltip={"Add Page"}
                    onClick={async () => {
                        createNewPage();
                    }}
                />
            </div>
        </div>
    );
}

function SssPageDisplay({
    page,
    activePage,
    pageIndex,
    setActivePage,
    getPages,
    setOperations,
    reorderSssPage
}: {
    page: SssPage,
    activePage: number,
    pageIndex: number,
    setActivePage: Dispatch<SetStateAction<number>>,
    getPages: (newActivePage?: number) => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>,
    reorderSssPage: (from: number, to: number) => void
}): JSX.Element {
    const [editingName, setEditingName]:
    [string | null, Dispatch<SetStateAction<string | null>>] = useState(null);
    if (editingName != null && activePage != pageIndex) {
        updatePageName();
        // Reset regardless of status
        setEditingName(null);
    }

    function updatePageName(): void {
        if (editingName == "" || editingName == null) return;
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "Rename SSS Page",
                body: "Renaming SSS page: '" + page.name + "' to '" + editingName + "'.",
                state: OpState.QUEUED,
                icon: "edit",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    const editedPage: SssPage = await api.renameSssPage(pageIndex, editingName);
                    setOperations(finishOp(
                        operationId,
                        "Renamed SSS page: '" + page.name + "' to '" + editingName + "'."
                    ));
                    getPages(editedPage.pageNumber);
                }
            }) - 1;
            return newOperations;
        });
        setEditingName(null);
    }

    const mainComponent: JSX.Element = editingName != null ? (
        <input
            type={"text"}
            className={styles.sssPageEdit}
            autoFocus={true}
            draggable={false}
            placeholder={page.name}
            onInput={(event: any) => {
                event.target.value = event.target.value.replace(/'|"/g, "");
                setEditingName(event.target.value);
            }}
            onKeyUp={(event: any) => {
                if (event.key == "Enter") updatePageName();
                else if (event.key == "Escape") setEditingName(null);
            }}
            onBlur={() => setEditingName(null)}
        />
    ) : (
        <button
            type={"button"}
            onClick={() => {
                if (activePage == pageIndex) {
                    setEditingName("");
                } else {
                    setActivePage(page.pageNumber);
                }
            }}
            className={styles.sssPageButton}
            draggable={true}
            onDragStart={(event: any) => {
                event.dataTransfer.setData("data", page.pageNumber);
            }}
            onDragOver={(event: any) => {
                event.preventDefault();
            }}
            onDrop={(event: any) => {
                const from: number = parseInt(event.dataTransfer.getData("data"));
                if (from == page.pageNumber) return;
                reorderSssPage(
                    from,
                    page.pageNumber
                );
            }}
        >
            {page.name}
        </button>
    );
    
    return (
        <div className={styles.sssPage + (activePage == pageIndex ?
            " " + styles.sssPageActive : "")}>
            {mainComponent}
            <IconButton
                icon={"delete"}
                iconSize={"18px"}
                tooltip={"Delete Page"}
                onClick={async () => {
                    if (!await api.confirmDestructiveAction()) return;
                    let operationId: number;
                    setOperations((prev: Operation[]) => {
                        const newOperations: Operation[] = [...prev];
                        operationId = newOperations.push({
                            title: "SSS Page Deletion",
                            body: "Deleting SSS page: '" + page.name + "'.",
                            state: OpState.QUEUED,
                            icon: "delete",
                            animation: Math.floor(Math.random() * 3),
                            dependencies: [OpDep.SSS],
                            call: async () => {
                                await api.removeSssPage(page);
                                setOperations(finishOp(
                                    operationId,
                                    "Deleted SSS page: '" + page.name + "'."
                                ));
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

function SssTableContents({
    sssData,
    stageList,
    stageDragAndDrop
}: {
    sssData: SssData | null,
    stageList: StageList | null,
    stageDragAndDrop: (from: DndData, to: DndData) => void
}): JSX.Element | null {
    return (sssData == null || stageList == null) ? null : (
        <>
            <tr>
                <th></th>
                {sssData[0].map((_cell: string, index: number) =>
                    <th key={index}>{index}</th>
                )}
            </tr>
            {sssData.map((row: string[], yIndex: number) =>
                <tr key={yIndex}>
                    <th key={yIndex}>{yIndex}</th>
                    {row.map((cell: string, xIndex: number) =>
                        <SssStageDisplay
                            cell={cell}
                            stageList={stageList}
                            x={xIndex}
                            y={yIndex}
                            stageDragAndDrop={stageDragAndDrop}
                            key={xIndex}
                        />
                    )}
                </tr>
            )}
        </>
    );
}

function SssStageDisplay({
    cell,
    stageList,
    x, y,
    stageDragAndDrop
}: {
    cell: string,
    stageList: StageList,
    x: number, y: number,
    stageDragAndDrop: (from: DndData, to: DndData) => void
}): JSX.Element {
    const dndData: DndData = {
        type: DndDataType.SS_NUMBER,
        number: cell,
        x: x,
        y: y
    };
    const stage: Stage | undefined = stageList.getByNum(parseInt(cell));
    if (stage == undefined) {
        return (
            <td
                className={styles.sssStageDisplay}
                onDragOver={(event: any) => {
                    event.preventDefault();
                }}
                onDrop={(event: any) => {
                    stageDragAndDrop(
                        JSON.parse(event.dataTransfer.getData("data")),
                        dndData
                    );
                }}
            >
            </td>
        );
    }
    return (
        <td className={styles.sssStageDisplay}>
            <div className={styles.tooltipWrapper}>
                <div
                    draggable={true}
                    onDragStart={(event: any) => {
                        event.dataTransfer.setData("data", JSON.stringify(dndData));
                    }}
                    onDragOver={(event: any) => {
                        event.preventDefault();
                    }}
                    onDrop={(event: any) => {
                        stageDragAndDrop(
                            JSON.parse(event.dataTransfer.getData("data")),
                            dndData
                        );
                    }}
                    onMouseEnter={(event: any) => {
                        if (event.target.tagName == "DIV") {
                            event.target
                                .nextElementSibling
                                .hidden = false;
                        } else {
                            event.target
                                .parentElement
                                .nextElementSibling
                                .firstElementChild
                                .hidden = false;
                        }
                    }}
                >
                    <img
                        src={"img://" + stage.icon}
                        draggable={false}
                        onError={(event: any) => {
                            event.target.src = MISSING;
                        }}
                    />
                    <span>{stage.menuName}</span>
                </div>
                <div
                    className={styles.tooltip + " " + styles.sssTooltip}
                    hidden={true}
                    onDragEnter={(event: any) => {
                        event.target.hidden = true;
                    }}
                >
                    <span>{stage.menuName}</span>
                </div>
            </div>
        </td>
    );
}