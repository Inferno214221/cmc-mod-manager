import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CMCMM from "../../../assets/icon.svg";
import PFP from "../../../assets/pfp.png";
import GH from "../../../assets/github.png";
import GB from "../../../assets/gb.png";
import BMC from "../../../assets/buy-me-a-coffee.png"
import IconButton from "../../icon-buttons/icon-button";
import {
    CHARACTERS,
    CHARACTER_SELECTION_SCREEN,
    STAGES,
    STAGE_SELECTION_SCREEN,
    Tab,
    switchTabs
} from "../../app/app";
import appStyles from "../../app/app.css";
import homeStyles from "./home.css";
const styles: typeof import("../../app/app.css") & typeof import("./home.css") =
    Object.assign({}, appStyles, homeStyles);

import { translations } from "../../../global/translations";
import { Language } from "../../../global/global";
const { message, tryMessage }: ReturnType<typeof translations> = translations(global.language);

export async function AllowTabSwitchHome(): Promise<boolean> {
    if (await api.isValidGameDir()) {
        return true;
    }
    api.alert("noDirSelected");
    return false;
}

export function TabHome(): JSX.Element {
    api.on("updateCharacterPages", () => null);
    api.on("updateStagePages", () => null);
    
    return (
        <section>
            <div id={styles.aboutDiv} className={styles.verticalOuterDiv}>
                <div className={styles.verticalInnerDiv}>
                    <div className={styles.center + " " + styles.marginVertical}>
                        <img src={CMCMM} id={styles.cmcmmIcon} draggable={false}/>
                        <h1>CMC Mod Manager</h1>
                        <h3>(v3.2.0)</h3>
                    </div>
                    <div className={styles.center} id={styles.byDiv}>
                        <h2>{message("other.by")}</h2>
                    </div>
                    <div className={styles.center + " " + styles.marginVertical}>
                        <img src={PFP} id={styles.pfp} draggable={false}/>
                        <h2>Inferno214221</h2>
                    </div>
                    <div className={styles.center + " " + styles.marginVertical}>
                        <ExternalLinkImage
                            icon={CMCMM}
                            tooltip={message("tooltip.site.homepage")}
                            location={"https://inferno214221.com/cmc-mod-manager"}
                            id={"homepage"}
                        />
                        <ExternalLinkImage
                            icon={GH}
                            tooltip={message("tooltip.site.github")}
                            location={"https://github.com/Inferno214221/cmc-mod-manager"}
                            id={"gh"}
                        />
                        <ExternalLinkImage
                            icon={GB}
                            tooltip={message("tooltip.site.gamebanana")}
                            location={"https://gamebanana.com/tools/14136"}
                            id={"gb"}
                        />
                        <ExternalLinkImage
                            icon={BMC}
                            tooltip={message("tooltip.site.buyMeACoffee")}
                            location={"https://buymeacoffee.com/inferno214221"}
                            id={"bmc"}
                        />
                    </div>
                    <div className={styles.center}>
                        <button onClick={() => api.alert("licenseNotice")}>
                            {message("ui.showLicense")}
                        </button>
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
                    <div className={styles.center}>
                        <TabButton tab={CHARACTERS}/>
                        <TabButton tab={CHARACTER_SELECTION_SCREEN}/>
                        <TabButton tab={STAGES}/>
                        <TabButton tab={STAGE_SELECTION_SCREEN}/>
                    </div>
                </div>
            </div>
            <LanguageSelect/>
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
    [string | null, Dispatch<SetStateAction<string | null>>]
    = useState(null);

    async function updateGameDir(): Promise<void> {
        setCmcDir(await api.getGameDir());
    }

    useEffect(() => {
        updateGameDir();
    }, []);
    
    return (
        <>
            <div className={styles.center}>
                <span>{message("ui.currentGameDir")}</span>
                <input
                    type={"text"}
                    readOnly={true}
                    id={styles.dirOutput}
                    value={cmcDir ?? message("tooltip.gameDir.noneSelected")}
                />
            </div>
            <div className={styles.center + " " + styles.marginVertical}>
                <IconButton
                    icon={"policy"}
                    iconSize={"50px"}
                    tooltip={message("tooltip.gameDir.change")}
                    onClick={async () => {
                        await api.selectGameDir();
                        updateGameDir();
                    }}
                />
                <IconButton
                    icon={"folder"}
                    iconSize={"50px"}
                    tooltip={message("tooltip.gameDir.open")}
                    onClick={async () => {
                        api.openDir(await api.getGameDir());
                    }}
                />
                <IconButton
                    icon={"play_circle"}
                    iconSize={"50px"}
                    tooltip={message("tooltip.gameDir.run")}
                    onClick={() => {
                        api.runGame();
                    }}
                />
            </div>
        </>
    );
}

function TabButton({ tab }: { tab: Tab }): JSX.Element {
    return (
        <div className={styles.tabButtonWrapper}>
            <button className={styles.tabButton} onClick={() => {switchTabs(tab)}}>
                <span className={styles.matIcon + " " + styles.tabButtonIcon}>
                    {tab.icon}
                </span>
                <p className={styles.tabButtonTitle}>
                    {tryMessage("ui.tabs." + tab.name + ".title")}
                </p>
                <p className={styles.tabButtonDesc}>
                    {tryMessage("ui.tabs." + tab.name + ".desc")}
                </p>
            </button>
        </div>
    );
}

function LanguageSelect(): JSX.Element {
    return (
        <div id={styles.languageSelect}>
            <select onInput={async (event: any) => {
                const appData: AppData = await api.readAppData();
                if (appData.config.language != event.target.value) {
                    appData.config.language = event.target.value;
                    await api.writeAppData(appData);
                }
                await api.alert("languageUpdated");
            }}>
                {Object.values(Language).map((lang: Language) =>
                    <option value={lang} key={lang} selected={global.language == lang}>
                        {translations(lang).message("other.languageName")}
                    </option>
                )}
            </select>
        </div>
    );
}