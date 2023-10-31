// General
function openDir(dir) {
    this.api.send("openDir", dir);
}

function inputFocused(element) {
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

// Porting
function checkSourceDir() {
    this.api.send("checkSourceDir");
}

this.api.receive("from_checkSourceDir", (dir) => {
    writeSourceLocation(dir);
});

function writeSourceLocation(dir) {
    sourceSpan.innerHTML = dir;
    if (dir != "None Selected") {
        getCharacterList();
    }
}

function openSourceDir() {
    if (sourceSpan.innerHTML != "None Selected") {
        this.api.send("openSourceDir");
    }
}

function selectSourceDir() {
    this.api.send("selectSourceDir");
}

this.api.receive("from_selectSourceDir", (dir) => {
    alert("Source directory set successfully.");
    writeSourceLocation(dir);
});

function getCharacterList() {
    this.api.send("getCharacterListSource");
}

this.api.receive("from_getCharacterListSource", (data) => {
    listCharacters(data.characters, data.sourceDir, data.installed);
});

function listCharacters(characters, sourceDir, installed) {
    let output = "<tr><th>Image</th><th>Name</th><th>Install</th></tr>";
    sorted = sortCharacters(characters, sortingType.value);
    if (reverseSort.checked) {
        sorted.reverse();
    }
    
    let installedCharacters = {};
    installed.forEach((character) => {
        installedCharacters[character.name] = character;
    });

    for (let character of sorted) {
        console.log(character);
        if (installedCharacters[character.name] != undefined) {}
        output += 
        "<tr id=\"" + character.number + "\">\n\
            <td class=\"mug\"><image src=\"" + sourceDir + "/gfx/mugs/" + character.name + ".png\" draggable=\"false\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" /></td>\n\
            <td>" + character.displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"extractCharacter('" + character.number + "')\">" + (installedCharacters[character.name] == undefined ? "Install" : "Update") + "</button></td>\n\
        </tr>\n";
    };
    characterTable.innerHTML = output;
}

function extractCharacter(id) {
    this.api.send("extractCharacterSource", id);
}

this.api.receive("from_extractCharacterSource", (data) => {
    this.api.send("installCharacterSource", {
        dir: data,
        filtered: filteredInstall.checked,
        // update: updateChars.checked,
    });
});

this.api.receive("from_installCharacter", (data) => {
    alert("Character " + (data ? "updated" : "installed") + " successfully.");
    getCharacterList();
});

function installAllChars() {
    if (sourceSpan.innerHTML == "None Selected") return;
    if(!confirm("All characters installed in the selected source directory will be installed or updated in the selected CMC directory (except for Master Hand and Fighting Sprite).\nAre you sure you want to continue?")) return;
    this.api.send("installAllCharsSource", {
        filtered: filteredInstall.checked,
        // update: updateChars.checked,
    });
}

this.api.receive("from_installAllCharsSource", () => {
    alert("All characters installed / updated.");
    getCharacterList();
});

function sortCharacters(characters, sortType) {
    let charactersSorted = [];
    for (let character in characters) {
        charactersSorted.push({
            number: parseInt(character) + 1,
            name: characters[character].name,
            displayName: characters[character].displayName,
            sortName: characters[character].displayName.toLowerCase(),
            series: characters[character].series,
        });
    }
    let sorted = charactersSorted.toSorted((a, b) => (a[sortType] > b[sortType] ? 1 : -1));
    return sorted;
}

function resort() {
    inputBlurred('sortingType');
    getCharacterList();
}

// On Page Load
checkSourceDir();
var characters;