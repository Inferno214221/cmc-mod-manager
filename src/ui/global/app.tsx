import { createRoot } from 'react-dom/client';
import './global.css';
import TabHome from '../home/home';
import TabCharacters from '../characters/characters';

interface Tab {
    name: string,
    displayName: string,
    icon: string,
    element: JSX.Element
}
const HOME: Tab = {
    name: 'home',
    displayName: 'Home',
    icon: 'home',
    element: <TabHome/>
};
const CHARACTERS: Tab = {
    name: 'characters',
    displayName: 'Characters',
    icon: 'groups',
    element: <TabCharacters/>
};
const CHARACTER_SELECTION_SCREEN: Tab = {
    name: 'characterSelectionScreen',
    displayName: 'Character Selection Screen',
    icon: 'pan_tool_alt',
    element: <TabHome/>
};
const PORT_CHARACTERS: Tab = {
    name: 'portCharacters',
    displayName: 'Port Characters',
    icon: 'reduce_capacity',
    element: <TabHome/>
};
const STAGES: Tab = {
    name: 'stages',
    displayName: 'Stages',
    icon: 'terrain',
    element: <TabHome/>
};
const STAGE_SELECTION_SCREEN: Tab = {
    name: 'stageSelectionScreen',
    displayName: 'Stage Selection Screen',
    icon: 'location_pin',
    element: <TabHome/>
};
const DOWNLOADS: Tab = {
    name: 'downloads',
    displayName: 'Downloads',
    icon: 'download',
    element: <TabHome/>
};

let activeTab: Tab;

const root = createRoot(document.body);
switchTabs(HOME);

function switchTabs(tab: Tab) {
    activeTab = tab;
    root.render(
        <div>
            <Nav/>
            {tab.element}
        </div>
    );
    document.title = 'CMC Mod Manager | ' + tab.displayName;
}

function Nav() {
    return (
        <nav>
            <NavOption info={HOME}/>
            <hr/>
            <NavOption info={CHARACTERS}/>
            <NavOption info={CHARACTER_SELECTION_SCREEN}/>
            <NavOption info={PORT_CHARACTERS}/>
            <hr/>
            <NavOption info={STAGES}/>
            <NavOption info={STAGE_SELECTION_SCREEN}/>
            <hr/>
            <NavOption info={DOWNLOADS}/>
        </nav>
    )
}

function NavOption({info}: {info: Tab}) {
    return (
        <div className={(activeTab == info ? 'activeTab ' : '') + 'hoverText'}>
            <button className={'navButton'} onClick={() => {switchTabs(info)}}>
                <span className={'matIcon navIcon'}>{info.icon}</span>
            </button>
            <div className={'navTooltip'}>
                <span>{info.displayName}</span>
            </div>
        </div>
    )
}