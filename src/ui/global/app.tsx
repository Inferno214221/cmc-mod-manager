import { createRoot, Root } from "react-dom/client";
import "./global.css";
import TabHome from "../home/home";
import TabCharacters from "../characters/characters";
import TabCharacterSelectionScreen from "../character-selection-screen/character-selection-screen";

let root: Root;
let activeTabInfo: TabInfo;

export function render(): void {
    root = createRoot(document.body);
    switchTabs(HOME);
}
export interface TabInfo {
    name: string,
    displayName: string,
    icon: string,
    element: JSX.Element
}
export const HOME: TabInfo = {
    name: "home",
    displayName: "Home",
    icon: "home",
    element: <TabHome/>
};
export const CHARACTERS: TabInfo = {
    name: "characters",
    displayName: "Characters",
    icon: "groups",
    element: <TabCharacters/>
};
export const CHARACTER_SELECTION_SCREEN: TabInfo = {
    name: "characterSelectionScreen",
    displayName: "Character Selection Screen",
    icon: "pan_tool_alt",
    element: <TabCharacterSelectionScreen/>
};
export const PORT_CHARACTERS: TabInfo = {
    name: "portCharacters",
    displayName: "Port Characters",
    icon: "reduce_capacity",
    element: <TabHome/>
};
export const STAGES: TabInfo = {
    name: "stages",
    displayName: "Stages",
    icon: "terrain",
    element: <TabHome/>
};
export const STAGE_SELECTION_SCREEN: TabInfo = {
    name: "stageSelectionScreen",
    displayName: "Stage Selection Screen",
    icon: "location_pin",
    element: <TabHome/>
};
export const DOWNLOADS: TabInfo = {
    name: "downloads",
    displayName: "Downloads",
    icon: "download",
    element: <TabHome/>
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
        //TODO: change a ui element?
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
    icon: "play_circle",
    function: () => {
        api.runGame();
    }
};

export async function switchTabs(tab: TabInfo): Promise<void> {
    if (!await api.isValidGameDir()) {
        console.log("Do some stuff and then return");
    }
    activeTabInfo = tab;
    root.render(
        <>
            <Nav/>
            {tab.element}
        </>
    );
    document.title = "CMC Mod Manager | " + tab.displayName;
}

export function Nav(): JSX.Element {
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
            <hr/>
            <NavTab info={DOWNLOADS}/>
            <div className={"flex-fill"}/>
            <NavButton info={CHANGE_DIR}/>
            <NavButton info={OPEN_DIR}/>
            <NavButton info={RUN_GAME}/>
        </nav>
    );
}

export function NavTab({ info }: { info: TabInfo }): JSX.Element {
    return (
        <div className={(activeTabInfo == info ? "active-tab " : "") + "tooltip-wrapper"}>
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