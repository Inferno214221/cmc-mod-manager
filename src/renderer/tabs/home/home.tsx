import { Dispatch, SetStateAction, useEffect, useState } from "react";
import cmcmm from "../../../assets/icon.png";
import pfp from "../../../assets/pfp.png";
import gh from "../../../assets/github.png";
import gb from "../../../assets/gb.png";
import IconButton from "../../icon-buttons/icon-button";
import {
    CHARACTERS,
    CHARACTER_SELECTION_SCREEN,
    // PORT_CHARACTERS,
    // SETTINGS,
    STAGES,
    STAGE_SELECTION_SCREEN,
    Tab,
    switchTabs
} from "../../app/app";
import appStyles from "../../app/app.css";
import homeStyles from "./home.css";
const styles: typeof import("../../app/app.css") & typeof import("./home.css") =
    Object.assign({}, appStyles, homeStyles);

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
    if (await api.isValidGameDir()) {
        return true;
    }
    api.alert({
        id: "allowTabSwitch",
        title: "CMC Mod Manager | No Directory Selected",
        body: "Please select your CMC+ directory before continuing."
    });
    return false;
}

export function TabHome(): JSX.Element {
    api.on("installCharacter", (): void => null);
    api.on("installStage", (): void => null);
    
    return (
        <section>
            <div id={styles.aboutDiv} className={styles.verticalOuterDiv}>
                <div className={styles.verticalInnerDiv}>
                    <div className={styles.center + " " + styles.marginVertical}>
                        <img src={cmcmm} id={styles.cmcmmIcon} draggable={false}/>
                        <h1>CMC Mod Manager</h1>
                        <h3>(v3.0.0-beta)</h3>
                    </div>
                    <div className={styles.center} id={styles.byDiv}>
                        <h2>By</h2>
                    </div>
                    <div className={styles.center + " " + styles.marginVertical}>
                        <img src={pfp} id={styles.pfp} draggable={false}/>
                        <h2>Inferno214221</h2>
                    </div>
                    <div className={styles.center + " " + styles.marginVertical}>
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
                    <div className={styles.center}>
                        <button onClick={() => {
                            api.alert({
                                id: "licenseNotice",
                                title: "CMC Mod Manager | License Notice",
                                body: LICENSE
                            });
                        }}>Show License (GNU GPLv3)</button>
                    </div>
                </div>
            </div>
            <hr/>
            <div id={styles.gameSelectDiv} className={styles.verticalOuterDiv}>
                <div className={styles.verticalInnerDiv}>
                    <GameDirectoryActions/>
                </div>
            </div>
            <hr/>
            <div id={styles.tabsDiv} className={styles.verticalOuterDiv}>
                <div className={styles.verticalInnerDiv}>
                    {/* <div id={styles.tabs-scrollable"}> */}
                    <div className={styles.center}>
                        <TabButton
                            tab={CHARACTERS}
                            desc={"Install, extract or delete characters from CMC+."}
                        />
                        <TabButton
                            tab={CHARACTER_SELECTION_SCREEN}
                            desc={"Modify CMC+'s character selection screen."}
                        />
                        {/* <TabButton
                            tab={PORT_CHARACTERS}
                            desc={"Install characters from another version of CMC+."}
                        /> */}
                        <TabButton
                            tab={STAGES}
                            desc={"Install, extract or delete stages from CMC+."}
                        />
                        <TabButton
                            tab={STAGE_SELECTION_SCREEN}
                            desc={"Modify CMC+'s stage selection screen."}
                        />
                        {/* <TabButton
                            tab={SETTINGS}
                            desc={"Configure the program and enable optional features."}
                        /> */}
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
        <div className={styles.externalWrapper + " " + styles.tooltipWrapper}>
            <button  className={styles.externalButton} onClick={() => {
                api.openExternal(location)
            }}>
                <img
                    src={icon}
                    id={styles[id]}
                    className={styles.externalImg}
                    draggable={false}
                />
            </button>
            <div className={styles.tooltip}>
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
            <div className={styles.center}>
                <span>Current CMC+ Directory: </span>
                <input
                    type={"text"}
                    readOnly={true}
                    id={styles.dirOutput}
                    value={cmcDir}
                    size={Math.ceil(cmcDir.length * 0.75)}
                />
            </div>
            <div className={styles.center + " " + styles.marginVertical}>
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
        <div className={styles.tabButtonWrapper}>
            <button className={styles.tabButton} onClick={() => {switchTabs(tab)}}>
                <span className={styles.matIcon + " " + styles.tabButtonIcon}>
                    {tab.icon}
                </span>
                <p className={styles.tabButtonTitle}>
                    {tab.displayName}
                </p>
                <p className={styles.tabButtonDesc}>
                    {desc}
                </p>
            </button>
        </div>
    );
}