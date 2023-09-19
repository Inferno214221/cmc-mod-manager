// General
function openDir(dir) {
    this.api.send("openDir", dir);
}

this.api.receive("throwError", (error) => {
    alert("An Error Occured: " + error);
});

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
    listCharacters(data.characters, data.cmcDir, data.random);
});

function listCharacters(characters, cmcDir, random) {
    let output = "<tr><th>Image</th><th>Name</th><th>Extract</th><th>Remove</th><th>Selectable Via Random</th></tr>";
    sorted = sortCharacters(characters, sortingType.value);
    if (reverseSort.checked) {
        sorted.reverse();
    }
    sorted.forEach((character, index, array) => {
        character.excluded = (random.indexOf(character.name) == -1);
        array[index] = character;
    });
    for (let character of sorted) {
        console.log(character);
        output += 
        "<tr id=\"" + character.number + "\">\n\
            <td class=\"mug\"><image src=\"" + cmcDir + "/gfx/mugs/" + character.name + ".png\" draggable=\"false\"/></td>\n\
            <td>" + character.displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"extractCharacter('" + character.number + "')\">Extract</button></td>\n\
            <td><button type=\"button\" onclick=\"removeCharacter('" + character.number + "')\">Remove</button></td>\n\
            <td><input type=\"checkbox\" name=\"" + character.name + "\"" + (character.excluded ? " checked" : "") + " onclick=\"toggleRandomCharacter(this, '" + character.name + "');\"></td>\n\
        </tr>\n"
        //<label for=\"" + character.number + "\">Random Selection</label></td>\n\
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

// On Page Load
var characters;
getCharacterList();