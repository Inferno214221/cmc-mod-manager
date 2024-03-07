import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import "./app.css";
import { AllowTabSwitchHome, TabHome } from "../tabs/home/home";
import { TabCharacters } from "../tabs/characters/characters";
import { TabCharacterSelectionScreen } from "../tabs/character-ss/character-ss";
import { TabStages } from "../tabs/stages/stages";
import { TabStageSelectionScreen } from "../tabs/stage-ss/stage-ss";
import { TabSettings } from "../tabs/settings/settings";
import ToggleIconButton from "../icon-buttons/toggle-icon-button";
import missing from "../../assets/missing.png";
import { OpDep, OpState } from "../../global/global";

let root: Root;
let activeTab: Tab = null;

export function render(): void {
    root = createRoot(document.body);
    switchTabs(HOME);
}
export interface Tab {
    name: string,
    displayName: string,
    icon: string,
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) => JSX.Element,
    allowTabSwitch: () => Promise<boolean>
}
export const HOME: Tab = {
    name: "home",
    displayName: "Home",
    icon: "home",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabHome setOperations={setOperations}/>,
    allowTabSwitch: AllowTabSwitchHome
};
export const CHARACTERS: Tab = {
    name: "characters",
    displayName: "Characters",
    icon: "groups",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabCharacters setOperations={setOperations}/>,
    allowTabSwitch: null
};
export const CHARACTER_SELECTION_SCREEN: Tab = {
    name: "characterSelectionScreen",
    displayName: "Character Selection Screen",
    icon: "pan_tool_alt",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabCharacterSelectionScreen setOperations={setOperations}/>,
    allowTabSwitch: null
};
// export const PORT_CHARACTERS: Tab = {
//     name: "portCharacters",
//     displayName: "Port Characters",
//     icon: "reduce_capacity",
//     element: () => <></>,
//     allowTabSwitch: null
// };
export const STAGES: Tab = {
    name: "stages",
    displayName: "Stages",
    icon: "terrain",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabStages setOperations={setOperations}/>,
    allowTabSwitch: null
};
export const STAGE_SELECTION_SCREEN: Tab = {
    name: "stageSelectionScreen",
    displayName: "Stage Selection Screen",
    icon: "location_pin",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabStageSelectionScreen setOperations={setOperations}/>,
    allowTabSwitch: null
};
export const SETTINGS: Tab = {
    name: "settings",
    displayName: "Settings",
    icon: "settings",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabSettings setOperations={setOperations}/>,
    allowTabSwitch: null
};

export interface NavButtonInfo {
    displayName: string,
    icon: string,
    function: VoidFunction
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
    ) {
        console.log("Do some stuff and then return");
        return;
    }
    activeTab = tab;
    root.render(<App tab={tab}/>);
    document.title = "CMC Mod Manager | " + tab.displayName;
}

export function App({ tab }: { tab: Tab }): JSX.Element {
    const [showPanel, setShowPanel]:
    [boolean, Dispatch<SetStateAction<boolean>>]
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
            if (filtered.length < 1) return;
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
            {/* <NavTab info={PORT_CHARACTERS}/> */}
            <hr/>
            <NavTab info={STAGES}/>
            <NavTab info={STAGE_SELECTION_SCREEN}/>
            <hr/>
            <NavTab info={SETTINGS}/>
            <div className={"flex-fill"}/>
            <NavButton info={CHANGE_DIR}/>
            <NavButton info={OPEN_DIR}/>
            <NavButton info={RUN_GAME}/>
        </nav>
    );
}

export function NavTab({ info }: { info: Tab }): JSX.Element {
    return (
        <div className={(activeTab == info ? "active-tab " : "") + "tooltip-wrapper"}>
            <button className={"nav-click"} onClick={() => {switchTabs(info);}}>
                <span className={"mat-icon nav-icon"}>{info.icon}</span>
            </button>
            <div className={"tooltip"}>
                <span>{info.displayName}</span>
            </div>
        </div>
    );
}

export function NavButton({ info }: { info: NavButtonInfo }): JSX.Element {
    return (
        <div className={"tooltip-wrapper"}>
            <button className={"nav-click"} onClick={() => {info.function()}}>
                <span className={"mat-icon nav-icon"}>{info.icon}</span>
            </button>
            <div className={"tooltip"}>
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
    showPanel: boolean, 
    setShowPanel: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    useEffect(() => {
        if (showPanel == null && operations.length > 0) {
            setShowPanel(true);
        }
    }, [operations])

    return (
        <div className={"operation-panel"}>
            <div className={"operation-panel-toggle"}>
                <ToggleIconButton
                    checked={showPanel}
                    trueIcon={"keyboard_arrow_right"}
                    trueTooltip={"Hide Operations"}
                    falseIcon={"keyboard_arrow_left"}
                    falseTooltip={"Show Operations"}
                    iconSize={"30px"}
                    setter={setShowPanel}
                />
            </div>
            {showPanel ?
                <div className={"operation-display-box"}>
                    <div className={"center"}>
                        <h2 className={"operation-panel-title"}>Operations</h2>
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
    let classes: string = "mat-icon";
    if (display.state == OpState.started) {
        classes += " " + ANIMATIONS[display.animation];
    } else {
        switch (display.state) {
            case (OpState.queued):
                icon = "pending";
                break;
            case (OpState.finished):
                icon = "done";
                break;
            case (OpState.canceled):
                icon = "close";
                break;
            case (OpState.error):
                icon = "error_outline";
                break;
        }
    }

    return (
        <div className={"operation-display"}>
            <h3>{display.title}</h3>
            <div className={"operation-display-info"}>
                {display.image == null ? null :
                    <img
                        src={display.image}
                        draggable={false}
                        onError={(event: any) => {
                            event.target.src = missing;
                        }}
                    />
                }
                <div>
                    <span>{display.body}</span>
                </div>
                <div className={"operation-display-state"}>
                    <span className={classes}>
                        {icon}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function displayError(
    error: any,
    operationId: number,
    setOperations: Dispatch<SetStateAction<Operation[]>>
): void {
    setOperations((prev: Operation[]) => {
        const newOperations: Operation[] = [...prev];
        newOperations[operationId].state = OpState.error;
        newOperations[operationId].body =
            error.message.replace(/(Error: Error)[\w:' ]*(?=Error)/, "");
        return newOperations;
    });
}

export async function callQueuedOperations(
    operations: Operation[],
    setOperations: Dispatch<SetStateAction<Operation[]>>
): Promise<void> {
    // console.log("callQueuedOperations");
    const depsInUse: OpDep[] = [];
    operations.forEach((operation: Operation) => {
        if (operation.state == OpState.started) {
            operation.dependencies.forEach((dep: OpDep) => {
                depsInUse.push(dep);
            });
        }
    });
    const toStart: Operation[] = operations.filter((operation: Operation) => {
        if (operation.state == OpState.queued) {
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
    // console.log(toStart);
    if (toStart.length < 1) return;
    const operation: Operation = toStart[0];
    const operationId: number = operations.indexOf(operation);
    try {
        console.log("Started: " + operation.title);
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            newOperations[operationId].state = OpState.started;
            return newOperations;
        });
        if (typeof operation.call == "function") {
            await operation.call();
        } else {
            /* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: expression of type 'string' can't be used to index type */
            if (api[operation.call.name] != undefined) {
                await api[operation.call.name](...operation.call.args);
            } else {
                //TODO: throw error
            }
        }
        console.log("Finished: " + operation.title);
    } catch (error: any) {
        setOperations((prev: Operation[]) => {
            const newOperations: Operation[] = [...prev];
            newOperations[operationId].state = OpState.error;
            newOperations[operationId].body =
                error.message.replace(/(Error)[\w' ]*: (?=Error)/, "");
            return newOperations;
        });
    }
}