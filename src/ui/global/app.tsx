import { createRoot } from 'react-dom/client';
import './global.css';
import TabInfoHome from '../home/home';
import TabInfoCharacters from '../characters/characters';

interface TabInfo {
    name: string,
    displayName: string,
    icon: string,
    element: JSX.Element
}
const HOME: TabInfo = {
    name: 'home',
    displayName: 'Home',
    icon: 'home',
    element: <TabInfoHome/>
};
const CHARACTERS: TabInfo = {
    name: 'characters',
    displayName: 'Characters',
    icon: 'groups',
    element: <TabInfoCharacters/>
};
const CHARACTER_SELECTION_SCREEN: TabInfo = {
    name: 'characterSelectionScreen',
    displayName: 'Character Selection Screen',
    icon: 'pan_tool_alt',
    element: <TabInfoHome/>
};
const PORT_CHARACTERS: TabInfo = {
    name: 'portCharacters',
    displayName: 'Port Characters',
    icon: 'reduce_capacity',
    element: <TabInfoHome/>
};
const STAGES: TabInfo = {
    name: 'stages',
    displayName: 'Stages',
    icon: 'terrain',
    element: <TabInfoHome/>
};
const STAGE_SELECTION_SCREEN: TabInfo = {
    name: 'stageSelectionScreen',
    displayName: 'Stage Selection Screen',
    icon: 'location_pin',
    element: <TabInfoHome/>
};
const DOWNLOADS: TabInfo = {
    name: 'downloads',
    displayName: 'Downloads',
    icon: 'download',
    element: <TabInfoHome/>
};

interface NavButtonInfo {
    displayName: string,
    icon: string,
    function: VoidFunction
}
const CHANGE_DIR: NavButtonInfo = {
    displayName: 'Change CMC+ Directory',
    icon: 'policy',
    function: () => {console.log('AAA')}
};
const OPEN_DIR: NavButtonInfo = {
    displayName: 'Open CMC+ Directory',
    icon: 'folder',
    function: () => {console.log('AAA')}
};
const RUN_GAME: NavButtonInfo = {
    displayName: 'Run CMC+',
    icon: 'play_circle',
    function: () => {console.log('AAA')}
};

let activeTabInfo: TabInfo;

function switchTabInfos(tab: TabInfo): void {
    activeTabInfo = tab;
    root.render(
        <>
            <Nav/>
            {tab.element}
        </>
    );
    document.title = 'CMC Mod Manager | ' + tab.displayName;
}

function Nav(): JSX.Element {
    return (
        <nav>
            <NavTabInfo info={HOME}/>
            <hr/>
            <NavTabInfo info={CHARACTERS}/>
            <NavTabInfo info={CHARACTER_SELECTION_SCREEN}/>
            <NavTabInfo info={PORT_CHARACTERS}/>
            <hr/>
            <NavTabInfo info={STAGES}/>
            <NavTabInfo info={STAGE_SELECTION_SCREEN}/>
            <hr/>
            <NavTabInfo info={DOWNLOADS}/>
            <div className={'flex-fill'}/>
            <NavButton info={CHANGE_DIR}/>
            <NavButton info={OPEN_DIR}/>
            <NavButton info={RUN_GAME}/>
        </nav>
    );
}

function NavTabInfo({info}: {info: TabInfo}): JSX.Element {
    return (
        <div className={(activeTabInfo == info ? 'active-tab ' : '') + 'hover-text'}>
            <button className={'nav-click'} onClick={() => {switchTabInfos(info);}}>
                <span className={'mat-icon nav-icon'}>{info.icon}</span>
            </button>
            <div className={'nav-tooltip'}>
                <span>{info.displayName}</span>
            </div>
        </div>
    );
}

function NavButton({info}: {info: NavButtonInfo}): JSX.Element {
    return (
        <div className={'hover-text'}>
            <button className={'nav-click'} onClick={() => {info.function()}}>
                <span className={'mat-icon nav-icon'}>{info.icon}</span>
            </button>
            <div className={'nav-tooltip'}>
                <span>{info.displayName}</span>
            </div>
        </div>
    );
}

const root = createRoot(document.body);
switchTabInfos(HOME);