import { Dispatch, SetStateAction, useState, useEffect } from "react";
import "./downloads.css";
import { Download } from "../../interfaces";

export async function AllowTabSwitchDownloads(): Promise<boolean> {
    return true;//TODO:
}

export function TabDownloads(): JSX.Element {
    const [downloads, setDownloads]:
    [Download[], Dispatch<SetStateAction<Download[]>>]
    = useState([]);

    async function getDownloads(): Promise<void> {
        setDownloads(await api.getDownloads());
    }

    useEffect(() => {
        getDownloads();
    }, []);

    return (
        <section>
            <div id={"setup-div"}>
                E
            </div>
            <div id={"downloads-div"}>
                {downloads.map((download: Download) =>
                    <div>
                        <div>
                            <img src={download.image}/>
                        </div>
                        <div>
                            <span>{download.modType}</span>
                        </div>
                        <div>
                            <span>{download.fileSize}</span>
                        </div>
                        <div>
                            <span>{download.state}</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}