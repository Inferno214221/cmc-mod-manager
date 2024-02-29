import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./stages.css";
import IconButton from "../global/icon-button/icon-button";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import CycleIconButton from "../global/icon-button/cycle-icon-button";
import {
    AppData, OpDep, OpState, Operation, SortTypeOptions, Stage, sortTypes
} from "../../interfaces";
import missing from "../../assets/missing.png";

export function TabStages({
    setOperations
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [filterInstallation, setFilterInstallation]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(null);
    
    const [updateStages, setUpdateStages]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(null);

    const [stages, setStages]:
    [Stage[], Dispatch<SetStateAction<Stage[]>>]
    = useState([]);

    const [preSorted, setPreSorted]:
    [Stage[][], Dispatch<SetStateAction<Stage[][]>>]
    = useState([[], [], []]);

    const [sortedStages, setSortedStages]:
    [Stage[], Dispatch<SetStateAction<Stage[]>>]
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

    api.onInstallCharacter(() => null);
    api.onInstallStage(readStages);

    useEffect(() => {
        readStages();
        readDefaultConfig();
    }, []);

    async function readStages(): Promise<void> {
        setStages(await api.readStages());
    }

    async function readDefaultConfig(): Promise<void> {
        const data: AppData = await api.readAppData();
        setFilterInstallation(data.config.filterStageInstallation);
        setUpdateStages(data.config.updateStages);
    }

    useEffect(() => {
        setPreSorted(() => {
            const retVal: Stage[][] = [];
            sortTypes.forEach((sortType: SortTypeOptions, index: number) => {
                retVal[index] = stages.toSorted((a: Stage, b: Stage) =>
                    (a[sortType] > b[sortType] ? 1 : -1)
                );
            });
            return retVal;
        });
    }, [stages]);

    useEffect(() => {
        setSortedStages(sortStages(preSorted[sortType]));
    }, [preSorted, sortType, reverseSort, searchValue]);

    function sortStages(stages: Stage[]): Stage[] {
        let sortedStages: Stage[] = stages;
        if (searchValue != "") {
            sortedStages = sortedStages.filter((stage: Stage) =>
                (stage.menuName.toLowerCase().includes(searchValue))
            );
        }
        if (reverseSort) {
            return sortedStages.toReversed();
        }
        return sortedStages;
    }

    useEffect(() => {
        writeFilterInstallation();
    }, [filterInstallation]);

    async function writeFilterInstallation(): Promise<void> {
        const appData: AppData = await api.readAppData();
        if (
            filterInstallation != null &&
            appData.config.filterStageInstallation != filterInstallation
        ) {
            appData.config.filterStageInstallation = filterInstallation;
            await api.writeAppData(appData);
        }
    }

    useEffect(() => {
        writeUpdateStages();
    }, [updateStages]);

    async function writeUpdateStages(): Promise<void> {
        const appData: AppData = await api.readAppData();
        if (
            updateStages != null &&
            appData.config.updateStages != updateStages
        ) {
            appData.config.updateStages = updateStages;
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
                            id={"stage-search"}
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
            <div id={"stage-div"}>
                <div className={"center"}>
                    <table>
                        <tbody>
                            {sortType == sortTypes.indexOf(SortTypeOptions.series) ?
                                sortedStages.map((
                                    stage: Stage,
                                    index: number
                                ) => {
                                    const stageDisplay: JSX.Element = (
                                        <StageDisplay
                                            stage={stage}
                                            readStages={readStages}
                                            setOperations={setOperations}
                                            key={stage.name}
                                        />
                                    );
                                    if (
                                        index == 0 ||
                                        stage.series != sortedStages[index - 1].series
                                    ) {
                                        return (
                                            <>
                                                <SeriesDisplay
                                                    series={stage.series}
                                                    readStages={readStages}
                                                    setOperations={setOperations}
                                                />
                                                {stageDisplay}
                                            </>
                                        );
                                    }
                                    return stageDisplay;
                                }) :
                                sortedStages.map((
                                    stage: Stage
                                ) => 
                                    <StageDisplay
                                        stage={stage}
                                        readStages={readStages}
                                        setOperations={setOperations}
                                        key={stage.name}
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
                        icon={"create_new_folder"}
                        iconSize={"50px"}
                        tooltip={"Install Stage From Directory"}
                        onClick={async () => {
                            let operationId: number;
                            setOperations((prev: Operation[]) => {
                                const newOperations: Operation[] = [...prev];
                                operationId = newOperations.push({
                                    title: "Stage Installation",
                                    body: "Installing a stage from a directory.",
                                    state: OpState.queued,
                                    icon: "create_new_folder",
                                    animation: Math.floor(Math.random() * 3),
                                    dependencies: [OpDep.stages],
                                    call: async () => {
                                        const stage: Stage = await api.installStageDir(
                                            filterInstallation,
                                            updateStages
                                        );
                                        setOperations((prev: Operation[]) => {
                                            const newOperations: Operation[] = [...prev];
                                            if (stage == null) {
                                                newOperations[operationId].state = OpState.canceled;
                                            } else {
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Installed " +
                                                    "stage: '" + stage.name + "' from a directory.";
                                                newOperations[operationId].image = stage.icon;
                                            }
                                            return newOperations;
                                        });
                                        readStages();
                                    }
                                }) - 1;
                                return newOperations;
                            });
                        }}
                    />
                    <IconButton
                        icon={"note_add"}
                        iconSize={"50px"}
                        tooltip={"Install Stage From Archive"}
                        onClick={async () => {
                            let operationId: number;
                            setOperations((prev: Operation[]) => {
                                const newOperations: Operation[] = [...prev];
                                operationId = newOperations.push({
                                    title: "Stage Installation",
                                    body: "Installing a stage from an archive.",
                                    state: OpState.queued,
                                    icon: "note_add",
                                    animation: Math.floor(Math.random() * 3),
                                    dependencies: [OpDep.stages],
                                    call: async () => {
                                        const stage: Stage = await api.installStageArchive(
                                            filterInstallation,
                                            updateStages
                                        );
                                        setOperations((prev: Operation[]) => {
                                            const newOperations: Operation[] = [...prev];
                                            if (stage == null) {
                                                newOperations[operationId].state = OpState.canceled;
                                            } else {
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Installed " +
                                                    "stage: '" + stage.name + "' from an archive.";
                                                newOperations[operationId].image = stage.icon;
                                            }
                                            return newOperations;
                                        });
                                        readStages();
                                    }
                                }) - 1;
                                return newOperations;
                            });
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
                        checked={updateStages}
                        trueIcon={"sync"}
                        trueTooltip={"Existing Stages: Update"}
                        falseIcon={"sync_disabled"}
                        falseTooltip={"Existing Stages: Abort"}
                        iconSize={"50px"}
                        setter={setUpdateStages}
                    />
                </div>
            </div>
        </section>
    );
}

function StageDisplay({
    stage,
    readStages,
    setOperations
}: {
    stage: Stage,
    readStages: () => Promise<void>
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    const [randomSelection, setRandomSelection]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(stage.randomSelection);

    useEffect(() => {
        if (randomSelection == stage.randomSelection) return;
        let operationId: number;
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId = newOperations.push({
                title: "Stage Selection",
                body: "Toggling the ability for stage: '" + stage.name + "' to be " +
                    "selected at random.",
                image: "img://" + stage.icon,
                state: OpState.queued,
                icon: randomSelection ? "help" : "help_outline",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.stageLock],
                call: async () => {
                    api.writeStageRandom(stage.name, randomSelection);
                    stage.randomSelection = randomSelection;
                    setOperations((prev: Operation[]) => {
                        const newOperations: Operation[] = [...prev];
                        newOperations[operationId].state = OpState.finished;
                        newOperations[operationId].body = "Toggled the ability for stage: '" +
                            stage.name + "' to be selected at random."
                        return newOperations;
                    });
                }
            }) - 1;
            return newOperations;
        });
    }, [randomSelection]);

    return (
        <tr className={"stage-display-row"}>
            <td>
                <div className={"stage-display-wrapper"}>
                    <div className={"stage-display-mug"}>
                        <img
                            src={"img://" + stage.icon}
                            draggable={false}
                            onError={(event: any) => {
                                event.target.src = missing;
                            }}
                        />
                    </div>
                    <div className={"stage-display-name"}>
                        <span>{stage.menuName}</span>
                    </div>
                    <div className={"stage-display-actions"}>
                        <IconButton
                            icon={"delete"}
                            iconSize={"30px"}
                            tooltip={"Delete Stage"}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: "Stage Deletion",
                                        body: "Deleting stage: '" + stage.name + "'.",
                                        image: "img://" + stage.icon,
                                        state: OpState.queued,
                                        icon: "delete",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [OpDep.stages, OpDep.stageLock, OpDep.sss],
                                        call: async () => {
                                            await api.removeStage(stage.name);
                                            setOperations((prev: Operation[]) => {
                                                const newOperations: Operation[] = [...prev];
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Deleted " +
                                                    "stage: '" + stage.name + "'.";
                                                return newOperations;
                                            });
                                            readStages();
                                        }
                                    }) - 1;
                                    return newOperations;
                                });
                            }}
                        />
                        <IconButton
                            icon={"drive_file_move"}
                            iconSize={"30px"}
                            tooltip={"Extract Stage"}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: "Stage Extraction",
                                        body: "Extracting stage: '" + stage.name + "'.",
                                        image: "img://" + stage.icon,
                                        state: OpState.queued,
                                        icon: "drive_file_move",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [OpDep.stages],
                                        call: async () => {
                                            await api.extractStage(stage.name);
                                            setOperations((prev: Operation[]) => {
                                                const newOperations: Operation[] = [...prev];
                                                newOperations[operationId].state = OpState.finished;
                                                newOperations[operationId].body = "Extracted " +
                                                    "stage: '" + stage.name + "'.";
                                                return newOperations;
                                            });
                                        }
                                    }) - 1;
                                    return newOperations;
                                });
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
                        />
                    </div>
                </div>
            </td>
        </tr>
    );
}

function SeriesDisplay({
    series,
    readStages,
    setOperations
}: {
    series: string,
    readStages: () => Promise<void>,
    setOperations: Dispatch<SetStateAction<Operation[]>>
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
                    tooltip={"Delete All Stages In Series"}
                    onClick={async () => {
                        let operationId: number;
                        setOperations((prev: Operation[]) => {
                            const newOperations: Operation[] = [...prev];
                            operationId = newOperations.push({
                                title: "Series Deletion",
                                body: "Deleting all stages in series: '" + series + "'.",
                                state: OpState.queued,
                                icon: "delete_sweep",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [OpDep.stages, OpDep.stageLock, OpDep.sss],
                                call: async () => {
                                    await api.removeSeriesStages(series);
                                    setOperations((prev: Operation[]) => {
                                        const newOperations: Operation[] = [...prev];
                                        newOperations[operationId].state = OpState.finished;
                                        newOperations[operationId].body = "Deleted all stages " +
                                            "in series: '" + series + "'.";
                                        return newOperations;
                                    });
                                    readStages();
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
                                    newOperations[operationId].image = path;
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