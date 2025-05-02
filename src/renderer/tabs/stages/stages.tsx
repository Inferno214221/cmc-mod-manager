import { Dispatch, SetStateAction, useEffect, useState } from "react";
import IconButton from "../../icon-buttons/icon-button";
import ToggleIconButton from "../../icon-buttons/toggle-icon-button";
import CycleIconButton from "../../icon-buttons/cycle-icon-button";
import MISSING from "../../../assets/missing.png";
import { OpDep, OpState, SortTypeOptions, finishOp } from "../../../global/global";
import appStyles from "../../app/app.css";
import stagesStyles from "./stages.css";
import { message } from "../../../global/translations";
const styles: typeof import("../../app/app.css") & typeof import("./stages.css") =
    Object.assign({}, appStyles, stagesStyles);

const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.NUMBER,
    SortTypeOptions.SERIES,
    SortTypeOptions.MENU_NAME
];

export function TabStages({
    setOperations,
    handle
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>,
    handle: <T>(promise: Promise<T>) => Promise<T>
}): JSX.Element {
    const [filterInstallation, setFilterInstallation]:
    [boolean | null, Dispatch<SetStateAction<boolean | null>>]
    = useState(null);
    
    const [updateStages, setUpdateStages]:
    [boolean | null, Dispatch<SetStateAction<boolean | null>>]
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

    api.on("updateCharacterPages", () => null);
    api.on("updateStagePages", readStages);

    useEffect(() => {
        readStages();
        readDefaultConfig();
    }, []);

    async function readStages(): Promise<void> {
        setStages(await handle(api.readStages()));
    }

    async function readDefaultConfig(): Promise<void> {
        const data: AppData = await handle(api.readAppData());
        setFilterInstallation(data.config.filterStageInstallation);
        setUpdateStages(data.config.updateStages);
    }

    useEffect(() => {
        setPreSorted(() => {
            const retVal: Stage[][] = [];
            sortTypes.forEach((sortType: SortTypeOptions, index: number) => {
                retVal[index] = stages.toSorted((a: Stage, b: Stage) =>
                    ((a[sortType] ?? "zzzzz") > (b[sortType] ?? "zzzzz") ? 1 : -1)
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
            <div id={styles.sortDiv}>
                <div className={styles.center}>
                    <div className={styles.tooltipWrapper + " " + styles.inlineSortOptions}>
                        <input
                            type={"text"}
                            placeholder={message("ui.searchPlaceholder")}
                            id={styles.stageSearch}
                            onInput={(event: any) => {
                                setSearchValue(event.target.value);
                                console.log(searchValue, sortType, reverseSort);
                            }}
                        />
                        <div className={styles.tooltip}>
                            <span>{message("tooltip.stage.search")}</span>
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
                                message("tooltip.sortBy.number"),
                                message("tooltip.sortBy.series"),
                                message("tooltip.sortBy.alphabetical")
                            ]}
                            iconSize={"30px"}
                            setter={setSortType}
                        />
                        <ToggleIconButton
                            checked={reverseSort}
                            trueIcon={"north"}
                            trueTooltip={message("tooltip.sortDirection.backwards")}
                            falseIcon={"south"}
                            falseTooltip={message("tooltip.sortDirection.forwards")}
                            iconSize={"30px"}
                            setter={setReverseSort}
                        />
                    </div>
                </div>
            </div>
            <div id={styles.stageDiv}>
                <div className={styles.center}>
                    <table>
                        <tbody>
                            {sortTypes[sortType] == SortTypeOptions.SERIES ?
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
                                                    series={stage.series ?? "undefined"}
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
            <div id={styles.buttonDiv}>
                <div className={styles.center}>
                    <IconButton
                        icon={"create_new_folder"}
                        iconSize={"50px"}
                        tooltip={message("tooltip.stage.installDir")}
                        onClick={async () => {
                            api.selectAndInstallStages(
                                filterInstallation,
                                updateStages,
                                false,
                            );
                        }}
                    />
                    <IconButton
                        icon={"note_add"}
                        iconSize={"50px"}
                        tooltip={message("tooltip.stage.installArch")}
                        onClick={async () => {
                            api.selectAndInstallStages(
                                filterInstallation,
                                updateStages,
                                true,
                            );
                        }}
                    />
                    <IconButton
                        icon={"source"}
                        iconSize={"50px"}
                        tooltip={message("tooltip.openExtractionDir")}
                        onClick={async () => {
                            api.openDir(await api.getExtractedDir());
                        }}
                    />
                    {/* <hr className={styles.vr}/>
                    <IconButton
                        icon={"delete_sweep"}
                        iconSize={"50px"}
                        tooltip={"Remove All Stages"}
                        onClick={() => {console.log("a")}}
                    />
                    <IconButton
                        icon={"drive_file_move"}
                        iconSize={"50px"}
                        tooltip={"Extract All Stages"}
                        onClick={() => {console.log("a")}}
                    /> */}
                    <hr className={styles.vr}/>
                    <ToggleIconButton
                        checked={!!filterInstallation}
                        trueIcon={"filter_alt"}
                        trueTooltip={message("tooltip.installation.filter")}
                        falseIcon={"filter_alt_off"}
                        falseTooltip={message("tooltip.installation.all")}
                        iconSize={"50px"}
                        setter={setFilterInstallation}
                    />
                    <ToggleIconButton
                        checked={!!updateStages}
                        trueIcon={"sync"}
                        trueTooltip={message("tooltip.stage.existing.update")}
                        falseIcon={"sync_disabled"}
                        falseTooltip={message("tooltip.stage.existing.abort")}
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
                title: message("operation.stage.randomSelection.started.title"),
                body: message("operation.stage.randomSelection.started.body", stage.name),
                image: "img://" + stage.icon,
                state: OpState.QUEUED,
                icon: randomSelection ? "help" : "help_outline",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.STAGE_LOCK],
                call: async () => {
                    api.writeStageRandom(stage.name, randomSelection);
                    stage.randomSelection = randomSelection;
                    setOperations(finishOp(
                        operationId,
                        message("operation.stage.randomSelection.finished.body", stage.name)
                    ));
                }
            }) - 1;
            return newOperations;
        });
    }, [randomSelection]);

    return (
        <tr className={styles.stageDisplayRow}>
            <td>
                <div className={styles.stageDisplayWrapper}>
                    <div className={styles.stageDisplayMug}>
                        <img
                            src={"img://" + stage.icon}
                            draggable={false}
                            onError={(event: any) => {
                                event.target.src = MISSING;
                            }}
                        />
                    </div>
                    <div className={styles.stageDisplayName}>
                        <span>{stage.menuName}</span>
                    </div>
                    <div className={styles.stageDisplayActions}>
                        <IconButton
                            icon={"delete"}
                            iconSize={"30px"}
                            tooltip={message("tooltip.stage.delete")}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: message("operation.stage.deletion.started.title"),
                                        body: message(
                                            "operation.stage.deletion.started.body",
                                            stage.name
                                        ),
                                        image: "img://" + stage.icon,
                                        state: OpState.QUEUED,
                                        icon: "delete",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [OpDep.STAGES, OpDep.STAGE_LOCK, OpDep.SSS],
                                        call: async () => {
                                            await api.removeStage(stage.name);
                                            setOperations(finishOp(
                                                operationId,
                                                message(
                                                    "operation.stage.deletion.finished.body",
                                                    stage.name
                                                )
                                            ));
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
                            tooltip={message("tooltip.stage.extract")}
                            onClick={async () => {
                                let operationId: number;
                                setOperations((prev: Operation[]) => {
                                    const newOperations: Operation[] = [...prev];
                                    operationId = newOperations.push({
                                        title: message("operation.stage.extraction.started.title"),
                                        body: message(
                                            "operation.stage.extraction.started.body",
                                            stage.name
                                        ),
                                        image: "img://" + stage.icon,
                                        state: OpState.QUEUED,
                                        icon: "drive_file_move",
                                        animation: Math.floor(Math.random() * 3),
                                        dependencies: [OpDep.STAGES],
                                        call: async () => {
                                            const extractDir: string =
                                                await api.extractStage(stage.name);
                                            setOperations(finishOp(
                                                operationId,
                                                message(
                                                    "operation.stage.extraction.finished.body",
                                                    stage.name
                                                ),
                                                {
                                                    icon: "source",
                                                    tooltip: message("tooltip.openExtractedFiles"),
                                                    call: {
                                                        name: "openDir",
                                                        args: [extractDir]
                                                    }
                                                }
                                            ));
                                        }
                                    }) - 1;
                                    return newOperations;
                                });
                            }}
                        />
                        <ToggleIconButton
                            checked={randomSelection}
                            trueIcon={"help"}
                            trueTooltip={message("tooltip.randomSelection.enabled")}
                            falseIcon={"help_outline"}
                            falseTooltip={message("tooltip.randomSelection.disabled")}
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
            <th className={styles.seriesDisplayWrapper}>
                <div className={styles.seriesDisplayName}>
                    <span>{series.toUpperCase()}</span>
                </div>
                <IconButton
                    icon={"delete_sweep"}
                    iconSize={"30px"}
                    tooltip={message("tooltip.stage.deleteSeries")}
                    onClick={async () => {
                        let operationId: number;
                        setOperations((prev: Operation[]) => {
                            const newOperations: Operation[] = [...prev];
                            operationId = newOperations.push({
                                title: message("operation.stage.seriesDeletion.started.title"),
                                body: message(
                                    "operation.stage.seriesDeletion.started.body",
                                    series
                                ),
                                state: OpState.QUEUED,
                                icon: "delete_sweep",
                                animation: Math.floor(Math.random() * 3),
                                dependencies: [OpDep.STAGES, OpDep.STAGE_LOCK, OpDep.SSS],
                                call: async () => {
                                    await api.removeSeriesStages(series);
                                    setOperations(finishOp(
                                        operationId,
                                        message(
                                            "operation.stage.seriesDeletion.finished.body",
                                            series
                                        )
                                    ));
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
                                    newOperations[operationId].image = "img://" + path;
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