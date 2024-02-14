import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Root, createRoot } from "react-dom/client";
import "./global.css";
import {
    AllowTabSwitchHome, TabHome
} from "../home/home";
import {
    TabCharacters
} from "../characters/characters";
import {
    TabCharacterSelectionScreen
} from "../character-selection-screen/character-selection-screen";
import {
    TabStages
} from "../stages/stages";
import {
    TabStageSelectionScreen
} from "../stage-selection-screen/stage-selection-screen";
import {
    AllowTabSwitchDownloads, TabDownloads
} from "../downloads/downloads";
import {
    TabSettings
} from "../settings/settings";
import ToggleIconButton from "./icon-button/toggle-icon-button";
import { Operation, OperationState } from "../../interfaces";
import missing from "../../assets/missing.png";

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
export const PORT_CHARACTERS: Tab = {
    name: "portCharacters",
    displayName: "Port Characters",
    icon: "reduce_capacity",
    element: () => <></>,
    allowTabSwitch: null
};
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
export const DOWNLOADS: Tab = {
    name: "downloads",
    displayName: "Downloads",
    icon: "download",
    element: (setOperations: Dispatch<SetStateAction<Operation[]>>) =>
        <TabDownloads setOperations={setOperations}/>,
    allowTabSwitch: AllowTabSwitchDownloads
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
    = useState(false);

    const [operations, setOperations]:
    [Operation[], Dispatch<SetStateAction<Operation[]>>]
    = useState([]);

    useEffect(() => {
        console.log(operations);
        callQueuedOperations(operations);
        console.log(operations);
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
    const [showDownloads, setShowDownloads]:
    [boolean, Dispatch<SetStateAction<boolean>>]
    = useState(false);

    useEffect(() => {
        checkURIAssociated();
    }, []);

    async function checkURIAssociated(): Promise<void> {
        setShowDownloads(await api.isURIAssociated());
    }

    return (
        <nav>
            <NavTab info={HOME}/>
            <hr/>
            <NavTab info={CHARACTERS}/>
            <NavTab info={CHARACTER_SELECTION_SCREEN}/>
            <NavTab info={PORT_CHARACTERS}/>
            <hr/>
            <NavTab info={STAGES}/>
            <NavTab info={STAGE_SELECTION_SCREEN}/>
            {showDownloads ?
                <>
                    <hr/>
                    <NavTab info={DOWNLOADS}/>
                </> : null
            }
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
        if (operations.length > 0) {
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
    if (display.state == OperationState.started) {
        classes += " " + ANIMATIONS[display.animation];
    } else {
        switch (display.state) {
            case (OperationState.queued):
                icon = "pending";
                break;
            case (OperationState.finished):
                icon = "done";
                break;
            case (OperationState.canceled):
                icon = "close";
                break;
            case (OperationState.error):
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
                        src={"img://" + display.image}
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
    displayId: number,
    setOperations: Dispatch<SetStateAction<Operation[]>>
): void {
    setOperations((prev: Operation[]) => {
        const newDisplays: Operation[] = [...prev];
        newDisplays[displayId].state = OperationState.error;
        newDisplays[displayId].body = error.message.replace(/(Error: Error)[\w:' ]*(?=Error)/, "");
        return newDisplays;
    });
}

export function callQueuedOperations(
    operations: Operation[]
): void {
    const filesInUse: string[] = [];
    operations.forEach((operation: Operation) => {
        if (operation.state == OperationState.started) {
            operation.dependencies.forEach((dep: string) => {
                filesInUse.push(dep);
            });
        }
    });
    const toStart: Operation[] = operations.toReversed().filter((operation: Operation) => {
        if (operation.state == OperationState.queued) {
            if (
                operation.dependencies.map(
                    (dep: string) => filesInUse.includes(dep)
                ).includes(true)
            ) {
                operation.dependencies.forEach((dep: string) => {
                    filesInUse.push(dep);
                });
                return true;
            }
        }
        return false;
    });
    console.log(toStart);
    //set object properties without updating the array
}