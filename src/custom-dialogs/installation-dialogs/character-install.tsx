import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import dialogStyles from "../custom-dialogs.css";
import installStyles from "./installation-dialogs.css";
import charactersStyles from "../../renderer/tabs/characters/characters.css";
const styles: typeof import("../custom-dialogs.css") & typeof import("./installation-dialogs.css") &
    typeof import("../../renderer/tabs/characters/characters.css") =
    Object.assign({}, dialogStyles, charactersStyles, installStyles);
import { CharacterList, SortTypeOptions } from "../../global/global";
import IconButton from "../../renderer/icon-buttons/icon-button";
import ToggleIconButton from "../../renderer/icon-buttons/toggle-icon-button";
import CycleIconButton from "../../renderer/icon-buttons/cycle-icon-button";
import MISSING from "../../assets/missing.png";

declare const dialog: typeof import("../api").default;
declare const options: CharacterInstallOptions;
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

    const [gameCharacters, setGameCharacters]:
    [CharacterList | null, Dispatch<SetStateAction<CharacterList | null>>] = useState(null);

    const [foundCharacters, setFoundCharacters]:
    [FoundCharacter[], Dispatch<SetStateAction<FoundCharacter[]>>] = useState([]);

    const [alts, setAlts]: [string[], Dispatch<SetStateAction<string[]>>] = useState([]);

    const [preSorted, setPreSorted]:
    [FoundCharacter[][], Dispatch<SetStateAction<FoundCharacter[][]>>]
    = useState([[], [], []]);

    const [sortedCharacters, setSortedCharacters]:
    [FoundCharacter[], Dispatch<SetStateAction<FoundCharacter[]>>]
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
        setPreSorted(() => {
            const retVal: FoundCharacter[][] = [];
            sortTypes.forEach((sortType: SortTypeOptions, index: number) => {
                retVal[index] = foundCharacters.toSorted(
                    (a: FoundCharacter, b: FoundCharacter) =>
                        // @ts-ignore; Property '[SortTypeOptions.NUMBER]' does not exist on type
                        // 'CharacterDat'.
                        (a.dat[sortType] > b.dat[sortType] ? 1 : -1)
                );
            });
            return retVal;
        });
    }, [foundCharacters]);

    useEffect(() => {
        setSortedCharacters(sortCharacters(preSorted[sortType]));
    }, [preSorted, sortType, reverseSort, searchValue]);

    function sortCharacters(characters: FoundCharacter[]): FoundCharacter[] {
        let sortedCharacters: FoundCharacter[] = characters;
        if (searchValue != "") {
            sortedCharacters = sortedCharacters.filter((character: FoundCharacter) =>
                ((character.dat.menuName ?? character.name).toLowerCase().includes(searchValue))
            );
        }
        if (reverseSort) {
            return sortedCharacters.toReversed();
        }
        return sortedCharacters;
    }

    dialog.on("updateCharacterPages", readGameCharacters);
    dialog.on("updateStagePages", () => null);

    useEffect(() => {
        readGameCharacters();
        findCharacters();
        readAlts();
        (async () => setHeight(await requestNextFrame(height)))();
    }, []);

    async function readGameCharacters(): Promise<void> {
        setGameCharacters(new CharacterList(await api.readCharacters()));
    }

    async function findCharacters(): Promise<void> {
        setFoundCharacters(await api.findCharacters(options.targetDir));
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
                    <span>Characters found in: </span>
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
                            id={styles.characterSearch}
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
                        {/* TODO: add option for 'excluded' characters */}
                    </div>
                </div>
            </div>
            <div id={styles.characterDiv}>
                <div className={styles.center}>
                    <table>
                        <tbody>
                            {gameCharacters == undefined ? null :
                                sortTypes[sortType] == SortTypeOptions.SERIES ?
                                    sortedCharacters.map((
                                        character: FoundCharacter,
                                        index: number
                                    ) => {
                                        const characterDisplay: JSX.Element = (
                                            <CharacterDisplay
                                                targetDir={options.targetDir}
                                                character={character}
                                                gameCharacters={gameCharacters}
                                                alts={alts}
                                                key={character.name}
                                            />
                                        );
                                        if (
                                            index == 0 || character.dat.series !=
                                            sortedCharacters[index - 1].dat.series
                                        ) {
                                            return (
                                                <>
                                                    <SeriesDisplay
                                                        series={character.dat.series ?? ""}
                                                    />
                                                    {characterDisplay}
                                                </>
                                            );
                                        }
                                        return characterDisplay;
                                    }) :
                                    sortedCharacters.map((character: FoundCharacter) => (
                                        <CharacterDisplay
                                            targetDir={options.targetDir}
                                            character={character}
                                            gameCharacters={gameCharacters}
                                            alts={alts}
                                            key={character.name}
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

function CharacterDisplay({
    targetDir,
    character,
    gameCharacters,
    alts
}: {
    targetDir: string,
    character: FoundCharacter,
    gameCharacters: CharacterList,
    alts: string[]
}): JSX.Element {

    async function onClick(): Promise<void> {
        api.queCharacterInstallation(targetDir, character, true, true, "filesystem");
    }

    return (
        <tr className={styles.characterDisplayRow}>
            <td>
                <div className={styles.characterDisplayWrapper}>
                    <div className={styles.characterDisplayMug}>
                        <img
                            src={"img://" + character.mug}
                            draggable={false}
                            onError={(event: any) => {
                                event.target.src = MISSING;
                            }}
                        />
                    </div>
                    <div className={styles.characterDisplayName}>
                        <span>
                            {character.dat.menuName ??
                                "(" + character.name + ")"
                            }
                        </span>
                    </div>
                    <div className={styles.characterDisplayActions}>
                        {(gameCharacters.getByName(character.name) ||
                            alts.includes(character.name)) ?
                            <IconButton
                                icon={"sync"}
                                iconSize={"30px"}
                                tooltip={"Update Character"}
                                onClick={onClick}
                            /> : <IconButton
                                icon={"add"}
                                iconSize={"30px"}
                                tooltip={"Install Character"}
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