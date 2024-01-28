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
    AllowTabSwitchDownloads, TabDownloads
} from "../downloads/downloads";
import {
    TabSettings
} from "../settings/settings";

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
    element: JSX.Element,
    allowTabSwitch: () => Promise<boolean>
}
export const HOME: Tab = {
    name: "home",
    displayName: "Home",
    icon: "home",
    element: <TabHome/>,
    allowTabSwitch: AllowTabSwitchHome
};
export const CHARACTERS: Tab = {
    name: "characters",
    displayName: "Characters",
    icon: "groups",
    element: <TabCharacters/>,
    allowTabSwitch: null
};
export const CHARACTER_SELECTION_SCREEN: Tab = {
    name: "characterSelectionScreen",
    displayName: "Character Selection Screen",
    icon: "pan_tool_alt",
    element: <TabCharacterSelectionScreen/>,
    allowTabSwitch: null
};
export const PORT_CHARACTERS: Tab = {
    name: "portCharacters",
    displayName: "Port Characters",
    icon: "reduce_capacity",
    element: <TabHome/>,
    allowTabSwitch: null
};
export const STAGES: Tab = {
    name: "stages",
    displayName: "Stages",
    icon: "terrain",
    element: <TabStages/>,
    allowTabSwitch: null
};
export const STAGE_SELECTION_SCREEN: Tab = {
    name: "stageSelectionScreen",
    displayName: "Stage Selection Screen",
    icon: "location_pin",
    element: <TabHome/>,
    allowTabSwitch: null
};
export const DOWNLOADS: Tab = {
    name: "downloads",
    displayName: "Downloads",
    icon: "download",
    element: <TabDownloads/>,
    allowTabSwitch: AllowTabSwitchDownloads
};
export const SETTINGS: Tab = {
    name: "settings",
    displayName: "Settings",
    icon: "settings",
    element: <TabSettings/>,
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
    icon: "launch",
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
    root.render(
        <>
            <Nav/>
            {tab.element}
        </>
    );
    document.title = "CMC Mod Manager | " + tab.displayName;
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