// On Page Load
var version;
this.api.send("getInstalledCharList");

this.api.receive("fromGetInstalledCharList", (data) => {
    version = data.version;
    if (version != "CMC+ v8.exe") {
        cmc8.innerHTML = "";
    }
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

function openCharacterFolder(character) {
    this.api.send("openCharacterFolder", character);
}