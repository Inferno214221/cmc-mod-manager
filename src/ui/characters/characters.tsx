import { useState } from "react";
import "./characters.css";

export default function TabCharacters() {
    return (
        <>
            <section>
                <div id={ "sort-div" }>
                    <div className={ "center" }>
                        <ToggleIconButton
                            defaultState={ false }
                            trueIcon={ "north" }
                            trueTooltip={ "Sorted Direction: Backwards" }
                            falseIcon={ "south" }
                            falseTooltip={ "Sorted Direction: Forwards" }
                            iconSize={ "30px" }
                        />
                    </div>
                </div>
                <div id={ "character-div" }>
                    <div className={ "center" }>
                        E
                    </div>
                </div>
                <hr/>
                <div id={ "button-div" }>
                    <div className={ "center" }>
                        <IconButton
                            icon={ "folder_shared" }
                            iconSize={ "50px" }
                            tooltip={ "Install Character From Directory" }
                            onClick={ () => {console.log("a")} }
                        />
                        <IconButton
                            icon={ "contact_page" }
                            iconSize={ "50px" }
                            tooltip={ "Install Character From Archive" }
                            onClick={ () => {console.log("a")} }
                        />
                        <IconButton
                            icon={ "source" }
                            iconSize={ "50px" }
                            tooltip={ "Open Extraction Directory" }
                            onClick={ () => {console.log("a")} }
                        />
                        <IconButton
                            icon={ "delete_sweep" }
                            iconSize={ "50px" }
                            tooltip={ "Remove All Characters" }
                            onClick={ () => {console.log("a")} }
                        />
                        {/* <vr/> */}
                        <ToggleIconButton
                            defaultState={ true }
                            trueIcon={ "filter_alt" }
                            trueTooltip={ "Installation: Only Necessary Files" }
                            falseIcon={ "filter_alt_off" }
                            falseTooltip={ "Installation: All Files" }
                            iconSize={ "50px" }
                        />
                        <ToggleIconButton
                            defaultState={ false }
                            trueIcon={ "sync" }
                            trueTooltip={ "Existing Characters: Update" }
                            falseIcon={ "sync_disabled" }
                            falseTooltip={ "Existing Characters: Abort" }
                            iconSize={ "50px" }
                        />
                    </div>
                </div>
            </section>
        </>
    );
}

function ToggleIconButton({
    defaultState,
    trueIcon,
    trueTooltip,
    falseIcon,
    falseTooltip,
    iconSize
}: {
    defaultState: boolean,
    trueIcon: string,
    trueTooltip: string,
    falseIcon: string,
    falseTooltip: string,
    iconSize: string
}): JSX.Element {
    const [checked, setChecked] = useState(defaultState);
    return (
        <div className={ "icon-button-wrapper" }>
            <button  className={ "icon-button" } onClick={ () => {
                setChecked((checked) => !checked)
            } }>
                <span className={ "mat-icon button-icon" } style={ { fontSize: iconSize } }>
                    {checked ? trueIcon : falseIcon}
                </span>
            </button>
            <div className={ "icon-button-tooltip" }>
                <span>{checked ? trueTooltip : falseTooltip}</span>
            </div>
        </div>
    );
}

function IconButton({
    icon,
    iconSize,
    tooltip,
    onClick
}: {
    icon: string,
    iconSize: string,
    tooltip: string,
    onClick: VoidFunction
}): JSX.Element {
    return (
        <div className={ "icon-button-wrapper" }>
            <button  className={ "icon-button" } onClick={ () => {onClick()} }>
                <span className={ "mat-icon button-icon" } style={ { fontSize: iconSize } }>
                    { icon }
                </span>
            </button>
            <div className={ "icon-button-tooltip" }>
                <span>{ tooltip }</span>
            </div>
        </div>
    );
}