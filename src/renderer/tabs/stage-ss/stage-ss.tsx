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

import { translations } from "../../../global/translations";
const { message }: ReturnType<typeof translations> = translations(global.language);

const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.NUMBER,
    SortTypeOptions.SERIES,
    SortTypeOptions.MENU_NAME
];

enum DndMode {
    AUTO = "auto",
    INSERT = "insert",
    SWAP = "swap",
}

export function TabStageSelectionScreen({
    setOperations,
    handle
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>,
    handle: <T>(promise: Promise<T>) => Promise<T>
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

    const [dragOverPosition, setDragOverPosition]:
    [{ x: number; y: number } | null, Dispatch<SetStateAction<{ x: number; y: number } | null>>]
    = useState(null);

    const [isDraggingFromPool, setIsDraggingFromPool]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);

    const [dndMode, setDndMode]:
    [DndMode, Dispatch<SetStateAction<DndMode>>]
    = useState(DndMode.AUTO);

    const [selectedPositions, setSelectedPositions]:
    [Set<string>, Dispatch<SetStateAction<Set<string>>>]
    = useState(new Set());

    const [lastSelectedPosition, setLastSelectedPosition]:
    [{ x: number; y: number } | null, Dispatch<SetStateAction<{ x: number; y: number } | null>>]
    = useState(null);

    const [selectedExcluded, setSelectedExcluded]:
    [Set<string>, Dispatch<SetStateAction<Set<string>>>]
    = useState(new Set());

    api.on("updateCharacterPages", () => null);
    api.on("updateStagePages", getInfo);

    async function getInfo(): Promise<void> {
        const stages: Stage[] = await handle(api.readStages());
        stages.push({
            name: "random",
            menuName: "Random",
            source: "???",
            series: "random",
            randomSelection: false,
            number: 9999,
            icon: await handle(api.pathJoin(
                await handle(api.getGameDir()), "gfx", "stgicons", "random.png"
            ))
        });
        setStages(stages);
        getPages();
    }

    async function getPages(newActivePage?: number): Promise<void> {
        const pages: SssPage[] = await handle(api.readSssPages());
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
        // Clear drag over indicator
        setDragOverPosition(null);
        setIsDraggingFromPool(false);
        // Can't be called unless sssData has a value
        const newSssData: SssData = sssData!.map((row) => [...row]);

        const useInsert =
            dndMode == DndMode.INSERT ||
            (dndMode == DndMode.AUTO && from.type == DndDataType.SS_NUMBER);

        if (from.type == DndDataType.SS_NUMBER) {
            if (to.type == DndDataType.SS_NUMBER) {
                const fromData = from as DndDataSsNumber;
                const toData = to as DndDataSsNumber;

                const fromKey = `${fromData.x},${fromData.y}`;
                const isMultiSelect =
                    selectedPositions.has(fromKey) && selectedPositions.size > 1;

                if (useInsert) {
                    if (isMultiSelect) {
                        // Multi-select insert
                        const flat: string[] = newSssData.flat();
                        const rowLength = newSssData[0].length;

                        const selectedItems: Array<{ index: number; stage: string }> = [];
                        selectedPositions.forEach((posKey) => {
                            const [x, y] = posKey.split(",").map(Number);
                            const index = y * rowLength + x;
                            selectedItems.push({ index, stage: flat[index] });
                        });

                        selectedItems.sort((a, b) => a.index - b.index);
                        const stages = selectedItems.map((item) => item.stage);

                        for (let i = selectedItems.length - 1; i >= 0; i--) {
                            flat.splice(selectedItems[i].index, 1);
                        }

                        const toIndex = toData.y * rowLength + toData.x;
                        const removedBefore = selectedItems.filter(
                            (item) => item.index < toIndex
                        ).length;
                        const adjustedToIndex = toIndex - removedBefore;

                        flat.splice(adjustedToIndex, 0, ...stages);

                        for (let i = 0; i < newSssData.length; i++) {
                            for (let j = 0; j < rowLength; j++) {
                                newSssData[i][j] = flat[i * rowLength + j];
                            }
                        }
                    } else {
                        // Single item insert
                        const flat: string[] = newSssData.flat();
                        const rowLength = newSssData[0].length;
                        const fromIndex = fromData.y * rowLength + fromData.x;
                        const toIndex = toData.y * rowLength + toData.x;

                        if (fromIndex === toIndex) return;

                        const stage = flat[fromIndex];
                        flat.splice(fromIndex, 1);
                        const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
                        flat.splice(adjustedToIndex, 0, stage);

                        for (let i = 0; i < newSssData.length; i++) {
                            for (let j = 0; j < rowLength; j++) {
                                newSssData[i][j] = flat[i * rowLength + j];
                            }
                        }
                    }
                } else {
                    // Swap mode for roster→roster
                    if (isMultiSelect) {
                        const flat: string[] = newSssData.flat();
                        const rowLength = newSssData[0].length;

                        const selectedItems: Array<{ index: number; stage: string }> = [];
                        selectedPositions.forEach((posKey) => {
                            const [x, y] = posKey.split(",").map(Number);
                            const index = y * rowLength + x;
                            selectedItems.push({ index, stage: flat[index] });
                        });

                        selectedItems.sort((a, b) => a.index - b.index);

                        const toIndex = toData.y * rowLength + toData.x;

                        for (let i = 0; i < selectedItems.length; i++) {
                            const targetIndex = toIndex + i;
                            if (targetIndex < flat.length) {
                                const fromIdx = selectedItems[i].index;
                                const temp = flat[fromIdx];
                                flat[fromIdx] = flat[targetIndex];
                                flat[targetIndex] = temp;
                            }
                        }

                        for (let i = 0; i < newSssData.length; i++) {
                            for (let j = 0; j < rowLength; j++) {
                                newSssData[i][j] = flat[i * rowLength + j];
                            }
                        }
                    } else {
                        newSssData[fromData.y][fromData.x] = to.number;
                        newSssData[toData.y][toData.x] = from.number;
                    }
                }

                setSelectedPositions(new Set());
            } else {
                const fromData = from as DndDataSsNumber;
                const fromKey = `${fromData.x},${fromData.y}`;
                const isMultiSelect =
                    selectedPositions.has(fromKey) && selectedPositions.size > 1;

                if (isMultiSelect) {
                    selectedPositions.forEach((posKey) => {
                        const [x, y] = posKey.split(",").map(Number);
                        newSssData[y][x] = "0000";
                    });
                } else {
                    newSssData[fromData.y][fromData.x] = "0000";
                }
                setSelectedPositions(new Set());
            }
        } else {
            if (to.type == DndDataType.SS_NUMBER) {
                const isMultiSelectPool =
                    selectedExcluded.has(from.number) && selectedExcluded.size > 1;

                if (useInsert) {
                    // Insert mode for pool→roster
                    if (isMultiSelectPool) {
                        const toData = to as DndDataSsNumber;
                        const flat: string[] = newSssData.flat();
                        const rowLength = newSssData[0].length;
                        const toIndex = toData.y * rowLength + toData.x;
                        const selectedNumbers = [...selectedExcluded];

                        flat.splice(toIndex, 0, ...selectedNumbers);
                        flat.splice(flat.length - selectedNumbers.length);

                        for (let i = 0; i < newSssData.length; i++) {
                            for (let j = 0; j < rowLength; j++) {
                                newSssData[i][j] = flat[i * rowLength + j];
                            }
                        }
                    } else {
                        const flat: string[] = newSssData.flat();
                        const rowLength = newSssData[0].length;
                        const toIndex =
                            (to as DndDataSsNumber).y * rowLength + (to as DndDataSsNumber).x;

                        flat.splice(toIndex, 0, from.number);
                        flat.pop();

                        for (let i = 0; i < newSssData.length; i++) {
                            for (let j = 0; j < rowLength; j++) {
                                newSssData[i][j] = flat[i * rowLength + j];
                            }
                        }
                    }
                } else {
                    // Swap mode for pool→roster
                    if (isMultiSelectPool) {
                        const toData = to as DndDataSsNumber;
                        const flat: string[] = newSssData.flat();
                        const rowLength = newSssData[0].length;
                        let toIndex = toData.y * rowLength + toData.x;
                        const selectedNumbers = [...selectedExcluded];

                        for (const num of selectedNumbers) {
                            if (toIndex < flat.length) {
                                flat[toIndex] = num;
                                toIndex++;
                            }
                        }

                        for (let i = 0; i < newSssData.length; i++) {
                            for (let j = 0; j < rowLength; j++) {
                                newSssData[i][j] = flat[i * rowLength + j];
                            }
                        }
                    } else {
                        newSssData[(to as DndDataSsNumber).y][(to as DndDataSsNumber).x] = from.number;
                    }
                }
                setSelectedExcluded(new Set());
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
                title: message("operation.sss.writeData.started.title"),
                body: message("operation.sss.writeData.started.body", sssPages[activePage].name),
                state: OpState.QUEUED,
                icon: "location_pin",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    await api.writeSssPages(sssPages);
                    setOperations(finishOp(
                        operationId,
                        message("operation.sss.writeData.finished.body", sssPages[activePage].name)
                    ));
                }
            }) - 1;
            return newOperations;
        });
    }, [sssData]);

    function handleCellClick(
        x: number,
        y: number,
        event: React.MouseEvent
    ): void {
        const posKey = `${x},${y}`;

        if (event.ctrlKey || event.metaKey) {
            // Ctrl+click: toggle selection
            setSelectedPositions((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(posKey)) {
                    newSet.delete(posKey);
                } else {
                    newSet.add(posKey);
                }
                return newSet;
            });
            setLastSelectedPosition({ x, y });
        } else if (event.shiftKey && lastSelectedPosition) {
            // Shift+click: select range
            const rowLength = sssData![0].length;
            const lastIndex =
                lastSelectedPosition.y * rowLength + lastSelectedPosition.x;
            const currentIndex = y * rowLength + x;
            const [start, end] =
                lastIndex < currentIndex
                    ? [lastIndex, currentIndex]
                    : [currentIndex, lastIndex];

            setSelectedPositions((prev) => {
                const newSet = new Set(prev);
                for (let i = start; i <= end; i++) {
                    const row = Math.floor(i / rowLength);
                    const col = i % rowLength;
                    newSet.add(`${col},${row}`);
                }
                return newSet;
            });
        } else {
            // Regular click: clear selection and select only this
            setSelectedPositions(new Set([posKey]));
            setLastSelectedPosition({ x, y });
        }
    }

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
                                    selectedPositions={selectedPositions}
                                    handleCellClick={handleCellClick}
                                    dragOverPosition={dragOverPosition}
                                    setDragOverPosition={setDragOverPosition}
                                    isDraggingFromPool={isDraggingFromPool}
                                    dndMode={dndMode}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div id={styles.sssDivControls}>
                <div className={styles.center}>
                    <div className={styles.inlineSortOptions}>
                        <label>{"Drag Mode "}</label>
                        <select
                            value={dndMode}
                            onInput={(event: any) => setDndMode(event.target.value)}
                        >
                            <option value={DndMode.AUTO}>
                                {"Auto"}
                            </option>
                            <option value={DndMode.INSERT}>
                                {"Insert"}
                            </option>
                            <option value={DndMode.SWAP}>
                                {"Swap"}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <hr/>
            <ExcludedStages
                stages={stages}
                excluded={excluded}
                stageDragAndDrop={stageDragAndDrop}
                setIsDraggingFromPool={setIsDraggingFromPool}
                selectedExcluded={selectedExcluded}
                setSelectedExcluded={setSelectedExcluded}
            />
        </section>
    );
}

function ExcludedStages({
    stages,
    excluded,
    stageDragAndDrop,
    setIsDraggingFromPool,
    selectedExcluded,
    setSelectedExcluded
}: {
    stages: Stage[],
    excluded: Stage[],
    stageDragAndDrop: (from: DndData, to: DndData) => void,
    setIsDraggingFromPool: Dispatch<SetStateAction<boolean>>,
    selectedExcluded: Set<string>,
    setSelectedExcluded: Dispatch<SetStateAction<Set<string>>>
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
                            placeholder={message("ui.searchPlaceholder")}
                            id={styles.excludedSearch}
                            onInput={(event: any) => {
                                setSearchValue(event.target.value);
                                console.log(searchValue, sortType, reverseSort);
                            }}
                            title={message("tooltip.stage.search")}
                        />
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
                            trueIcon={"west"}
                            trueTooltip={message("tooltip.sortDirection.backwards")}
                            falseIcon={"east"}
                            falseTooltip={message("tooltip.sortDirection.forwards")}
                            iconSize={"30px"}
                            setter={setReverseSort}
                        />
                        <ToggleIconButton
                            checked={showAllStages}
                            trueIcon={"groups"}
                            trueTooltip={message("tooltip.stage.showing.all")}
                            falseIcon={"person_outline"}
                            falseTooltip={message("tooltip.stage.showing.excluded")}
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
                                        setIsDraggingFromPool={setIsDraggingFromPool}
                                        isSelected={selectedExcluded.has(("0000" + stage.number).slice(-4))}
                                        setSelectedExcluded={setSelectedExcluded}
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
                                    setIsDraggingFromPool={setIsDraggingFromPool}
                                    isSelected={selectedExcluded.has(("0000" + stage.number).slice(-4))}
                                    setSelectedExcluded={setSelectedExcluded}
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
    stageDragAndDrop,
    setIsDraggingFromPool,
    isSelected,
    setSelectedExcluded
}: {
    stage: Stage,
    stageDragAndDrop: (from: DndData, to: DndData) => void,
    setIsDraggingFromPool: Dispatch<SetStateAction<boolean>>,
    isSelected: boolean,
    setSelectedExcluded: Dispatch<SetStateAction<Set<string>>>
}): JSX.Element {
    const dndData: DndData = {
        type: DndDataType.EXCLUDED,
        number: ("0000" + stage.number).slice(-4)
    }
    return (
        <div className={styles.excludedDisplayWrapper + " " + styles.tooltipWrapper}
            style={{ position: "relative" }}
        >
            {isSelected && (
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(100, 150, 255, 0.3)",
                    pointerEvents: "none", zIndex: 1,
                }} />
            )}
            <div
                className={styles.excludedDisplayMug}
                draggable={true}
                onClick={(event: React.MouseEvent) => {
                    if (event.ctrlKey || event.metaKey) {
                        setSelectedExcluded((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(dndData.number)) {
                                newSet.delete(dndData.number);
                            } else {
                                newSet.add(dndData.number);
                            }
                            return newSet;
                        });
                    } else {
                        setSelectedExcluded(new Set([dndData.number]));
                    }
                }}
                onDragStart={(event: any) => {
                    event.dataTransfer.setData("data", JSON.stringify(dndData));
                    setIsDraggingFromPool(true);
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
                title={stage.menuName}
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
                title: message("operation.sss.reorderPages.started.title"),
                body: message(
                    "operation.sss.reorderPages.started.body",
                    sssPages[from].name,
                    (to > from ? to - 1 : to)
                ),
                state: OpState.QUEUED,
                icon: "swap_horiz",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    await api.reorderSssPage(from, to);
                    setOperations(finishOp(
                        operationId,
                        message(
                            "operation.sss.reorderPages.finished.body",
                            sssPages[from].name,
                            (to > from ? to - 1 : to)
                        )
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
                title: message("operation.sss.pageAddition.started.title"),
                body: message("operation.sss.pageAddition.started.body", newPageName),
                state: OpState.QUEUED,
                icon: "add",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    const newPage: SssPage = await api.addSssPage(newPageName);
                    setOperations(finishOp(
                        operationId,
                        message("operation.sss.pageAddition.finished.body", newPageName)
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
                    placeholder={message("ui.pagePlaceholder")}
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
                    tooltip={message("tooltip.ss.addPage")}
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
                title: message("operation.sss.renamePage.started.title"),
                body: message("operation.sss.renamePage.started.body", page.name, editingName),
                state: OpState.QUEUED,
                icon: "edit",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.SSS],
                call: async () => {
                    const editedPage: SssPage = await api.renameSssPage(pageIndex, editingName);
                    setOperations(finishOp(
                        operationId,
                        message("operation.sss.renamePage.finished.body", page.name, editingName)
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
                tooltip={message("tooltip.ss.deletePage")}
                onClick={async () => {
                    if (!await api.confirmDestructiveAction()) return;
                    let operationId: number;
                    setOperations((prev: Operation[]) => {
                        const newOperations: Operation[] = [...prev];
                        operationId = newOperations.push({
                            title: message("operation.sss.pageDeletion.started.title"),
                            body: message("operation.sss.pageDeletion.started.body", page.name),
                            state: OpState.QUEUED,
                            icon: "delete",
                            animation: Math.floor(Math.random() * 3),
                            dependencies: [OpDep.SSS],
                            call: async () => {
                                await api.removeSssPage(page);
                                setOperations(finishOp(
                                    operationId,
                                    message("operation.sss.pageDeletion.finished.body", page.name)
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
    stageDragAndDrop,
    selectedPositions,
    handleCellClick,
    dragOverPosition,
    setDragOverPosition,
    isDraggingFromPool,
    dndMode
}: {
    sssData: SssData | null,
    stageList: StageList | null,
    stageDragAndDrop: (from: DndData, to: DndData) => void,
    selectedPositions: Set<string>,
    handleCellClick: (x: number, y: number, event: React.MouseEvent) => void,
    dragOverPosition: { x: number; y: number } | null,
    setDragOverPosition: Dispatch<SetStateAction<{ x: number; y: number } | null>>,
    isDraggingFromPool: boolean,
    dndMode: DndMode
}): JSX.Element | null {
    const showInsertIndicator =
        dndMode == DndMode.INSERT ||
        (dndMode == DndMode.AUTO && !isDraggingFromPool);
    const showSwapIndicator =
        dndMode == DndMode.SWAP ||
        (dndMode == DndMode.AUTO && isDraggingFromPool);
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
                            isSelected={selectedPositions.has(`${xIndex},${yIndex}`)}
                            handleCellClick={handleCellClick}
                            isDragOver={
                                showInsertIndicator &&
                                dragOverPosition?.x === xIndex && dragOverPosition?.y === yIndex
                            }
                            isSwapDragOver={
                                showSwapIndicator &&
                                dragOverPosition?.x === xIndex && dragOverPosition?.y === yIndex
                            }
                            setDragOverPosition={setDragOverPosition}
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
    stageDragAndDrop,
    isSelected,
    handleCellClick,
    isDragOver,
    isSwapDragOver,
    setDragOverPosition
}: {
    cell: string,
    stageList: StageList,
    x: number, y: number,
    stageDragAndDrop: (from: DndData, to: DndData) => void,
    isSelected: boolean,
    handleCellClick: (x: number, y: number, event: React.MouseEvent) => void,
    isDragOver: boolean,
    isSwapDragOver: boolean,
    setDragOverPosition: Dispatch<SetStateAction<{ x: number; y: number } | null>>
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
                    setDragOverPosition({ x, y });
                }}
                onDragLeave={() => {
                    setDragOverPosition(null);
                }}
                onDrop={(event: any) => {
                    stageDragAndDrop(
                        JSON.parse(event.dataTransfer.getData("data")),
                        dndData
                    );
                }}
                style={{ position: "relative" }}
            >
                {isDragOver && (
                    <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: "4px", backgroundColor: "var(--inf-blue1)", zIndex: 10,
                    }} />
                )}
                {isSwapDragOver && (
                    <div style={{
                        position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
                        border: "3px solid var(--inf-blue1)", pointerEvents: "none", zIndex: 10,
                    }} />
                )}
            </td>
        );
    }
    return (
        <td
            className={styles.sssStageDisplay}
            onClick={(event: React.MouseEvent) => handleCellClick(x, y, event)}
            style={{ position: "relative" }}
        >
            {isSelected && (
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(100, 150, 255, 0.3)",
                    pointerEvents: "none", zIndex: 1,
                }} />
            )}
            {isDragOver && (
                <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: "4px", backgroundColor: "var(--inf-blue1)", zIndex: 10,
                }} />
            )}
            {isSwapDragOver && (
                <div style={{
                    position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
                    border: "3px solid var(--inf-blue1)", pointerEvents: "none", zIndex: 10,
                }} />
            )}
            <div className={styles.tooltipWrapper}>
                <div
                    draggable={true}
                    onDragStart={(event: any) => {
                        event.dataTransfer.setData("data", JSON.stringify(dndData));
                    }}
                    onDragOver={(event: any) => {
                        event.preventDefault();
                        setDragOverPosition({ x, y });
                    }}
                    onDragLeave={() => {
                        setDragOverPosition(null);
                    }}
                    onDrop={(event: any) => {
                        stageDragAndDrop(
                            JSON.parse(event.dataTransfer.getData("data")),
                            dndData
                        );
                    }}
                    title={stage.menuName}
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
            </div>
        </td>
    );
}