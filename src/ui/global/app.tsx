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
import { StatusDisplayInfo, StatusDisplayState } from "../../interfaces";
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
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) => JSX.Element,
    allowTabSwitch: () => Promise<boolean>
}
export const HOME: Tab = {
    name: "home",
    displayName: "Home",
    icon: "home",
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) =>
        <TabHome setDisplays={setDisplays}/>,
    allowTabSwitch: AllowTabSwitchHome
};
export const CHARACTERS: Tab = {
    name: "characters",
    displayName: "Characters",
    icon: "groups",
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) =>
        <TabCharacters setDisplays={setDisplays}/>,
    allowTabSwitch: null
};
export const CHARACTER_SELECTION_SCREEN: Tab = {
    name: "characterSelectionScreen",
    displayName: "Character Selection Screen",
    icon: "pan_tool_alt",
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) =>
        <TabCharacterSelectionScreen setDisplays={setDisplays}/>,
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
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) =>
        <TabStages setDisplays={setDisplays}/>,
    allowTabSwitch: null
};
export const STAGE_SELECTION_SCREEN: Tab = {
    name: "stageSelectionScreen",
    displayName: "Stage Selection Screen",
    icon: "location_pin",
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) =>
        <TabStageSelectionScreen setDisplays={setDisplays}/>,
    allowTabSwitch: null
};
export const DOWNLOADS: Tab = {
    name: "downloads",
    displayName: "Downloads",
    icon: "download",
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) =>
        <TabDownloads setDisplays={setDisplays}/>,
    allowTabSwitch: AllowTabSwitchDownloads
};
export const SETTINGS: Tab = {
    name: "settings",
    displayName: "Settings",
    icon: "settings",
    element: (setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>) =>
        <TabSettings setDisplays={setDisplays}/>,
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

    const [displays, setDisplays]:
    [StatusDisplayInfo[], Dispatch<SetStateAction<StatusDisplayInfo[]>>]
    = useState([]);

    return (
        <>
            <Nav/>
            {tab.element(setDisplays)}
            <StatusPanel
                displays={displays}
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

export function StatusPanel({
    displays,
    showPanel,
    setShowPanel
}: {
    displays: StatusDisplayInfo[],
    showPanel: boolean, 
    setShowPanel: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    useEffect(() => {
        if (displays.length > 0) {
            setShowPanel(true);
        }
    }, [displays])

    return (
        <div className={"status-panel"}>
            <div className={"status-panel-toggle"}>
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
                <div className={"status-display-box"}>
                    <div className={"center"}>
                        <h2 className={"status-panel-title"}>Operations</h2>
                    </div>
                    {displays.toReversed().map((display: StatusDisplayInfo, index: number) =>
                        <StatusDisplay
                            display={display}
                            key={index}
                        />
                    )}
                </div> : null
            }
        </div>
    );
}

export function StatusDisplay({ display }: { display: StatusDisplayInfo }): JSX.Element {
    let icon: string = display.icon;
    let classes: string = "mat-icon";
    if (display.state == StatusDisplayState.started) {
        classes += " " + ANIMATIONS[display.animation];
    } else {
        switch (display.state) {
            case (StatusDisplayState.finished):
                icon = "done";
                break;
            case (StatusDisplayState.canceled):
                icon = "close";
                break;
            case (StatusDisplayState.error):
                icon = "error_outline";
                break;
        }
    }

    return (
        <div className={"status-display"}>
            <h3>{display.title}</h3>
            <div className={"status-display-info"}>
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
                <div className={"status-display-state"}>
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
    setDisplays: Dispatch<SetStateAction<StatusDisplayInfo[]>>
): void {
    setDisplays((prev: StatusDisplayInfo[]) => {
        const newDisplays: StatusDisplayInfo[] = [...prev];
        newDisplays[displayId].state = StatusDisplayState.error;
        newDisplays[displayId].body = error.message;
        return newDisplays;
    });
}