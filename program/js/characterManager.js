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

// Characters
function getCharacterList() {
    this.api.send("getCharacterList");
}

this.api.receive("from_getCharacterList", (data) => {
    listCharacters(data.characters, data.cmcDir, data.random, data.alts);
});

function listCharacters(characters, cmcDir, random, alts) {
    let output = "<tr><th>Image</th><th>Name</th><th>Extract</th><th>Remove</th><th>Random Selection</th><th>Base For Alt</th><th>Alt For Base</th><th>Alts</th></tr>";
    sorted = sortCharacters(characters, sortingType.value);
    if (reverseSort.checked) {
        sorted.reverse();
    }
    sorted.forEach((character, index, array) => {
        character.excluded = (random.indexOf(character.name) == -1);
        character.alts = alts.filter((alt) => alt.base == character.name && alt.alt != character.name);
        array[index] = character;
    });
    for (let character of sorted) {
        console.log(character);
        output += 
        "<tr id=\"" + character.number + "\">\n\
            <td class=\"mug\"><image src=\"" + cmcDir + "/gfx/mugs/" + character.name + ".png\" draggable=\"false\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" /></td>\n\
            <td>" + character.displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"extractCharacter('" + character.number + "')\">Extract</button></td>\n\
            <td><button type=\"button\" onclick=\"removeCharacter('" + character.number + "')\">Remove</button></td>\n\
            <td><input type=\"checkbox\"" + (character.excluded ? " checked" : "") + " onclick=\"toggleRandomCharacter(this, '" + character.name + "');\"></td>\n\
            <td><button type=\"button\" onclick=\"selectBase('" + character.name + "')\">Select As Base</button></td>\n\
            <td><button type=\"button\" onclick=\"selectAlt('" + character.name + "')\">Select As Alt</button></td>\n";
        character.alts.forEach((alt) => {
            output += "<td class=\"mug\"><image src=\"" + cmcDir + "/gfx/mugs/" + alt.alt + ".png\" draggable=\"false\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" /></td>\n\
            <td>" + alt.displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"removeAlt('" + character.name + "', '" + alt.alt + "')\">Remove</button></td>\n";
        });
        output += "</tr>\n";
        //<label for=\"" + character.number + "\">Random Selection</label></td>\n\
    };
    characterTable.innerHTML = output;
}

function installCharacterDir() {
    this.api.send("installCharacterDir", {
        filtered: filteredInstall.checked,
        update: updateChars.checked,
    });
}

function installCharacterArch() {
    this.api.send("installCharacterArch", {
        filtered: filteredInstall.checked,
        update: updateChars.checked,
    });
}

this.api.receive("from_installCharacter", (data) => {
    alert("Character " + (data ? "updated" : "installed") + " successfully.");
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

function toggleRandomCharacter(checkbox, characterName) {
    this.api.send("toggleRandomCharacter", {
        characterName: characterName,
        excluded: checkbox.checked,
    });
}

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

function selectBase(characterName) {
    selectedBase = characterName;
    addAlt();
}

function selectAlt(characterName) {
    selectedAlt = characterName;
    addAlt();
}

function addAlt() {
    if ((selectedBase == undefined || selectedAlt == undefined)) return;
    if (selectedBase == selectedAlt) return;
    console.log(selectedBase + selectedAlt);
    this.api.send("addAlt", {
        base: selectedBase,
        alt: selectedAlt,
    });
    getCharacterList();
    selectedBase = undefined;
    selectedAlt = undefined;
    // alert("Alt added successfully.");
}

function removeAlt(base, alt) {
    this.api.send("removeAlt", {
        base: base,
        alt: alt,
    });
    getCharacterList();
}

function removeAllChars() {
    if(!confirm("All characters except for Master Hand and Fighting Sprite will be removed.\nAre you sure you want to continue?")) return;
    this.api.send("removeAllChars");
}

this.api.receive("from_removeAllChars", () => {
    alert("Characters removed successfully.");
    getCharacterList();
});

// On Page Load
var characters, selectedBase, selectedAlt;
getCharacterList();