import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import dialogStyles from "../custom-dialogs.css";
import installStyles from "./installation-dialogs.css";
import charactersStyles from "../../renderer/tabs/characters/characters.css";
const styles: typeof import("../custom-dialogs.css") & typeof import("./installation-dialogs.css") &
    typeof import("../../renderer/tabs/characters/characters.css") =
    Object.assign({}, dialogStyles, charactersStyles, installStyles);
import { CharacterList } from "../../global/global";
import missing from "../../assets/missing.png";

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
                dialog.resize(
                    options.id,
                    Math.min(document.documentElement.getBoundingClientRect().height, 720)
                );
                resolve(Math.min(document.documentElement.getBoundingClientRect().height, 720));
            }
        });
    });
}

function Body(): JSX.Element {
    const [height, setHeight]:
    [number, Dispatch<SetStateAction<number>>]
    = useState(0);

    const [gameCharacters, setGameCharacters]:
    [CharacterList, Dispatch<SetStateAction<CharacterList>>]
    = useState(null);

    const [foundCharacters, setFoundCharacters]:
    [FoundCharacter[], Dispatch<SetStateAction<FoundCharacter[]>>]
    = useState([]);

    useEffect(() => {
        readGameCharacters();
        findCharacters();
    }, []);

    async function readGameCharacters(): Promise<void> {
        setGameCharacters(new CharacterList(await api.readCharacters()));
    }

    async function findCharacters(): Promise<void> {
        setFoundCharacters(await api.findCharacters(options.targetDir));
    }

    useEffect(() => {
        (async () => setHeight(await requestNextFrame(height)))();
    });

    return (
        <div onKeyUp={(event: any) => {
            switch (event.key) {
                case " ":
                case "Enter":
                case "Escape":
                    ok(options.id);
                    break;
            }
        }}>
            <div className={styles.center}>
                <span>
                    {options.body}
                </span>
            </div>
            <div id={styles.characterDiv}>
                <div className={styles.center}>
                    <table>
                        <tbody>
                            {/* TODO: sort, search characters */}
                            {foundCharacters.map((character: FoundCharacter) => (
                                <CharacterDisplay
                                    character={character}
                                    gameCharacters={gameCharacters}
                                    key={character.name}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <br/>
            <div className={styles.right}>
                <button onClick={() => ok(options.id)}>
                    Done
                </button>
            </div>
        </div>
    );
}

function ok(id: string): void {
    if (id == undefined) return;
    dialog.ok(id, undefined);
}

function CharacterDisplay({
    character,
    gameCharacters
}: {
    character: FoundCharacter,
    gameCharacters: CharacterList
}): JSX.Element {
    return (
        <tr className={styles.characterDisplayRow}>
            <td>
                <div className={styles.characterDisplayWrapper}>
                    <div className={styles.characterDisplayMug}>
                        <img
                            src={"img://" + character.mug}
                            draggable={false}
                            onError={(event: any) => {
                                event.target.src = missing;
                            }}
                        />
                    </div>
                    <div className={styles.characterDisplayName}>
                        <span>{character.dat.menuName}</span>
                    </div>
                    <div className={styles.characterDisplayActions}>
                        {gameCharacters.getByName(character.name) ?
                            <>Update</> :
                            <>Install</>
                        }
                    </div>
                </div>
            </td>
        </tr>
    );
}