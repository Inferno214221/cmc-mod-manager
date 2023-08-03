// General
function openDir(dir) {
    this.api.send("openDir", dir);
}

this.api.receive("throwError", (error) => {
    alert("An Error Occured: " + error);
});

// Characters
function getCharacterList() {
    this.api.send("getCharacterList");
}

this.api.receive("from_getCharacterList", (data) => {
    listCharacters(data);
});

function listCharacters(characters) {
    let output = "";
    for (let character in characters) {
        output += 
        "<tr id=\"" + character + "\">\n\
            <td class=\"mug\"><image src=\"../../cmc/gfx/mugs/" + characters[character].name + ".png\" draggable=\"false\"/></td>\n\
            <td>" + characters[character].displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"removeCharacter('" + character + "')\">Remove</button></td>\n\
            <td><button type=\"button\" onclick=\"extractCharacter('" + character + "')\">Extract</button></td>\n\
        </tr>\n"
    };
    characterTable.innerHTML = output;
}

function installCharacterDir() {
    this.api.send("installCharacterDir", filteredInstall.checked);
}

function installCharacterArch() {
    this.api.send("installCharacterArch", filteredInstall.checked);
}

this.api.receive("from_installCharacter", (data) => {
    alert("Character installed successfully.");
    getCharacterList();
});

function removeCharacter(id) {
    //
}

this.api.receive("from_removeCharacter", (data) => {
    //
});

function extractCharacter(id) {
    //
}

this.api.receive("from_extractCharacter", (data) => {
    //
});

// On Page Load
var version;
getCharacterList();
/*

// On Page Load
this.api.send("getInstalledCharacterList");

this.api.receive("fromGetInstalledCharacterList", (data) => {
    version = data.version;
    if (version != "CMC+ v8.exe") {
        cmc8.innerHTML = "";
    }
    extractionList(data.basegame);
    listCharacters(data.installed);
});

function installCharacter() {
    this.api.send("installCharacter", (version == "CMC+ v8.exe" && convertFormat.checked));
}

function installCharacterZip() {
    this.api.send("installCharacterZip", (version == "CMC+ v8.exe" && convertFormat.checked));
}

this.api.receive("fromInstallCharacter", (installed) => {
    listCharacters(installed);
});

function removeCharacter(Character) {
    this.api.send("removeCharacter", Character);
}

this.api.receive("fromRemoveCharacter", (installed) => {
    listCharacters(installed);
});

function increaseMergePriority(Character) {
    this.api.send("increaseMergePriority", Character);
}

this.api.receive("fromIncreaseMergePriority", (installed) => {
    listCharacters(installed);
});

function listCharacters(installed) {
    let output = "";
    installed.priority.forEach((Character) => {
        output += 
        "<tr id=\"" + Character + "\">\n\
            <td class=\"mug\"><image src=\"../../Characters/" + Character + "/gfx/mugs/" + Character + ".png\" /></td>\n\
            <td>" + installed.Characters[Character].displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"removeCharacter('" + Character + "')\">Remove</button></td>\n\
            <td><button type=\"button\" onclick=\"openCharacterFolder('" + Character + "')\">Open Directory</button></td>\n\
            <td><button type=\"button\" onclick=\"increaseMergePriority('" + Character + "')\">Increase Merge Priority</button></td>\n\
        </tr>\n"
    });
    CharacterTable.innerHTML = output;
}

function extractionList(basegame) {
    let output = "";
    basegame.forEach((Character) => {
        output += "<option value=\"" + Character + "\">" + Character + "</option>\n"
    });
    extractCharacterSelect.innerHTML = output;
}

function extractCharacter() {
    this.api.send("extractCharacter", {
        Character: extractCharacterSelect.value,
        deleteExtraction: deleteExtraction.checked,
    });
}

this.api.receive("fromExtractCharacter", () => {
    alert("Character sucessfully extracted!");
});

function openCharacterFolder(Character) {
    this.api.send("openCharacterFolder", Character);
}

function inputFocused(element) {
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

function openFolder(directory) {
    this.api.send("openFolder", directory);
}*/