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
    this.api.send("removeCharacter", id);
    getCharacterList();
}

this.api.receive("from_removeCharacter", (data) => {
    alert("Character removed successfully.");
});

function extractCharacter(id) {
    this.api.send("extractCharacter", id);
    getCharacterList();
}

this.api.receive("from_extractCharacter", (data) => {
    alert("Character extracted successfully.");
});

// On Page Load
var version;
getCharacterList();