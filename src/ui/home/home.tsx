import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./home.css";
import cmcmm from "../../assets/icon.png";
import pfp from "../../assets/pfp.png";
import gh from "../../assets/github.png";
import gb from "../../assets/gb.png";
import IconButton from "../global/icon-button/icon-button";
import {
    CHARACTERS,
    CHARACTER_SELECTION_SCREEN,
    DOWNLOADS,
    PORT_CHARACTERS,
    SETTINGS,
    STAGES,
    STAGE_SELECTION_SCREEN,
    Tab,
    switchTabs
} from "../global/app";
import { Operation } from "../../interfaces";

const LICENSE: string = (
    "Copyright © 2023 Inferno214221\n\n" +
    "This program is free software: you can redistribute it and/or modify " +
    "it under the terms of the GNU General Public License as published by " +
    "the Free Software Foundation, either version 3 of the License, or " +
    "(at your option) any later version.\n\n" +
    "This program is distributed in the hope that it will be useful, " + 
    "but WITHOUT ANY WARRANTY; without even the implied warranty of " +
    "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the " +
    "GNU General Public License for more details.\n\n" +
    "You should have received a copy of the GNU General Public License " + 
    "along with this program. If not, see &lt;https://www.gnu.org/licenses/&gt;."
);

export async function AllowTabSwitchHome(): Promise<boolean> {
    return await api.isValidGameDir();
}

export function TabHome({
    setOperations
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
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
        <section>
            <div id={"about-div"} className={"vertical-outer-div"}>
                <div className={"vertical-inner-div"}>
                    <div className={"center margin-vertical"}>
                        <img src={cmcmm} id={"cmcmm-icon"} draggable={false}/>
                        <h1>CMC Mod Manager</h1>
                    </div>
                    <div className={"center"} id={"by-div"}>
                        <h2>By</h2>
                    </div>
                    <div className={"center margin-vertical"}>
                        <img src={pfp} id={"pfp"} draggable={false}/>
                        <h2>Inferno214221</h2>
                    </div>
                    <div className={"center margin-vertical"}>
                        <ExternalLinkImage
                            icon={cmcmm}
                            tooltip={"Home Page"}
                            location={"https://inferno214221.com/cmc-mod-manager"}
                            id={"homepage"}
                        />
                        <ExternalLinkImage
                            icon={gh}
                            tooltip={"GitHub"}
                            location={"https://github.com/Inferno214221/cmc-mod-manager"}
                            id={"gh"}
                        />
                        <ExternalLinkImage
                            icon={gb}
                            tooltip={"GameBanana"}
                            location={"https://gamebanana.com/tools/14136"}
                            id={"gb"}
                        />
                    </div>
                    <div className={"center"}>
                        <button onClick={() => {
                            api.alert({
                                title: "CMC Mod Manager | License Notice",
                                body: LICENSE
                            });
                        }}>Show License (GNU GPLv3)</button>
                    </div>
                </div>
            </div>
            <hr/>
            <div id={"game-select-div"} className={"vertical-outer-div"}>
                <div className={"vertical-inner-div"}>
                    <GameDirectoryActions/>
                </div>
            </div>
            <hr/>
            <div id={"tabs-div"} className={"vertical-outer-div"}>
                <div className={"vertical-inner-div"}>
                    {/* <div id={"tabs-scrollable"}> */}
                    <div className={"center"}>
                        <TabButton
                            tab={CHARACTERS}
                            desc={"Install, extract or delete characters from CMC+."}
                        />
                        <TabButton
                            tab={CHARACTER_SELECTION_SCREEN}
                            desc={"Modify CMC+'s character selection screen."}
                        />
                        <TabButton
                            tab={PORT_CHARACTERS}
                            desc={"Install characters from another version of CMC+."}
                        />
                        <TabButton
                            tab={STAGES}
                            desc={"Install, extract or delete stages from CMC+."}
                        />
                        <TabButton
                            tab={STAGE_SELECTION_SCREEN}
                            desc={"Modify CMC+'s stage selection screen."}
                        />
                        {showDownloads ?
                            <TabButton
                                tab={DOWNLOADS}
                                desc={"View current downloads."}
                            /> : null
                        }
                        <TabButton
                            tab={SETTINGS}
                            desc={"Configure the program and enable optional features."}
                        />
                    </div>
                    {/* </div> */}
                </div>
            </div>
        </section>
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
        <div className={"external-wrapper tooltip-wrapper"}>
            <button  className={"external-button"} onClick={() => {
                api.openExternal(location)
            }}>
                <img src={icon} id={id} className={"external-img"} draggable={false}/>
            </button>
            <div className={"tooltip"}>
                <span>{tooltip}</span>
            </div>
        </div>
    );
}

function GameDirectoryActions(): JSX.Element {
    const [cmcDir, setCmcDir]:
    [string, Dispatch<SetStateAction<string>>]
    = useState("None Selected");

    async function updateGameDir(): Promise<void> {
        const newCmcDir: string = await api.getGameDir();
        setCmcDir(newCmcDir == null ? "None Selected" : newCmcDir);
    }

    useEffect(() => {
        updateGameDir();
    }, []);
    
    return (
        <>
            <div className={"center"}>
                <span>Current CMC+ Directory: </span>
                <input
                    type={"text"}
                    readOnly={true}
                    id={"dir-output"}
                    value={cmcDir}
                    size={Math.ceil(cmcDir.length * 0.75)}
                />
            </div>
            <div className={"center margin-vertical"}>
                <IconButton
                    icon={"policy"}
                    iconSize={"50px"}
                    tooltip={"Change CMC+ Directory"}
                    onClick={async () => {
                        await api.selectGameDir();
                        updateGameDir();
                    }}
                />
                <IconButton
                    icon={"folder"}
                    iconSize={"50px"}
                    tooltip={"Open CMC+ Directory"}
                    onClick={async () => {
                        api.openDir(await api.getGameDir());
                    }}
                />
                <IconButton
                    icon={"play_circle"}
                    iconSize={"50px"}
                    tooltip={"Run CMC+"}
                    onClick={() => {
                        api.runGame();
                    }}
                />
            </div>
        </>
    );
}

function TabButton({
    tab,
    desc
}: {
    tab: Tab,
    desc: string
}): JSX.Element {
    return (
        <div className={"tab-button-wrapper"}>
            <button className={"tab-button"} onClick={() => {switchTabs(tab)}}>
                <span className={"mat-icon tab-button-icon"} style={{ fontSize: "80px" }}>
                    {tab.icon}
                </span>
                <p className={"tab-button-title"}>
                    {tab.displayName}
                </p>
                <p className={"tab-button-desc"}>
                    {desc}
                </p>
            </button>
        </div>
    );
}