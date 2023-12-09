import * as home from "../home/home";

export default function Nav({activeTab}: {activeTab: string}) {
    return (
        <nav>
            <NavOption name='Home' icon='home' location={home} activeTab={activeTab}/>
            <hr/>
            <NavOption name='Characters' icon='groups' location={home} activeTab={activeTab}/>
            <NavOption name='Character Selection Screen' icon='pan_tool_alt' location={home} activeTab={activeTab}/>
            <NavOption name='Port Characters' icon='reduce_capacity' location={home} activeTab={activeTab}/>
            <hr/>
            <NavOption name='Stages' icon='terrain' location={home} activeTab={activeTab}/>
            <NavOption name='Stage Selection Screen' icon='location_pin' location={home} activeTab={activeTab}/>
            <hr/>
            <NavOption name='Downloads' icon='download' location={home} activeTab={activeTab}/>
        </nav>
    )
}

function NavOption({name, icon, location, activeTab}: {name: string, icon: string, location: { navigate: VoidFunction }, activeTab: string}) {
    return (
        <div className={(activeTab == name.toLowerCase() ? 'activeTab ' : '') + 'hoverText'}>
            <button className={'navButton'} onClick={() => {location.navigate(); console.log(location)}}>
                <span className={'matIcon navIcon'}>{icon}</span>
            </button>
            <div className={'navTooltip'}>
                <span>{name}</span>
            </div>
        </div>
    )
}