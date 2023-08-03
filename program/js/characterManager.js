this.api.receive("throwError", (error) => {
    alert("An Error Occured: " + error);
});

// On Page Load
var version;
this.api.send("getInstalledCharList");

this.api.receive("fromGetInstalledCharList", (data) => {
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

function removeCharacter(character) {
    this.api.send("removeCharacter", character);
}

this.api.receive("fromRemoveCharacter", (installed) => {
    listCharacters(installed);
});

function increaseMergePriority(character) {
    this.api.send("increaseMergePriority", character);
}

this.api.receive("fromIncreaseMergePriority", (installed) => {
    listCharacters(installed);
});

function listCharacters(installed) {
    let output = "";
    installed.priority.forEach((character) => {
        output += 
        "<tr id=\"" + character + "\">\n\
            <td class=\"mug\"><image src=\"../../characters/" + character + "/gfx/mugs/" + character + ".png\" /></td>\n\
            <td>" + installed.characters[character].displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"removeCharacter('" + character + "')\">Remove</button></td>\n\
            <td><button type=\"button\" onclick=\"openCharacterFolder('" + character + "')\">Open Directory</button></td>\n\
            <td><button type=\"button\" onclick=\"increaseMergePriority('" + character + "')\">Increase Merge Priority</button></td>\n\
        </tr>\n"
    });
    characterTable.innerHTML = output;
}

function extractionList(basegame) {
    let output = "";
    basegame.forEach((character) => {
        output += "<option value=\"" + character + "\">" + character + "</option>\n"
    });
    extractCharacterSelect.innerHTML = output;
}

function extractCharacter() {
    this.api.send("extractCharacter", {
        character: extractCharacterSelect.value,
        deleteExtraction: deleteExtraction.checked,
    });
}

this.api.receive("fromExtractCharacter", () => {
    alert("Character sucessfully extracted!");
});

function openCharacterFolder(character) {
    this.api.send("openCharacterFolder", character);
}

function inputFocused(element) {
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

function openFolder(directory) {
    this.api.send("openFolder", directory);
}