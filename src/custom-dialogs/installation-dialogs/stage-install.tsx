import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import dialogStyles from "../custom-dialogs.css";
import installStyles from "./installation-dialogs.css";
import stagesStyles from "../../renderer/tabs/stages/stages.css";
const styles: typeof import("../custom-dialogs.css") & typeof import("./installation-dialogs.css") &
    typeof import("../../renderer/tabs/stages/stages.css") =
    Object.assign({}, dialogStyles, stagesStyles, installStyles);
import { SortTypeOptions, StageList } from "../../global/global";
import IconButton from "../../renderer/icon-buttons/icon-button";
import ToggleIconButton from "../../renderer/icon-buttons/toggle-icon-button";
import CycleIconButton from "../../renderer/icon-buttons/cycle-icon-button";
import MISSING from "../../assets/missing.png";

declare const dialog: typeof import("../api").default;
declare const options: StageInstallOptions;
declare const api: typeof import("./api").default;

const root: Root = createRoot(document.body);
console.log(options);
if (!options) throw new Error("Options not found.");
if (options.title != undefined) {
    document.title = options.title;
}
root.render(<Body/>);

const sortTypes: SortTypeOptions[] = [
    SortTypeOptions.MENU_NAME,
    SortTypeOptions.SERIES
];

async function requestNextFrame(height: number, depth: number = 0): Promise<number> {
    return new Promise((resolve: (result: number) => void) => {
        window.requestAnimationFrame(async () => {
            if (document.documentElement.getBoundingClientRect().height == height) {
                console.log(depth);
                if (depth == 60) {
                    resolve(height);
                } else {
                    resolve(await requestNextFrame(height, depth + 1));
                }
            } else {
                let newHeight: number = document.documentElement.getBoundingClientRect().height;
                newHeight = Math.max(Math.min(newHeight, 720), 400);
                dialog.resize(
                    options.id,
                    newHeight
                );
                resolve(newHeight);
            }
        });
    });
}

function Body(): JSX.Element {
    const [height, setHeight]: [number, Dispatch<SetStateAction<number>>] = useState(0);

    const [gameStages, setGameStages]:
    [StageList | null, Dispatch<SetStateAction<StageList | null>>] = useState(null);

    const [foundStages, setFoundStages]:
    [FoundStage[], Dispatch<SetStateAction<FoundStage[]>>] = useState([]);

    const [alts, setAlts]: [string[], Dispatch<SetStateAction<string[]>>] = useState([]);

    const [sortedStages, setSortedStages]:
    [FoundStage[], Dispatch<SetStateAction<FoundStage[]>>] = useState([]);

    const [searchValue, setSearchValue]: [string, Dispatch<SetStateAction<string>>] = useState("");

    const [sortType, setSortType]: [number, Dispatch<SetStateAction<number>>] = useState(0);

    const [reverseSort, setReverseSort]: [boolean, Dispatch<SetStateAction<boolean>>] =
        useState(false);

    const [showAllStages, setShowAllStages]: [boolean, Dispatch<SetStateAction<boolean>>]  =
        useState(true);

    const [newFoundStages, setNewFoundStages]:
    [FoundStage[], Dispatch<SetStateAction<FoundStage[]>>] = useState([]);

    useEffect(() => {
        setSortedStages(sortStages());
    }, [
        foundStages, newFoundStages, sortType, reverseSort, searchValue, showAllStages
    ]);

    function sortStages(): FoundStage[] {
        let sortedStages: FoundStage[] = showAllStages ?
            foundStages : newFoundStages;
        if (searchValue != "") {
            sortedStages = sortedStages.filter((stage: FoundStage) =>
                ((stage.info?.menuName ?? stage.name).toLowerCase().includes(searchValue))
            );
        }
        sortedStages = sortedStages.toSorted((a: FoundStage, b: FoundStage) => {
            // @ts-ignore: 'SortTypeOptions' can't be used to index type 'StageInfo'.
            switch (sortTypes[sortType]) {
                case SortTypeOptions.SERIES:
                    // TODO: needs a better default
                    return ((a.info?.series ?? "") > (b.info?.series ?? "") ? -1 : 1);
                case SortTypeOptions.MENU_NAME:
                default:
                    return ((a.info?.menuName ?? a.name) > (b.info?.menuName ?? a.name) ? -1 : 1);
            }
        });
        if (reverseSort) {
            return sortedStages.toReversed();
        }
        return sortedStages;
    }

    dialog.on("updateStagePages", readGameStages);
    dialog.on("updateStagePages", () => null);

    useEffect(() => {
        readGameStages();
        findStages();
        readAlts();
        (async () => setHeight(await requestNextFrame(height)))();
    }, []);

    useEffect(() => {
        if (gameStages == null) return;
        setNewFoundStages(foundStages.filter((stage: FoundStage) =>
            // @ts-ignore: Property 'getByName' does not exist on type 'never'.
            !(gameStages.getByName(stage.name) || alts.includes(stage.name))
        ));
    }, [foundStages, gameStages]);

    async function readGameStages(): Promise<void> {
        setGameStages(new StageList(await api.readStages()));
    }

    async function findStages(): Promise<void> {
        setFoundStages(await api.findStages(options.targetDir));
    }

    async function readAlts(): Promise<void> {
        setAlts((await api.readAlts()).map((alt: Alt) => alt.alt));
    }

    return (
        <section onKeyUp={(event: any) => {
            switch (event.key) {
                case " ":
                case "Enter":
                case "Escape":
                    ok(options.id);
                    break;
            }
        }}>
            <div id={styles.sortDiv}>
                <div className={styles.center}>
                    <span>Stages found in: </span>
                    <input
                        type={"text"}
                        readOnly={true}
                        id={styles.dirOutput}
                        value={options.targetDir}
                    />
                </div>
            </div>
            <hr/>
            <div id={styles.sortDiv}>
                <div className={styles.center}>
                    <div className={styles.tooltipWrapper + " " + styles.inlineSortOptions}>
                        <input
                            type={"text"}
                            placeholder={"Search"}
                            id={styles.stageSearch}
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
                                "sort_by_alpha",
                                "group"
                            ]}
                            tooltips={[
                                "Sort By: Alphabetical",
                                "Sort By: Series"
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
                        <ToggleIconButton
                            checked={showAllStages}
                            trueIcon={"groups"}
                            trueTooltip={"Showing: All Stages"}
                            falseIcon={"person_outline"}
                            falseTooltip={"Showing: New Stages"}
                            iconSize={"30px"}
                            setter={setShowAllStages}
                        />
                    </div>
                </div>
            </div>
            <div id={styles.stageDiv}>
                <div className={styles.center}>
                    <table>
                        <tbody>
                            {gameStages == undefined ? null :
                                sortTypes[sortType] == SortTypeOptions.SERIES ?
                                    sortedStages.map((
                                        stage: FoundStage,
                                        index: number
                                    ) => {
                                        const stageDisplay: JSX.Element = (
                                            <StageDisplay
                                                targetDir={options.targetDir}
                                                stage={stage}
                                                gameStages={gameStages}
                                                alts={alts}
                                                key={stage.name}
                                            />
                                        );
                                        if (
                                            index == 0 || stage.info?.series !=
                                            sortedStages[index - 1].info?.series
                                        ) {
                                            return (
                                                <>
                                                    <SeriesDisplay
                                                        series={stage.info?.series ?? ""}
                                                    />
                                                    {stageDisplay}
                                                </>
                                            );
                                        }
                                        return stageDisplay;
                                    }) :
                                    sortedStages.map((stage: FoundStage) => (
                                        <StageDisplay
                                            targetDir={options.targetDir}
                                            stage={stage}
                                            gameStages={gameStages}
                                            alts={alts}
                                            key={stage.name}
                                        />
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function ok(id: string): void {
    if (id == undefined) return;
    dialog.ok(id, undefined);
}

function StageDisplay({
    targetDir,
    stage,
    gameStages,
    alts
}: {
    targetDir: string,
    stage: FoundStage,
    gameStages: StageList,
    alts: string[]
}): JSX.Element {

    async function onClick(): Promise<void> {
        api.queStageInstallation(targetDir, stage, true, true, "filesystem");
    }

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
                        <span>
                            {stage.info?.menuName ??
                                "(" + stage.name + ")"
                            }
                        </span>
                    </div>
                    <div className={styles.stageDisplayActions}>
                        {(gameStages.getByName(stage.name) ||
                            alts.includes(stage.name)) ?
                            <IconButton
                                icon={"sync"}
                                iconSize={"30px"}
                                tooltip={"Update Stage"}
                                onClick={onClick}
                            /> : <IconButton
                                icon={"add"}
                                iconSize={"30px"}
                                tooltip={"Install Stage"}
                                onClick={onClick}
                            />
                        }
                    </div>
                </div>
            </td>
        </tr>
    );
}

function SeriesDisplay({
    series
}: {
    series: string
}): JSX.Element {
    return (
        <tr>
            <th className={styles.seriesDisplayWrapper}>
                <div className={styles.seriesDisplayName}>
                    <span>{series.toUpperCase()}</span>
                </div>
            </th>
        </tr>
    );
}