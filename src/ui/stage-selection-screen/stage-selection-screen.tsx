import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./stage-selection-screen.css";
import IconButton from "../global/icon-button/icon-button";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import CycleIconButton from "../global/icon-button/cycle-icon-button";
import {
    DndData, DndDataType, OpDep, OpState, Operation, SortTypeOptions, SssData, SssPage, Stage,
    StageList,
    sortTypes
} from "../../interfaces";
import missing from "../../assets/missing.png";

export function TabStageSelectionScreen({
    setOperations
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [stages, setStages]:
    [Stage[], Dispatch<SetStateAction<Stage[]>>]
    = useState([]);

    const [stageList, setStageList]:
    [StageList, Dispatch<SetStateAction<StageList>>]
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
    [SssData, Dispatch<SetStateAction<SssData>>]
    = useState(null);

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

    async function getPages(): Promise<void> {
        const pages: SssPage[] = await api.readSssPages();
        setSssPages(pages);
        setActivePage(0);
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
        console.log("stageDragAndDrop");
        console.log(from, to);
        const newSssData: SssData = [...sssData];
        if (from.type == DndDataType.ssNumber) {
            if (to.type == DndDataType.ssNumber) {
                newSssData[from.y][from.x] = to.number;
                newSssData[to.y][to.x] = from.number;
            } else {
                newSssData[from.y][from.x] = "0000";
            }
        } else {
            if (to.type == DndDataType.ssNumber) {
                newSssData[to.y][to.x] = from.number;
            } else {
                return;
            }
        }
        setSssData(newSssData);
    }

    useEffect(() => {
        console.log("sssPages, activePage updated");
        if (sssPages[activePage] == undefined) return;
        setSssData(sssPages[activePage].data);
    }, [sssPages, activePage]);

    useEffect(() => {
        console.log("sssData updated");
        if (sssPages[activePage] == undefined) return;
        if (sssData == sssPages[activePage].data) return;
        const updatedPages: SssPage[] = [...sssPages];
        updatedPages[activePage].data = sssData;
        setSssPages(updatedPages);
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "Write SSS Data",
                body: "Writing modified SSS data to page: '" + sssPages[activePage].name + "'.",
                state: OpState.queued,
                icon: "location_pin",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.sss],
                call: async () => {
                    await api.writeSssPages(sssPages);
                    setOperations((prev: Operation[]) => {
                        const newOperations: Operation[] = [...prev];
                        newOperations[operationId].state = OpState.finished;
                        newOperations[operationId].body = "Wrote modified SSS data to page: '" +
                            sssPages[activePage].name + "'.";
                        return newOperations;
                    });
                }
            }) - 1;
            return newOperations;
        });
    }, [sssData]);

    return (
        <section>
            <div id={"pages-div"}>
                <div className={"center"}>
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
            <div id={"sss-div"}>
                <div id={"sss-wrapper"}>
                    <div className={"center"}>
                        <table id={"sss-table"}>
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
            (a[sortTypes[sortType]] > b[sortTypes[sortType]] ? 1 : -1)
        );
        if (reverseSort) {
            sortedStages.reverse();
        }
        return sortedStages;
    }

    return (
        <>
            <div id={"sort-excluded-div"}>
                <div className={"center"}>
                    <div className={"tooltip-wrapper inline-sort-options"}>
                        <input
                            type={"text"}
                            placeholder={"Search"}
                            id={"excluded-search"}
                            onInput={(event: any) => {
                                setSearchValue(event.target.value);
                                console.log(searchValue, sortType, reverseSort);
                            }}
                        />
                        <div className={"tooltip"}>
                            <span>Search For Stages</span>
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
            <div id={"excluded-div"}>
                <div className={"center"}>
                    <div id={"excluded-wrapper"}>
                        {sortType == sortTypes.indexOf(SortTypeOptions.series) ?
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
                                            <div className={"series-name"}>
                                                <span>
                                                    <b>{stage.series.toUpperCase()}</b>
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
        type: DndDataType.excluded,
        number: ("0000" + stage.number).slice(-4)
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
                        event.target.src = missing;
                    }}
                />
                <div className={"excluded-display-name"}>
                    <span>{stage.menuName}</span>
                </div>
            </div>
            <div className={"tooltip excluded-tooltip"}>
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
    getPages: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [newPageName, setNewPageName]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("");

    return (
        <div id={"pages-wrapper"}>
            {sssPages.map((page: SssPage) =>
                <SssPageDisplay
                    page={page}
                    sssPages={sssPages}
                    activePage={activePage}
                    setActivePage={setActivePage}
                    getPages={getPages}
                    setOperations={setOperations}
                    key={page.name}
                />
            )}
            <div className={"sss-page add-sss-page"}>
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
                                    title: "SSS Page Addition",
                                    body: "Adding new SSS page: '" + newPageName + "'.",
                                    state: OpState.queued,
                                    icon: "add",
                                    animation: Math.floor(Math.random() * 3),
                                    dependencies: [OpDep.sss],
                                    call: async () => {
                                        await api.addSssPage(newPageName);
                                        setOperations((prev: Operation[]) => {
                                            const newOperations: Operation[] = [...prev];
                                            newOperations[operationId].state = OpState.finished;
                                            newOperations[operationId].body = "Added new SSS " +
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

function SssPageDisplay({
    page,
    sssPages,
    activePage,
    setActivePage,
    getPages,
    setOperations
}: {
    page: SssPage,
    sssPages: SssPage[],
    activePage: number,
    setActivePage: Dispatch<SetStateAction<number>>,
    getPages: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    console.log(sssPages[activePage].pageNumber == page.pageNumber);
    return (
        <div className={"sss-page" +
            (sssPages[activePage].pageNumber == page.pageNumber ? " sss-page-active" : "")}>
            <button
                type={"button"}
                onClick={() => {
                    setActivePage(page.pageNumber);
                }}
                className={"sss-page-button"}
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
                            title: "SSS Page Deletion",
                            body: "Deleting SSS page: '" + page.name + "'.",
                            state: OpState.queued,
                            icon: "delete",
                            animation: Math.floor(Math.random() * 3),
                            dependencies: [OpDep.sss],
                            call: async () => {
                                await api.removeSssPage(page);
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    newOperations[operationId].state = OpState.finished;
                                    newOperations[operationId].body = "Deleted SSS page: '" +
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

function SssTableContents({
    sssData,
    stageList,
    stageDragAndDrop
}: {
    sssData: SssData,
    stageList: StageList,
    stageDragAndDrop: (from: DndData, to: DndData) => void
}): JSX.Element {
    return (sssData == null || stageList == null) ? null : (
        <>
            <tr>
                <th></th>
                {sssData[0].map((cell: string, index: number) =>
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
        type: DndDataType.ssNumber,
        number: cell,
        x: x,
        y: y
    };
    const stage: Stage = stageList.getStageByNum(parseInt(cell));
    if (stage == undefined) {
        return (
            <td
                className={"sss-stage-display"}
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
        <td className={"sss-stage-display"}>
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
                        stageDragAndDrop(
                            JSON.parse(event.dataTransfer.getData("data")),
                            dndData
                        );
                    }}
                    onMouseEnter={(event: any) => {
                        // console.log(event);
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
                            event.target.src = missing;
                        }}
                    />
                    <span>{stage.menuName}</span>
                </div>
                <div
                    className={"tooltip sss-tooltip"}
                    hidden={true}
                    onDragEnter={(event: any) => {
                        // console.log(event);
                        event.target.hidden = true;
                    }}
                >
                    <span>{stage.menuName}</span>
                </div>
            </div>
        </td>
    );
}