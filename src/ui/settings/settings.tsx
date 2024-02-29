import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./settings.css";
import { Operation } from "../../interfaces";

export function TabSettings({
    setOperations
}: {
    setOperations: Dispatch<SetStateAction<Operation[]>>
}): JSX.Element {
    api.onInstallCharacter(() => null);
    api.onInstallStage(() => null);
    
    return (
        <section>
            <div id={"settings-div"}>
                <div className={"center"}>
                    <div className={"settings-group"}>
                        <h2>Character Managment</h2>
                        <p>E</p>
                        <h3>Include Alts As Characters (Toggle Button)</h3>
                        <p>E</p>
                    </div>
                    <hr/>
                    <div className={"settings-group"}>
                        <h2>GameBanana 1-Click Installation</h2>
                        <p>E</p>
                        <h3>Enable 1-Click Installation (Toggle Button)</h3>
                        <p>E</p>
                    </div>
                    <hr/>
                    <div className={"settings-group"}>
                        <h2>Debug Logs</h2>
                        <p>E</p>
                        <h3>Enable Debug Logs (Toggle Button)</h3>
                        <p>E</p>
                        <h3>Open Log File (Button)</h3>
                        <p>E</p>
                    </div>
                    <hr/>
                    <div className={"settings-group"}>
                        <h2>Unbinner</h2>
                        <p>
                            The 'CMC Unbinner' is a tool developed by SusImposter73 which can be
                            used to 'unbin' characters, stages or other files contained within CMC's
                            '.bin' files. Doing so can help to reduce loading times and storage size
                            (assuming that the '.bin' files are then deleted). The 'CMC Unbinner' is
                            not licensed under GNU GPLv3. Additionally, this tool is designed for
                            Windows so Linux users will need Wine installed to use it.
                        </p>
                        <h3>Enable Unbinner (Toggle Button)</h3>
                        <p>
                            Enabling the Unbinner will install the tool and allow CMC Mod Manager to
                            include 'unbinning' functions for characters and stages.
                        </p>
                        <h3>Unbin All Characters (Toggle Button)</h3>
                        <p>
                            E
                        </p>
                        {/* <h3>Unbin All Stages (Toggle Button)</h3>
                        <p>
                            E
                        </p> */}
                        <h3>Remove Unused Bins (Button)</h3>
                        <p>
                            E
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}