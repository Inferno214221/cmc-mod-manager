import { Dispatch, SetStateAction, useState, useEffect } from "react";
import "./stages.css";
import IconButton from "../global/icon-button/icon-button";
import ToggleIconButton from "../global/icon-button/toggle-icon-button";
import CycleIconButton from "../global/icon-button/cycle-icon-button";
import { Stage, sortTypes, SortTypeOptions, AppData } from "../../interfaces";

export function TabStages(): JSX.Element {
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
                        icon={"folder_shared"}
                        iconSize={"50px"}
                        tooltip={"Install Stage From Directory"}
                        onClick={async () => {
                            // await api.installStageDir(
                            //     filterInstallation,
                            //     updateStages
                            // );
                            readStages();
                        }}
                    />
                    <IconButton
                        icon={"contact_page"}
                        iconSize={"50px"}
                        tooltip={"Install Stage From Archive"}
                        onClick={async () => {
                            // await api.installStageArch(
                            //     filterInstallation,
                            //     updateStages
                            // );
                            readStages();
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
                    {/* <IconButton
                        icon={"delete_sweep"}
                        iconSize={"50px"}
                        tooltip={"Remove All Stages"}
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
    readStages
}: {
    stage: Stage,
    readStages: () => Promise<void>
}): JSX.Element {
    const [randomSelection, setRandomSelection]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(stage.randomSelection);

    useEffect(() => {
        if (randomSelection == stage.randomSelection) return;
        api.writeStageRandom(stage.name, randomSelection);
        stage.randomSelection = randomSelection;
    }, [randomSelection]);

    return (
        <tr className={"stage-display-row"}>
            <td>
                <div className={"stage-display-wrapper"}>
                    <div className={"stage-display-mug"}>
                        <img src={"img://" + stage.icon} draggable={false}/>
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
                                // await api.removeStage(stage.name);
                                readStages();
                            }}
                        />
                        <IconButton
                            icon={"drive_file_move"}
                            iconSize={"30px"}
                            tooltip={"Extract Stage"}
                            onClick={() => {
                                // api.extractStage(stage.name);
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
    readStages
}: {
    series: string,
    readStages: () => Promise<void>
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
                        await api.removeSeries(series);
                        readStages();
                    }}
                />
            </th>
        </tr>
    );
}