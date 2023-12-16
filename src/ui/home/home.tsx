import "./home.css";
import cmcmm from "../../assets/icon.png";
import pfp from "../../assets/pfp.png";
import gh from "../../assets/github.png";
import gb from "../../assets/gb.png";

export default function TabHome(): JSX.Element {
    return (
        <>
            <section>
                <div id={ "about-div" }>
                    <div className={ "center" }>
                        <img src={ cmcmm } id={ "cmcmm-icon" } draggable={ false }/>
                        <h1>CMC Mod Manager</h1>
                    </div>
                    <div className={ "center" }>
                        {/* <img src={ pfp } id={ "pfp" } draggable={ false }/> */}
                        <h2>By Inferno214221</h2>
                    </div>
                    <div className={ "center" }>
                        <ExternalLinkImage
                            icon={ pfp }
                            tooltip={ "Home Page" }
                            location={ "https://inferno214221.com/dev/cmc-mod-manager" }
                            id={ "homepage" }
                        />
                        <ExternalLinkImage
                            icon={ gh }
                            tooltip={ "GitHub" }
                            location={ "https://github.com/Inferno214221/cmc-mod-manager" }
                            id={ "gh" }
                        />
                        <ExternalLinkImage
                            icon={ gb }
                            tooltip={ "GameBanana" }
                            location={ "https://gamebanana.com/tools/14136" }
                            id={ "gb" }
                        />
                    </div>
                    <div className={ "center" }>
                        <button onClick={ () => {
                            alert("Copyright (C) 2023 Inferno214221\n\n" +
                        "This program is free software: you can redistribute it and/or modify " +
                        "it under the terms of the GNU General Public License as published by " +
                        "the Free Software Foundation, either version 3 of the License, or " +
                        "(at your option) any later version.\n\n" +
                        "This program is distributed in the hope that it will be useful, " + 
                        "but WITHOUT ANY WARRANTY; without even the implied warranty of " +
                        "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the " +
                        "GNU General Public License for more details.\n\n" +
                        "You should have received a copy of the GNU General Public License " + 
                        "along with this program. If not, see <https://www.gnu.org/licenses/>."
                            )
                        } }>Show License (GPLv3)</button>
                    </div>
                </div>
                <hr/>
                <div id={ "game-select-div" }>
                    E
                </div>
                <hr/>
                <div id={ "tabs-div" }>
                    E
                </div>
            </section>
        </>
    );
}

function ExternalLinkImage({
    icon,
    tooltip,
    location,
    id
}: {
    icon: string,
    tooltip: string,
    location: string,
    id: string
}): JSX.Element {
    return (
        <div className={ "external-wrapper tooltip-wrapper" }>
            <button  className={ "external-button" } onClick={ () => {
                api.openExternal(location)
            } }>
                <img src={ icon } id={ id } className={ "external-img" } draggable={ false }/>
            </button>
            <div className={ "tooltip" }>
                <span>{tooltip}</span>
            </div>
        </div>
    );
}