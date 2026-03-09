import { Dispatch, SetStateAction, useEffect, useState } from "react";
import IconButton from "../../icon-buttons/icon-button";
import ToggleIconButton from "../../icon-buttons/toggle-icon-button";
import CycleIconButton from "../../icon-buttons/cycle-icon-button";
import MISSING from "../../../assets/missing.png";
import {
  CharacterList,
  DndDataType,
  OpDep,
  OpState,
  SortTypeOptions,
  finishOp,
} from "../../../global/global";
import appStyles from "../../app/app.css";
import characterSsStyles from "./character-ss.css";
const styles: typeof import("../../app/app.css") &
  typeof import("./character-ss.css") = Object.assign(
  {},
  appStyles,
  characterSsStyles,
);

import { translations } from "../../../global/translations";
const { message }: ReturnType<typeof translations> = translations(
  global.language,
);

const sortTypes: SortTypeOptions[] = [
  SortTypeOptions.NUMBER,
  SortTypeOptions.SERIES,
  SortTypeOptions.MENU_NAME,
];

enum DndMode {
  AUTO = "auto",
  INSERT = "insert",
  SWAP = "swap",
}

export function TabCharacterSelectionScreen({
  setOperations,
  handle,
}: {
  setOperations: Dispatch<SetStateAction<Operation[]>>;
  handle: <T>(promise: Promise<T>) => Promise<T>;
}): JSX.Element {
  const [characters, setCharacters]: [
    Character[],
    Dispatch<SetStateAction<Character[]>>,
  ] = useState([]);

  const [characterList, setCharacterList]: [
    CharacterList | null,
    Dispatch<SetStateAction<CharacterList | null>>,
  ] = useState(null);

  const [excluded, setExcluded]: [
    Character[],
    Dispatch<SetStateAction<Character[]>>,
  ] = useState([]);

  const [cssPages, setCssPages]: [
    CssPage[],
    Dispatch<SetStateAction<CssPage[]>>,
  ] = useState([]);

  const [activePage, setActivePage]: [
    CssPage | null,
    Dispatch<SetStateAction<CssPage | null>>,
  ] = useState(null);

  const [cssData, setCssData]: [
    CssData | null,
    Dispatch<SetStateAction<CssData | null>>,
  ] = useState(null);

  const [selectedPositions, setSelectedPositions]: [
    Set<string>,
    Dispatch<SetStateAction<Set<string>>>,
  ] = useState(new Set());

  const [lastSelectedPosition, setLastSelectedPosition]: [
    { x: number; y: number } | null,
    Dispatch<SetStateAction<{ x: number; y: number } | null>>,
  ] = useState(null);

  const [dragOverPosition, setDragOverPosition]: [
    { x: number; y: number } | null,
    Dispatch<SetStateAction<{ x: number; y: number } | null>>,
  ] = useState(null);

  const [isDraggingFromPool, setIsDraggingFromPool]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState(false);

  const [dndMode, setDndMode]: [
    DndMode,
    Dispatch<SetStateAction<DndMode>>,
  ] = useState(DndMode.AUTO);

  const [selectedExcluded, setSelectedExcluded]: [
    Set<string>,
    Dispatch<SetStateAction<Set<string>>>,
  ] = useState(new Set());

  api.on("updateCharacterPages", getInfo);
  api.on("updateStagePages", () => null);

  async function getInfo(): Promise<void> {
    const characters: Character[] = await handle(api.readCharacters());
    characters.push({
      name: "random",
      menuName: "Random",
      series: "random",
      randomSelection: false,
      number: 9999,
      alts: [],
      mug: await handle(
        api.pathJoin(
          await handle(api.getGameDir()),
          "gfx",
          "mugs",
          "random.png",
        ),
      ),
    });
    setCharacters(characters);
    getPages();
  }

  async function getPages(newActivePage?: CssPage): Promise<void> {
    if (newActivePage == null) newActivePage = activePage ?? undefined;
    const pages: CssPage[] = await handle(api.readCssPages());
    setCssPages(pages);
    const pageMatch: CssPage[] = pages.filter(
      (page: CssPage) => page.path == newActivePage?.path,
    );
    if (pageMatch.length == 1) {
      setActivePage(pageMatch[0]);
      return;
    }
    setActivePage(pages[0]);
  }

  useEffect(() => {
    getInfo();
  }, []);

  async function getCssData(): Promise<void> {
    if (activePage == null) return;
    setCssData(await handle(api.readCssData(activePage)));
  }

  useEffect(() => {
    getCssData();
  }, [activePage]);

  useEffect(() => {
    setCharacterList(new CharacterList(characters));
  }, [characters]);

  useEffect(() => {
    if (characters == null || cssData == null) return;
    setExcluded(
      characters.filter((character: Character) => {
        for (const row of cssData as CssData) {
          if (row.includes(("0000" + character.number).slice(-4))) {
            return false;
          }
        }
        return true;
      }),
    );
  }, [characters, cssData]);

  async function updateCssData(data: CssData): Promise<void> {
    let operationId: number;
    // Can't be called unless activePage has a value
    setOperations((prev: Operation[]) => {
      const newOperations: Operation[] = [...prev];
      operationId =
        newOperations.push({
          title: message("operation.css.writeData.started.title"),
          body: message(
            "operation.css.writeData.started.body",
            activePage!.name,
          ),
          state: OpState.QUEUED,
          icon: "pan_tool_alt",
          animation: Math.floor(Math.random() * 3),
          dependencies: [OpDep.CSS],
          call: async () => {
            await api.writeCssData(activePage!, data);
            getCssData();
            setOperations(
              finishOp(
                operationId,
                message(
                  "operation.css.writeData.finished.body",
                  activePage!.name,
                ),
              ),
            );
          },
        }) - 1;
      return newOperations;
    });
  }

  function characterDragAndDrop(from: DndData, to: DndData): void {
    console.log(from, to);
    // Clear drag over indicator
    setDragOverPosition(null);
    setIsDraggingFromPool(false);

    // Can't be called unless cssData has a value
    const newCssData: CssData = cssData!.map((row) => [...row]); // Deep copy

    const useInsert =
      dndMode == DndMode.INSERT ||
      (dndMode == DndMode.AUTO && from.type == DndDataType.SS_NUMBER);

    if (from.type == DndDataType.SS_NUMBER) {
      if (to.type == DndDataType.SS_NUMBER) {
        const fromData = from as DndDataSsNumber;
        const toData = to as DndDataSsNumber;

        // Check if we're dragging multiple selected items
        const fromKey = `${fromData.x},${fromData.y}`;
        const isMultiSelect =
          selectedPositions.has(fromKey) && selectedPositions.size > 1;

        if (useInsert) {
          if (isMultiSelect) {
            // Multi-select insert
            const flat: string[] = newCssData.flat();
            const rowLength = newCssData[0].length;

            const selectedItems: Array<{ index: number; character: string }> = [];
            selectedPositions.forEach((posKey) => {
              const [x, y] = posKey.split(",").map(Number);
              const index = y * rowLength + x;
              selectedItems.push({ index, character: flat[index] });
            });

            selectedItems.sort((a, b) => a.index - b.index);
            const characters = selectedItems.map((item) => item.character);

            for (let i = selectedItems.length - 1; i >= 0; i--) {
              flat.splice(selectedItems[i].index, 1);
            }

            const toIndex = toData.y * rowLength + toData.x;
            const removedBefore = selectedItems.filter(
              (item) => item.index < toIndex,
            ).length;
            const adjustedToIndex = toIndex - removedBefore;

            flat.splice(adjustedToIndex, 0, ...characters);

            for (let i = 0; i < newCssData.length; i++) {
              for (let j = 0; j < rowLength; j++) {
                newCssData[i][j] = flat[i * rowLength + j];
              }
            }
          } else {
            // Single item insert
            const flat: string[] = newCssData.flat();
            const rowLength = newCssData[0].length;
            const fromIndex = fromData.y * rowLength + fromData.x;
            const toIndex = toData.y * rowLength + toData.x;

            if (fromIndex === toIndex) {
              return;
            }

            const character = flat[fromIndex];
            flat.splice(fromIndex, 1);
            const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
            flat.splice(adjustedToIndex, 0, character);

            for (let i = 0; i < newCssData.length; i++) {
              for (let j = 0; j < rowLength; j++) {
                newCssData[i][j] = flat[i * rowLength + j];
              }
            }
          }
        } else {
          // Swap mode for roster→roster
          if (isMultiSelect) {
            const flat: string[] = newCssData.flat();
            const rowLength = newCssData[0].length;

            const selectedItems: Array<{ index: number; character: string }> = [];
            selectedPositions.forEach((posKey) => {
              const [x, y] = posKey.split(",").map(Number);
              const index = y * rowLength + x;
              selectedItems.push({ index, character: flat[index] });
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

            for (let i = 0; i < newCssData.length; i++) {
              for (let j = 0; j < rowLength; j++) {
                newCssData[i][j] = flat[i * rowLength + j];
              }
            }
          } else {
            newCssData[fromData.y][fromData.x] = to.number;
            newCssData[toData.y][toData.x] = from.number;
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
            newCssData[y][x] = "0000";
          });
        } else {
          newCssData[fromData.y][fromData.x] = "0000";
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
            const flat: string[] = newCssData.flat();
            const rowLength = newCssData[0].length;
            const toIndex = toData.y * rowLength + toData.x;
            const selectedNumbers = [...selectedExcluded];

            flat.splice(toIndex, 0, ...selectedNumbers);
            flat.splice(flat.length - selectedNumbers.length);

            for (let i = 0; i < newCssData.length; i++) {
              for (let j = 0; j < rowLength; j++) {
                newCssData[i][j] = flat[i * rowLength + j];
              }
            }
          } else {
            const flat: string[] = newCssData.flat();
            const rowLength = newCssData[0].length;
            const toIndex =
              (to as DndDataSsNumber).y * rowLength + (to as DndDataSsNumber).x;

            flat.splice(toIndex, 0, from.number);
            flat.pop();

            for (let i = 0; i < newCssData.length; i++) {
              for (let j = 0; j < rowLength; j++) {
                newCssData[i][j] = flat[i * rowLength + j];
              }
            }
          }
        } else {
          // Swap mode for pool→roster
          if (isMultiSelectPool) {
            const toData = to as DndDataSsNumber;
            const flat: string[] = newCssData.flat();
            const rowLength = newCssData[0].length;
            let toIndex = toData.y * rowLength + toData.x;
            const selectedNumbers = [...selectedExcluded];

            for (const num of selectedNumbers) {
              if (toIndex < flat.length) {
                flat[toIndex] = num;
                toIndex++;
              }
            }

            for (let i = 0; i < newCssData.length; i++) {
              for (let j = 0; j < rowLength; j++) {
                newCssData[i][j] = flat[i * rowLength + j];
              }
            }
          } else {
            newCssData[(to as DndDataSsNumber).y][(to as DndDataSsNumber).x] =
              from.number;
          }
        }
        setSelectedExcluded(new Set());
      } else {
        return;
      }
    }
    updateCssData(newCssData);
  }

  function handleCellClick(
    x: number,
    y: number,
    event: React.MouseEvent,
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
      const rowLength = cssData![0].length;
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
          <CssPages
            cssPages={cssPages}
            activePage={activePage}
            setActivePage={setActivePage}
            getPages={getPages}
            setOperations={setOperations}
          />
        </div>
      </div>
      <hr />
      <div id={styles.cssDiv}>
        <div id={styles.cssWrapper}>
          <div className={styles.center}>
            <table id={styles.cssTable}>
              <tbody>
                <CssTableContents
                  cssData={cssData}
                  setCssData={setCssData}
                  characterList={characterList}
                  updateCssData={updateCssData}
                  characterDragAndDrop={characterDragAndDrop}
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
      <div id={styles.cssDivControls}>
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
      <hr />
      <ExcludedCharacters
        characters={characters}
        excluded={excluded}
        characterDragAndDrop={characterDragAndDrop}
        setIsDraggingFromPool={setIsDraggingFromPool}
        selectedExcluded={selectedExcluded}
        setSelectedExcluded={setSelectedExcluded}
      />
    </section>
  );
}

function ExcludedCharacters({
  characters,
  excluded,
  characterDragAndDrop,
  setIsDraggingFromPool,
  selectedExcluded,
  setSelectedExcluded,
}: {
  characters: Character[];
  excluded: Character[];
  characterDragAndDrop: (from: DndData, to: DndData) => void;
  setIsDraggingFromPool: Dispatch<SetStateAction<boolean>>;
  selectedExcluded: Set<string>;
  setSelectedExcluded: Dispatch<SetStateAction<Set<string>>>;
}): JSX.Element {
  const [searchValue, setSearchValue]: [
    string,
    Dispatch<SetStateAction<string>>,
  ] = useState("");

  const [sortType, setSortType]: [number, Dispatch<SetStateAction<number>>] =
    useState(0);

  const [reverseSort, setReverseSort]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState(false);

  const [showAllCharacters, setShowAllCharacters]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState(false);

  const [sortedCharacters, setSortedCharacters]: [
    Character[],
    Dispatch<SetStateAction<Character[]>>,
  ] = useState([]);

  useEffect(() => {
    setSortedCharacters(sortCharacters(characters));
  }, [
    characters,
    excluded,
    sortType,
    reverseSort,
    showAllCharacters,
    searchValue,
  ]);

  function sortCharacters(characters: Character[]): Character[] {
    let sortedCharacters: Character[] = showAllCharacters
      ? characters
      : excluded;
    if (searchValue != "") {
      sortedCharacters = sortedCharacters.filter((character: Character) =>
        character.menuName.toLowerCase().includes(searchValue),
      );
    }
    sortedCharacters = sortedCharacters.toSorted(
      (a: Character, b: Character) =>
        a[sortTypes[sortType]] > b[sortTypes[sortType]] ? 1 : -1,
    );
    if (reverseSort) {
      sortedCharacters.reverse();
    }
    return sortedCharacters;
  }

  return (
    <>
      <div id={styles.sortExcludedDiv}>
        <div className={styles.center}>
          <div
            className={styles.tooltipWrapper + " " + styles.inlineSortOptions}
          >
            <input
              type={"text"}
              placeholder={message("ui.searchPlaceholder")}
              id={styles.excludedSearch}
              onInput={(event: any) => {
                setSearchValue(event.target.value);
                console.log(searchValue, sortType, reverseSort);
              }}
              title={message("tooltip.character.search")}
            />
          </div>
          <div className={styles.inlineSortOptions}>
            <CycleIconButton
              index={sortType}
              icons={["format_list_numbered", "group", "sort_by_alpha"]}
              tooltips={[
                message("tooltip.sortBy.number"),
                message("tooltip.sortBy.series"),
                message("tooltip.sortBy.alphabetical"),
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
              checked={showAllCharacters}
              trueIcon={"groups"}
              trueTooltip={message("tooltip.character.showing.all")}
              falseIcon={"person_outline"}
              falseTooltip={message("tooltip.character.showing.excluded")}
              iconSize={"30px"}
              setter={setShowAllCharacters}
            />
          </div>
        </div>
      </div>
      <div id={styles.excludedDiv}>
        <div className={styles.center}>
          <div id={styles.excludedWrapper}>
            {sortTypes[sortType] == SortTypeOptions.SERIES
              ? sortedCharacters.map((character: Character, index: number) => {
                  if (character == undefined) return null;
                  const characterDisplay: JSX.Element = (
                    <CharacterDisplay
                      character={character}
                      characterDragAndDrop={characterDragAndDrop}
                      setIsDraggingFromPool={setIsDraggingFromPool}
                      isSelected={selectedExcluded.has(("0000" + character.number).slice(-4))}
                      setSelectedExcluded={setSelectedExcluded}
                      key={character.name}
                    />
                  );
                  if (
                    index == 0 ||
                    character.series != sortedCharacters[index - 1].series
                  ) {
                    return (
                      <>
                        <div className={styles.seriesName}>
                          <span>
                            <b>{character.series.toUpperCase()}</b>
                          </span>
                        </div>
                        {characterDisplay}
                      </>
                    );
                  }
                  return characterDisplay;
                })
              : sortedCharacters.map((character: Character) =>
                  character == undefined ? null : (
                    <CharacterDisplay
                      character={character}
                      characterDragAndDrop={characterDragAndDrop}
                      setIsDraggingFromPool={setIsDraggingFromPool}
                      isSelected={selectedExcluded.has(("0000" + character.number).slice(-4))}
                      setSelectedExcluded={setSelectedExcluded}
                      key={character.name}
                    />
                  ),
                )}
          </div>
        </div>
      </div>
    </>
  );
}

function CharacterDisplay({
  character,
  characterDragAndDrop,
  setIsDraggingFromPool,
  isSelected,
  setSelectedExcluded,
}: {
  character: Character;
  characterDragAndDrop: (from: DndData, to: DndData) => void;
  setIsDraggingFromPool: Dispatch<SetStateAction<boolean>>;
  isSelected: boolean;
  setSelectedExcluded: Dispatch<SetStateAction<Set<string>>>;
}): JSX.Element {
  const dndData: DndData = {
    type: DndDataType.EXCLUDED,
    number: ("0000" + character.number).slice(-4),
  };
  return (
    <div
      className={styles.excludedDisplayWrapper + " " + styles.tooltipWrapper}
      style={{ position: "relative" }}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(100, 150, 255, 0.3)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
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
          characterDragAndDrop(
            JSON.parse(event.dataTransfer.getData("data")),
            dndData,
          );
        }}
        title={character.menuName}
      >
        <img
          src={"img://" + character.mug}
          draggable={false}
          onError={(event: any) => {
            event.target.src = MISSING;
          }}
        />
        <div className={styles.excludedDisplayName}>
          <span>{character.menuName}</span>
        </div>
      </div>
    </div>
  );
}

function CssPages({
  cssPages,
  activePage,
  setActivePage,
  getPages,
  setOperations,
}: {
  cssPages: CssPage[];
  activePage: CssPage | null;
  setActivePage: Dispatch<SetStateAction<CssPage | null>>;
  getPages: (newActivePage?: CssPage) => Promise<void>;
  setOperations: Dispatch<SetStateAction<Operation[]>>;
}): JSX.Element {
  const [newPageName, setNewPageName]: [
    string,
    Dispatch<SetStateAction<string>>,
  ] = useState("");

  function reorderCssPage(from: number, to: number): void {
    let operationId: number;
    setOperations((prev: Operation[]) => {
      const newOperations: Operation[] = [...prev];
      operationId =
        newOperations.push({
          title: message("operation.css.reorderPages.started.title"),
          body: message(
            "operation.css.reorderPages.started.body",
            cssPages[from].name,
            to > from ? to - 1 : to,
          ),
          state: OpState.QUEUED,
          icon: "swap_horiz",
          animation: Math.floor(Math.random() * 3),
          dependencies: [OpDep.GAME_SETTINGS],
          call: async () => {
            await api.reorderCssPage(from, to);
            setOperations(
              finishOp(
                operationId,
                message(
                  "operation.css.reorderPages.finished.body",
                  cssPages[from].name,
                  to > from ? to - 1 : to,
                ),
              ),
            );
            getPages();
          },
        }) - 1;
      return newOperations;
    });
  }

  function createNewPage(): void {
    if (newPageName == "") return;
    let operationId: number;
    setOperations((prev: Operation[]) => {
      const newOperations: Operation[] = [...prev];
      operationId =
        newOperations.push({
          title: message("operation.css.pageAddition.started.title"),
          body: message("operation.css.pageAddition.started.body", newPageName),
          state: OpState.QUEUED,
          icon: "add",
          animation: Math.floor(Math.random() * 3),
          dependencies: [OpDep.CSS, OpDep.GAME_SETTINGS],
          call: async () => {
            const newPage: CssPage = await api.addCssPage(newPageName);
            setOperations(
              finishOp(
                operationId,
                message(
                  "operation.css.pageAddition.finished.body",
                  newPageName,
                ),
              ),
            );
            getPages(newPage);
          },
        }) - 1;
      return newOperations;
    });
  }

  return (
    <div id={styles.pagesWrapper}>
      {cssPages.map((page: CssPage, index: number) => (
        <CssPageDisplay
          page={page}
          activePage={activePage}
          pageIndex={index}
          setActivePage={setActivePage}
          getPages={getPages}
          setOperations={setOperations}
          reorderCssPage={reorderCssPage}
          key={page.path}
        />
      ))}
      <div className={styles.cssPage + " " + styles.addCssPage}>
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
            reorderCssPage(
              parseInt(event.dataTransfer.getData("data")),
              cssPages.length,
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

function CssPageDisplay({
  page,
  activePage,
  pageIndex,
  setActivePage,
  getPages,
  setOperations,
  reorderCssPage,
}: {
  page: CssPage;
  activePage: CssPage | null;
  pageIndex: number;
  setActivePage: Dispatch<SetStateAction<CssPage | null>>;
  getPages: (newActivePage?: CssPage) => Promise<void>;
  setOperations: Dispatch<SetStateAction<Operation[]>>;
  reorderCssPage: (from: number, to: number) => void;
}): JSX.Element {
  const [editingName, setEditingName]: [
    string | null,
    Dispatch<SetStateAction<string | null>>,
  ] = useState(null);
  if (editingName != null && activePage?.path != page.path) {
    updatePageName();
    // Reset regardless of status
    setEditingName(null);
  }

  function updatePageName(): void {
    if (editingName == "" || editingName == null) return;
    let operationId: number;
    setOperations((prev: Operation[]) => {
      const newOperations: Operation[] = [...prev];
      operationId =
        newOperations.push({
          title: message("operation.css.renamePage.started.title"),
          body: message(
            "operation.css.renamePage.started.body",
            page.name,
            editingName,
          ),
          state: OpState.QUEUED,
          icon: "edit",
          animation: Math.floor(Math.random() * 3),
          dependencies: [OpDep.CSS, OpDep.GAME_SETTINGS],
          call: async () => {
            const editedPage: CssPage = await api.renameCssPage(
              pageIndex,
              editingName,
            );
            setOperations(
              finishOp(
                operationId,
                message(
                  "operation.css.renamePage.finished.body",
                  page.name,
                  editingName,
                ),
              ),
            );
            getPages(editedPage);
          },
        }) - 1;
      return newOperations;
    });
    setEditingName(null);
  }

  const mainComponent: JSX.Element =
    editingName != null ? (
      <input
        type={"text"}
        className={styles.cssPageEdit}
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
          if (activePage?.path == page.path) {
            setEditingName("");
          } else {
            setActivePage(page);
          }
        }}
        className={styles.cssPageButton}
        draggable={true}
        onDragStart={(event: any) => {
          event.dataTransfer.setData("data", pageIndex);
        }}
        onDragOver={(event: any) => {
          // TODO: apply styles on drag over
          event.preventDefault();
        }}
        onDrop={(event: any) => {
          const from: number = parseInt(event.dataTransfer.getData("data"));
          if (from == pageIndex) return;
          reorderCssPage(from, pageIndex);
        }}
      >
        {page.name}
      </button>
    );

  return (
    <div
      className={
        styles.cssPage +
        (activePage?.path == page.path ? " " + styles.cssPageActive : "")
      }
    >
      {mainComponent}
      <IconButton
        icon={"delete"}
        iconSize={"18px"}
        tooltip={message("tooltip.ss.deletePage")}
        onClick={async () => {
          if (!(await api.confirmDestructiveAction())) return;
          let operationId: number;
          setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            operationId =
              newOperations.push({
                title: message("operation.css.pageDeletion.started.title"),
                body: message(
                  "operation.css.pageDeletion.started.body",
                  page.name,
                ),
                state: OpState.QUEUED,
                icon: "delete",
                animation: Math.floor(Math.random() * 3),
                dependencies: [OpDep.CSS, OpDep.GAME_SETTINGS],
                call: async () => {
                  await api.removeCssPage(page);
                  setOperations(
                    finishOp(
                      operationId,
                      message(
                        "operation.css.pageDeletion.finished.body",
                        page.name,
                      ),
                    ),
                  );
                  getPages();
                },
              }) - 1;
            return newOperations;
          });
        }}
      />
    </div>
  );
}

function CssTableContents({
  cssData,
  setCssData,
  characterList,
  updateCssData,
  characterDragAndDrop,
  selectedPositions,
  handleCellClick,
  dragOverPosition,
  setDragOverPosition,
  isDraggingFromPool,
  dndMode,
}: {
  cssData: CssData | null;
  setCssData: Dispatch<SetStateAction<CssData | null>>;
  characterList: CharacterList | null;
  updateCssData: (data: CssData) => Promise<void>;
  characterDragAndDrop: (from: DndData, to: DndData) => void;
  selectedPositions: Set<string>;
  handleCellClick: (x: number, y: number, event: React.MouseEvent) => void;
  dragOverPosition: { x: number; y: number } | null;
  setDragOverPosition: Dispatch<
    SetStateAction<{ x: number; y: number } | null>
  >;
  isDraggingFromPool: boolean;
  dndMode: DndMode;
}): JSX.Element | null {
  const showInsertIndicator =
    dndMode == DndMode.INSERT ||
    (dndMode == DndMode.AUTO && !isDraggingFromPool);
  const showSwapIndicator =
    dndMode == DndMode.SWAP ||
    (dndMode == DndMode.AUTO && isDraggingFromPool);
  return cssData == null || characterList == null ? null : (
    <>
      <tr>
        <th></th>
        {cssData[0].map((_cell: string, index: number) => (
          <CssColumnHeader
            column={index}
            setCssData={setCssData}
            updateCssData={updateCssData}
            key={index}
          />
        ))}
        <th className="cssColumnHeader" id={styles.cssAddColumn}>
          <IconButton
            icon={"add"}
            iconSize={"11pt"}
            tooltip={message("tooltip.ss.column.add")}
            onClick={() =>
              setCssData((prev: CssData) => {
                prev = prev.map((row: string[]) => {
                  row.push("0000");
                  return row;
                });
                updateCssData(prev);
                return prev;
              })
            }
          />
        </th>
      </tr>
      {cssData.map((row: string[], yIndex: number) => (
        <tr key={yIndex}>
          <CssRowHeader
            row={yIndex}
            setCssData={setCssData}
            updateCssData={updateCssData}
            key={yIndex}
          />
          {row.map((cell: string, xIndex: number) => (
            <CssCharacterDisplay
              cell={cell}
              characterList={characterList}
              x={xIndex}
              y={yIndex}
              characterDragAndDrop={characterDragAndDrop}
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
          ))}
        </tr>
      ))}
      <tr>
        <th className="cssRowHeader" id={styles.cssAddRow}>
          <IconButton
            icon={"add"}
            iconSize={"11pt"}
            tooltip={message("tooltip.ss.row.add")}
            onClick={() =>
              setCssData((prev: CssData) => {
                prev.push([]);
                prev[0].forEach(() => {
                  prev[prev.length - 1].push("0000");
                });
                updateCssData(prev);
                return prev;
              })
            }
          />
        </th>
      </tr>
    </>
  );
}

function CssCharacterDisplay({
  cell,
  characterList,
  x,
  y,
  characterDragAndDrop,
  isSelected,
  handleCellClick,
  isDragOver,
  isSwapDragOver,
  setDragOverPosition,
}: {
  cell: string;
  characterList: CharacterList;
  x: number;
  y: number;
  characterDragAndDrop: (from: DndData, to: DndData) => void;
  isSelected: boolean;
  handleCellClick: (x: number, y: number, event: React.MouseEvent) => void;
  isDragOver: boolean;
  isSwapDragOver: boolean;
  setDragOverPosition: Dispatch<
    SetStateAction<{ x: number; y: number } | null>
  >;
}): JSX.Element {
  const dndData: DndData = {
    type: DndDataType.SS_NUMBER,
    number: cell,
    x: x,
    y: y,
  };
  const character: Character | undefined = characterList.getByNum(
    parseInt(cell),
  );
  if (character == undefined) {
    return (
      <td
        className={styles.cssCharacterDisplay}
        onDragOver={(event: any) => {
          event.preventDefault();
          setDragOverPosition({ x, y });
        }}
        onDragLeave={() => {
          setDragOverPosition(null);
        }}
        onDrop={(event: any) => {
          characterDragAndDrop(
            JSON.parse(event.dataTransfer.getData("data")),
            dndData,
          );
        }}
        style={{
          position: "relative",
        }}
      >
        {isDragOver && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              backgroundColor: "var(--inf-blue1)",
              zIndex: 10,
            }}
          />
        )}
        {isSwapDragOver && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              border: "3px solid var(--inf-blue1)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        )}
      </td>
    );
  }

  return (
    <td
      className={styles.cssCharacterDisplay}
      onClick={(event: React.MouseEvent) => handleCellClick(x, y, event)}
      style={{
        position: "relative",
      }}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(100, 150, 255, 0.3)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
      {isDragOver && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            backgroundColor: "var(--inf-blue1)",
            zIndex: 10,
          }}
        />
      )}
      {isSwapDragOver && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            border: "3px solid var(--inf-blue1)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
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
            characterDragAndDrop(
              JSON.parse(event.dataTransfer.getData("data")),
              dndData,
            );
          }}
          title={character.menuName}
        >
          <img
            src={"img://" + character.mug}
            draggable={false}
            onError={(event: any) => {
              event.target.src = MISSING;
            }}
          />
          <span>{character.menuName}</span>
        </div>
      </div>
    </td>
  );
}

function CssColumnHeader({
  column,
  setCssData,
  updateCssData,
}: {
  column: number;
  setCssData: Dispatch<SetStateAction<CssData>>;
  updateCssData: (data: CssData) => Promise<void>;
}): JSX.Element {
  const [hovered, setHovered]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);
  return (
    <th
      className={styles.cssColumnHeader}
      onMouseOver={() => {
        setHovered(true);
      }}
      onMouseOut={() => {
        setHovered(false);
      }}
    >
      {hovered ? (
        <IconButton
          icon={"remove"}
          iconSize={"11pt"}
          tooltip={message("tooltip.ss.column.remove")}
          onClick={() =>
            setCssData((prev: CssData) => {
              prev.map((row: string[]) => {
                row.splice(column, 1);
                return row;
              });
              updateCssData(prev);
              return prev;
            })
          }
        />
      ) : (
        column
      )}
    </th>
  );
}

function CssRowHeader({
  row,
  setCssData,
  updateCssData,
}: {
  row: number;
  setCssData: Dispatch<SetStateAction<CssData>>;
  updateCssData: (data: CssData) => Promise<void>;
}): JSX.Element {
  const [hovered, setHovered]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);
  return (
    <th
      className={styles.cssRowHeader}
      onMouseOver={() => {
        setHovered(true);
      }}
      onMouseOut={() => {
        setHovered(false);
      }}
    >
      {hovered ? (
        <IconButton
          icon={"remove"}
          iconSize={"11pt"}
          tooltip={message("tooltip.ss.row.remove")}
          onClick={() =>
            setCssData((prev: CssData) => {
              prev.splice(row, 1);
              updateCssData(prev);
              return prev;
            })
          }
        />
      ) : (
        row
      )}
    </th>
  );
}
