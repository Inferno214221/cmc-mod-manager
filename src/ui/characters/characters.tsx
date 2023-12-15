import { useState } from 'react';
import './characters.css';

interface ToggleIconButtonInfo {
    defaultState: boolean,
    trueIcon: string,
    trueTooltip: string,
    falseIcon: string,
    falseTooltip: string,
    iconSize: string
}
const REVERSE_SORT: ToggleIconButtonInfo = {
    defaultState: false,
    trueIcon: 'north',
    trueTooltip: 'Sorted Direction: Backwards',
    falseIcon: 'south',
    falseTooltip: 'Sorted Direction: Forwards',
    iconSize: '30px'
};
const FILTERED_INSTALL: ToggleIconButtonInfo = {
    defaultState: true,
    trueIcon: 'filter_alt',
    trueTooltip: 'Installation: Only Necessary Files',
    falseIcon: 'filter_alt_off',
    falseTooltip: 'Installation: All Files',
    iconSize: '50px'
};
const UPDATE_CHARACTERS: ToggleIconButtonInfo = {
    defaultState: false,
    trueIcon: 'sync',
    trueTooltip: 'Existing Characters: Update',
    falseIcon: 'sync_disabled',
    falseTooltip: 'Existing Characters: Abort',
    iconSize: '50px'
};

interface IconButtonInfo {
    icon: string,
    iconSize: string,
    tooltip: string,
    function: VoidFunction
}
const INSTALL_CHAR_DIR: IconButtonInfo = {
    icon: 'folder',
    iconSize: '50px',
    tooltip: 'Install Character From Directory',
    function: () => {console.log('a')}
};
const INSTALL_CHAR_ARCH: IconButtonInfo = {
    icon: 'folder_zip',
    iconSize: '50px',
    tooltip: 'Install Character From Archive',
    function: () => {console.log('a')}
};
const OPEN_EXTRACTED_DIR: IconButtonInfo = {
    icon: 'drive_file_move',
    iconSize: '50px',
    tooltip: 'Open Extraction Directory',
    function: () => {console.log('a')}
};
const REMOVE_ALL_CHARS: IconButtonInfo = {
    icon: 'delete_sweep',
    iconSize: '50px',
    tooltip: 'Remove All Characters',
    function: () => {console.log('a')}
};

export default function TabCharacters() {
    return (
        <>
            <section>
                <div id={'sort-div'}>
                    <div className={'center'}>
                        <ToggleIconButton info={REVERSE_SORT}/>
                    </div>
                </div>
                <div id={'character-div'}>
                    <div className={'center'}>
                        E
                    </div>
                </div>
                <hr/>
                <div id={'button-div'}>
                    <div className={'center'}>
                        <IconButton info={INSTALL_CHAR_DIR}/>
                        <IconButton info={INSTALL_CHAR_ARCH}/>
                        <IconButton info={OPEN_EXTRACTED_DIR}/>
                        <IconButton info={REMOVE_ALL_CHARS}/>
                        {/* <vr/> */}
                        <ToggleIconButton info={FILTERED_INSTALL}/>
                        <ToggleIconButton info={UPDATE_CHARACTERS}/>
                    </div>
                </div>
            </section>
        </>
    );
}

function ToggleIconButton({info}: {info: ToggleIconButtonInfo}): JSX.Element {
    const [checked, setChecked] = useState(info.defaultState);
    return (
        <div className={'icon-button-wrapper'}>
            <button  className={'icon-button'} onClick={() => {setChecked((checked) => !checked)}}>
                <span className={'mat-icon button-icon'} style={{fontSize: info.iconSize}}>{checked ? info.trueIcon : info.falseIcon}</span>
            </button>
            <div className={'icon-button-tooltip'}>
                <span>{checked ? info.trueTooltip : info.falseTooltip}</span>
            </div>
        </div>
    );
}

function IconButton({info}: {info: IconButtonInfo}): JSX.Element {
    return (
        <div className={'icon-button-wrapper'}>
            <button  className={'icon-button'} onClick={() => {info.function()}}>
                <span className={'mat-icon button-icon'} style={{fontSize: info.iconSize}}>{info.icon}</span>
            </button>
            <div className={'icon-button-tooltip'}>
                <span>{info.tooltip}</span>
            </div>
        </div>
    );
}