import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import { AllowTabSwitchHome, TabHome } from "../tabs/home/home";
import { TabCharacters } from "../tabs/characters/characters";
import { TabCharacterSelectionScreen } from "../tabs/character-ss/character-ss";
import { TabStages } from "../tabs/stages/stages";
import { TabStageSelectionScreen } from "../tabs/stage-ss/stage-ss";
import ToggleIconButton from "../icon-buttons/toggle-icon-button";
import MISSING from "../../assets/missing.png";
import { OpDep, OpState } from "../../global/global";
import styles from "./app.css";
import IconButton from "../icon-buttons/icon-button";

let root: Root;
let activeTab: Tab | null = null;

export function render(): void {
    root = createRoot(document.body);
    switchTabs(HOME);
}
export interface Tab {
    name: string,
    displayName: string,
    icon: string,
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) => JSX.Element,
    allowTabSwitch?: () => Promise<boolean>
}
export const HOME: Tab = {
    name: "home",
    displayName: "Home",
    icon: "home",
    element: () => <TabHome/>,
    allowTabSwitch: AllowTabSwitchHome
};
export const CHARACTERS: Tab = {
    name: "characters",
    displayName: "Characters",
    icon: "groups",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabCharacters setOperations={setOperations}/>
};
export const CHARACTER_SELECTION_SCREEN: Tab = {
    name: "characterSelectionScreen",
    displayName: "Character Selection Screen",
    icon: "pan_tool_alt",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabCharacterSelectionScreen setOperations={setOperations}/>
};
export const STAGES: Tab = {
    name: "stages",
    displayName: "Stages",
    icon: "terrain",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabStages setOperations={setOperations}/>
};
export const STAGE_SELECTION_SCREEN: Tab = {
    name: "stageSelectionScreen",
    displayName: "Stage Selection Screen",
    icon: "location_pin",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabStageSelectionScreen setOperations={setOperations}/>
};

export interface NavButtonInfo {
    displayName: string,
    icon: string,
    function: () => void
}
export const CHANGE_DIR: NavButtonInfo = {
    displayName: "Change CMC+ Directory",
    icon: "policy",
    function: async () => {
        await api.selectGameDir();
        switchTabs(HOME);
    }
};
export const OPEN_DIR: NavButtonInfo = {
    displayName: "Open CMC+ Directory",
    icon: "folder",
    function: async () => {
        api.openDir(await api.getGameDir());
    }
};
export const RUN_GAME: NavButtonInfo = {
    displayName: "Run CMC+",
    icon: "smart_display",
    function: () => {
        api.runGame();
    }
};

export async function switchTabs(tab: Tab): Promise<void> {
    if (
        activeTab != null &&
        activeTab.allowTabSwitch != null &&
        !await activeTab.allowTabSwitch()
    ) return;
    activeTab = tab;
    root.render(<App tab={tab}/>);
    document.title = "CMC Mod Manager | " + tab.displayName;
}

export function App({ tab }: { tab: Tab }): JSX.Element {
    const [showPanel, setShowPanel]:
    [boolean | null, Dispatch<SetStateAction<boolean | null>>]
    = useState(null);

    const [operations, setOperations]:
    [Operation[], Dispatch<SetStateAction<Operation[]>>]
    = useState([]);

    api.on("addOperation", (operation: Operation) => {
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            newOperations.push(operation);
            return newOperations;
        });
    });
    api.on("getOperations", () => {
        return api.getOperations(JSON.stringify(operations));
    });
    api.on("updateOperation", (update: OperationUpdate) => {
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            const filtered: Operation[] = newOperations.filter(
                (operation: Operation) => operation.id == update.id
            );
            if (filtered.length < 1) return newOperations;
            const operation: Operation = filtered[0];
            Object.assign(operation, update);
            return newOperations;
        });
    });
    api.handleProcessArgs();

    useEffect(() => {
        callQueuedOperations(operations, setOperations);
    }, [operations]);

    return (
        <>
            <Nav/>
            {tab.element(setOperations)}
            <OperationPanel
                operations={operations}
                showPanel={showPanel}
                setShowPanel={setShowPanel}
            />
        </>
    );
}

export function Nav(): JSX.Element {
    return (
        <nav>
            <NavTab info={HOME}/>
            <hr/>
            <NavTab info={CHARACTERS}/>
            <NavTab info={CHARACTER_SELECTION_SCREEN}/>
            <hr/>
            <NavTab info={STAGES}/>
            <NavTab info={STAGE_SELECTION_SCREEN}/>
            <div className={styles.flexFill}/>
            <NavButton info={CHANGE_DIR}/>
            <NavButton info={OPEN_DIR}/>
            <NavButton info={RUN_GAME}/>
        </nav>
    );
}

export function NavTab({ info }: { info: Tab }): JSX.Element {
    return (
        <div className={
            (activeTab == info ? styles.activeTab + " " : "") + styles.tooltipWrapper
        }>
            <button className={styles.navClick} onClick={() => {switchTabs(info);}}>
                <span className={styles.matIcon + " " + styles.navIcon}>{info.icon}</span>
            </button>
            <div className={styles.tooltip}>
                <span>{info.displayName}</span>
            </div>
        </div>
    );
}

export function NavButton({ info }: { info: NavButtonInfo }): JSX.Element {
    return (
        <div className={styles.tooltipWrapper}>
            <button className={styles.navClick} onClick={() => {info.function()}}>
                <span className={styles.matIcon + " " + styles.navIcon}>{info.icon}</span>
            </button>
            <div className={styles.tooltip}>
                <span>{info.displayName}</span>
            </div>
        </div>
    );
}

const ANIMATIONS: string[] = [
    "animation-rotation",
    "animation-coin-flip",
    "animation-flipX"
];

export function OperationPanel({
    operations,
    showPanel,
    setShowPanel
}: {
    operations: Operation[],
    showPanel: boolean | null, 
    setShowPanel: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    useEffect(() => {
        if (showPanel == null && operations.length > 0) {
            setShowPanel(true);
        }
    }, [operations])

    return (
        <div className={styles.operationPanel}>
            <div className={styles.operationPanelToggle}>
                <ToggleIconButton
                    checked={!!showPanel}
                    trueIcon={"keyboard_arrow_right"}
                    trueTooltip={"Hide Operations"}
                    falseIcon={"keyboard_arrow_left"}
                    falseTooltip={"Show Operations"}
                    iconSize={"30px"}
                    setter={setShowPanel}
                />
            </div>
            {showPanel ?
                <div className={styles.operationDisplayBox}>
                    <div className={styles.center}>
                        <h2 className={styles.operationPanelTitle}>Operations</h2>
                    </div>
                    {operations.toReversed().map((display: Operation, index: number) =>
                        <OperationDisplay
                            display={display}
                            key={index}
                        />
                    )}
                </div> : null
            }
        </div>
    );
}

export function OperationDisplay({ display }: { display: Operation }): JSX.Element {
    let icon: string = display.icon;
    let classes: string = styles.matIcon;
    let closeButton: JSX.Element | null = null;
    switch (display.state) {
        case (OpState.STARTED):
            classes += " " + styles[ANIMATIONS[display.animation]];
            if (display.cancelable) {
                closeButton = (
                    <IconButton
                        icon={"close"}
                        iconSize={"16px"}
                        tooltip={"Cancel Operation"}
                        onClick={() => api.cancelOperation(display.id)}
                    />
                );
            } else if (display.action) {
                closeButton = (
                    <IconButton
                        icon={display.action.icon}
                        iconSize={"16px"}
                        tooltip={display.action.tooltip}
                        onClick={() => runOperation(display.action!.call)}
                    />
                );
            }
            break
        case (OpState.QUEUED):
            icon = "pending";
            closeButton = (
                <IconButton
                    icon={"close"}
                    iconSize={"16px"}
                    tooltip={"Cancel Operation"}
                    onClick={() => display.state = OpState.CANCELED}
                    // Pass by reference moment
                />
            );
            break;
        case (OpState.FINISHED):
            icon = "done";
            if (display.action) {
                closeButton = (
                    <IconButton
                        icon={display.action.icon}
                        iconSize={"16px"}
                        tooltip={display.action.tooltip}
                        onClick={() => runOperation(display.action!.call)}
                    />
                );
            }
            // could modify call and then run again??? - this would involve call
            // overriding its parent's reference to itself, although it does already update itself
            // for install operations, could que a delete to undo
            // delete operations could be modified copies of extract, which target a tmp dir and que
            // a install operation on undo
            break;
        case (OpState.CANCELED):
            icon = "block";
            break;
        case (OpState.ERROR):
            icon = "error_outline";
            break;
    }

    return (
        <div className={styles.operationDisplay}>
            <div className={styles.operationDisplayTitle}>
                <h3>{display.title}</h3>
                {closeButton}
            </div>
            <div className={styles.operationDisplayInfo}>
                {display.image == null ? null :
                    <img
                        src={display.image}
                        draggable={false}
                        onError={(event: any) => {
                            event.target.src = MISSING;
                        }}
                    />
                }
                <div>
                    <span>{display.body}</span>
                </div>
                <div className={styles.operationDisplayState}>
                    <span className={classes}>
                        {icon}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function displayError(
    err: any,
    operationId: number,
    setOperations: Dispatch<SetStateAction<Operation[]>>
): void {
    setOperations((prev: Operation[]) => {
        const newOperations: Operation[] = [...prev];
        newOperations[operationId].state = OpState.ERROR;
        newOperations[operationId].body =
            err.message.replace(/(Error: Error)[\w:' ]*(?=Error)/, "");
        return newOperations;
    });
}

export async function callQueuedOperations(
    operations: Operation[],
    setOperations: Dispatch<SetStateAction<Operation[]>>
): Promise<void> {
    const depsInUse: OpDep[] = [];
    operations.forEach((operation: Operation) => {
        if (operation.state == OpState.STARTED) {
            operation.dependencies.forEach((dep: OpDep) => {
                depsInUse.push(dep);
            });
        }
    });
    const toStart: Operation[] = operations.filter((operation: Operation) => {
        if (operation.state == OpState.QUEUED) {
            if (
                !operation.dependencies.map(
                    (dep: OpDep) => depsInUse.includes(dep)
                ).includes(true)
            ) {
                operation.dependencies.forEach((dep: OpDep) => {
                    depsInUse.push(dep);
                });
                return true;
            }
        }
        return false;
    });
    if (toStart.length < 1) return;
    const operation: Operation = toStart[0];
    const operationId: number = operations.indexOf(operation);
    try {
        console.log("Started: " + operation.title);
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            newOperations[operationId].state = OpState.STARTED;
            return newOperations;
        });
        if (operation.call != undefined) await runOperation(operation.call);
        console.log("Finished: " + operation.title);
    } catch (err: any) {
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            newOperations[operationId].state = OpState.ERROR;
            newOperations[operationId].body =
                err.message.replace(/(Error)[\w' ]*: (?=Error)/, "");
            return newOperations;
        });
    }
}

async function runOperation(call: (() => Promise<void>) | MainCall): Promise<void> {
    if (typeof call == "function") {
        await call();
    } else {
        if (api[call.name] != undefined) {
            await api[call.name](...call.args);
        } else {
            throw new Error("Function not found: " + call.name + ".");
        }
    }
}