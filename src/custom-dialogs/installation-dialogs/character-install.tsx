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
import { MessageMap, translations } from "../../global/translations";

let error: (key: string, ...args: any) => never;
let message: (key: keyof MessageMap, ...args: any) => string;

function setupTranslations(): void {
    const funcs: ReturnType<typeof translations> = translations(global.language);
    error = funcs.error;
    message = funcs.message;
}

declare const dialog: typeof import("../api").default;
declare const options: {
    id: string,
    name: string,
    extra: InstallOptions
};
declare const api: typeof import("./api").default;

dialog.readAppData().then(async (appData: AppData) => {
    global.language = appData.config.language;
    setupTranslations();

    const root: Root = createRoot(document.body);
    console.log(options);
    if (!options) error("missingDialogOptions");
    document.title = message("dialog.installation.character.title")!;
    root.render(<Body/>);
});

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

    const [sortedCharacters, setSortedCharacters]:
    [FoundCharacter[], Dispatch<SetStateAction<FoundCharacter[]>>] = useState([]);

    const [searchValue, setSearchValue]: [string, Dispatch<SetStateAction<string>>] = useState("");

    const [sortType, setSortType]: [number, Dispatch<SetStateAction<number>>] = useState(0);

    const [reverseSort, setReverseSort]: [boolean, Dispatch<SetStateAction<boolean>>] =
        useState(false);

    const [showAllCharacters, setShowAllCharacters]: [boolean, Dispatch<SetStateAction<boolean>>]  =
        useState(true);

    const [newFoundCharacters, setNewFoundCharacters]:
    [FoundCharacter[], Dispatch<SetStateAction<FoundCharacter[]>>] = useState([]);

    useEffect(() => {
        setSortedCharacters(sortCharacters());
    }, [
        foundCharacters, newFoundCharacters, sortType, reverseSort, searchValue, showAllCharacters
    ]);

    function sortCharacters(): FoundCharacter[] {
        let sortedCharacters: FoundCharacter[] = showAllCharacters ?
            foundCharacters : newFoundCharacters;
        if (searchValue != "") {
            sortedCharacters = sortedCharacters.filter((character: FoundCharacter) =>
                ((character.dat.menuName ?? character.name).toLowerCase().includes(searchValue))
            );
        }
        sortedCharacters = sortedCharacters.toSorted((a: FoundCharacter, b: FoundCharacter) =>
            // @ts-ignore: 'SortTypeOptions' can't be used to index type 'CharacterDat'.
            (a.dat[sortTypes[sortType]] > b.dat[sortTypes[sortType]] ? 1 : -1)
        );
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

    useEffect(() => {
        if (gameCharacters == null) return;
        setNewFoundCharacters(foundCharacters.filter((character: FoundCharacter) =>
            // @ts-ignore: Property 'getByName' does not exist on type 'never'.
            !(gameCharacters.getByName(character.name) || alts.includes(character.name))
        ));
    }, [foundCharacters, gameCharacters]);

    async function readGameCharacters(): Promise<void> {
        setGameCharacters(new CharacterList(await api.readCharacters()));
    }

    async function findCharacters(): Promise<void> {
        setFoundCharacters(await api.findCharacters(options.extra.targetDir));
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
                        value={options.extra.targetDir}
                    />
                </div>
            </div>
            <hr/>
            <div id={styles.sortDiv}>
                <div className={styles.center}>
                    <div className={styles.tooltipWrapper + " " + styles.inlineSortOptions}>
                        <input
                            type={"text"}
                            placeholder={message("ui.searchPlaceholder")}
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
                                message("tooltip.sortBy.alphabetical"),
                                message("tooltip.sortBy.series")
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
                        <ToggleIconButton
                            checked={showAllCharacters}
                            trueIcon={"groups"}
                            trueTooltip={message("tooltip.character.showing.all")}
                            falseIcon={"person_outline"}
                            falseTooltip={message("tooltip.character.showing.new")}
                            iconSize={"30px"}
                            setter={setShowAllCharacters}
                        />
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
                                                targetDir={options.extra.targetDir}
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
                                            targetDir={options.extra.targetDir}
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
                                tooltip={message("tooltip.character.update")}
                                onClick={onClick}
                            /> : <IconButton
                                icon={"add"}
                                iconSize={"30px"}
                                tooltip={message("tooltip.character.install")}
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