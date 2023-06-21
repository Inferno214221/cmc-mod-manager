var css, basegame, installed, hidden, version;
getCSS();
updateCSSProfiles();

function sortHidden(hidden, sortType) {
    let hiddenArray = [];
    for (let character of Object.keys(hidden)) {
        hiddenArray.push({
            name: character,
            character: hidden[character]
        });
    }
    let sorted = hiddenArray.toSorted((a, b) => (a.character[sortType] > b.character[sortType] ? 1 : -1));
    return sorted;
}

function inputFocused(element) {
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

function findCSS(character) {
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    let number = ('0000' + allChars[character].number).slice(-4);
    let coords;

    let maxX = css[0].length;
    let maxY = css.length;
    for (let y = 0; y < maxY; y++) {
        for (let x = 0; x < maxX; x++) {
            if (css[y][x] == number) {
                coords = {
                    x: x,
                    y: y
                };
                break;
            }
        }
    }
    if (coords == undefined) {
        return;//TODO: error
    }
    return coords;
}

function onDragStartCSS(ev) {
    let coords = JSON.parse(ev.currentTarget.id);
    ev.dataTransfer.setData("css", JSON.stringify(coords));
}

function onDropOnHidden(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.getData("css") != "") {
        let received = JSON.parse(ev.dataTransfer.getData("css"));
        console.log(received);
        removeCharacter(received.x, received.y);
    }
}

function onDragStartHidden(ev) {
    ev.dataTransfer.setData("hidden", ev.target.id);
    console.log(ev);
}

function onDropOnCSS(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.getData("hidden") != "") {
        let coords = JSON.parse(ev.currentTarget.id);
        removeCharacter(coords.x, coords.y);
        addCharacterE(ev.dataTransfer.getData("hidden"), coords.x, coords.y);
    } else if (ev.dataTransfer.getData("css") != "") {
        let dropCoords = JSON.parse(ev.currentTarget.id);
        let drop = removeCharacter(dropCoords.x, dropCoords.y);
        let dragCoords = JSON.parse(ev.dataTransfer.getData("css"));
        let drag = removeCharacter(dragCoords.x, dragCoords.y);
        addCharacterE(drop, dragCoords.x, dragCoords.y);
        addCharacterE(drag, dropCoords.x, dropCoords.y);
    }
}

function saveCSS() {
    this.api.send("saveCSS", {
        name: CSSSaveName.value
    });
}

this.api.receive("fromSaveCSS", (data) => {
    alert("CSS saved succesfully");
});

function loadCSS() {
    this.api.send("loadCSS", {
        name: CSSLoadName.value
    });
}

this.api.receive("fromLoadCSS", (data) => {
    getCSS();
    alert("CSS loaded succesfully");
});

function updateCSSProfiles() {
    this.api.send("updateCSSProfiles");
}

this.api.receive("fromUpdateCSSProfiles", (profiles) => {
    let options = ""
    for (let profile of profiles) {
        profile = profile.slice(0, -4)
        options += '<option value="' + profile + '">' + profile + '</option>\n';
    }
    CSSLoadName.innerHTML = options;
});

function getCSS() {
    this.api.send("getCSS");
}

this.api.receive("errorGetCSS", () => { 
    mainSection.innerHTML = "<h1>Please merge mods before editing the character selection screen.</h1>";
});

this.api.receive("fromGetCSS", (data) => {
    css = data.css;
    // let maxY = css.length;
    for (let y in css) {
        if (css[y][0] == "") {
            // delete css[y];
            css.splice(y, 1);
        }
    }
    console.log(css);
    basegame = data.basegame;
    installed = data.installed;
    version = data.version;
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    console.log(allChars);
    makeTables(css, allChars);
});

function makeTables(css, allChars) {
    let maxX = css[0].length;
    let maxY = css.length;

    let output = "<tr>\n\
        <th class=\"cssSquare\"></th>\n";
    for(let i = 0; i < maxX; i++) {
        output += "<th class=\"cssSquare\">" + (i + 1) + "</th>\n";
    }
    output += "</tr>\n";

    hidden = Object.assign({}, allChars);
    for (let y = 0; y < maxY; y++) {
        output += "<tr>\n\
            <th class=\"cssSquare\">"+ (y + 1) + "</th>\n";
        for (let x = 0; x < maxX; x++) {
            if (css[y][x] === "0000") {
                output += "<td class=\"cssSquare\" id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"false\" ondragover=\"event.preventDefault();\" ondrop=\"onDropOnCSS(event);\"><image class=\"icon\" src=\"../images/empty.png\" alt=\" \" /></td>";
            } else {
                let character;
                for (let e of Object.keys(hidden)) {
                    if (hidden[e].number == css[y][x]) {
                        character = e;
                        delete hidden[e];//Only one copy of each
                        break;
                    }
                }
                if (character === undefined) {
                    break;//FIXME: display error
                }
                output += "<td id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"true\" ondragover=\"event.preventDefault();\" ondragstart=\"onDragStartCSS(event);\" ondrop=\"onDropOnCSS(event);\" class=\"cssSquare\" id=\"" + character + "\"><image draggable=\"false\" class=\"icon\" src=\"../../merged/gfx/mugs/" + character + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\" \" />\
                <div class=\"cssName\">" + allChars[character].displayName + "</div></td>";
            }
        }
        output += "</tr>\n";
    }
    characterSelectTable.innerHTML = output;
    
    output = "";
    sorted = sortHidden(hidden, sortingType.value);
    if (reverseSort.checked) {
        sorted.reverse();
    }

    output += "<tr>"
    for (let character of sorted) {
        character = character.name
        output += 
        "<td draggable=\"true\" ondragover=\"event.preventDefault();\" ondragstart=\"onDragStartHidden(event);\" ondrop=\"onDropOnHidden(event);\" id=\"" + character + "\">\n\
            <image draggable=\"false\" class=\"mugIcon\" src=\"../../merged/gfx/mugs/" + character + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\"\" />\n\
            <div class=\"hiddenName\">" + hidden[character].displayName + "</div>\n\
        </td>\n";
        //  <button class=\"addButton\" type=\"button\" onclick=\"addCharacter('" + character + "')\">Add</button>\n\
    }
    output += "</tr>";
    hiddenCharactersTable.innerHTML = output;


    allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    let franchises = [];
    for (let character of Object.keys(allChars)) {
        if (!franchises.includes(allChars[character].franchise)) {
            franchises.push(allChars[character].franchise);
        }
    }

    franchises.sort((a, b) => (a > b ? 1 : -1))
    output = "";
    for (franchise of franchises) {
        output += "<option value=\"" + franchise + "\">" + franchise + "</option>";
    }
    franchiseSelect.innerHTML = output;

    rowNumber.innerHTML = "Rows: " + maxY;
    columnNumber.innerHTML = "Columns: " + maxX;
}

function hideCharacter() {
    yInput.value = parseInt(yInput.value);
    xInput.value = parseInt(xInput.value);
    if ((css[yInput.value] == undefined) || (css[yInput.value][xInput.value] == undefined)) {
        return;//TODO: error
    }
    removeCharacter(xInput.value, yInput.value);
}

function removeCharacter(x, y) {
    let characterNumber = css[y][x];
    if (characterNumber === "0000") {
        return;//TODO: alert
    }

    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    css[y][x] = "0000";
    let character;
    for (let e of Object.keys(allChars)) {
        if (allChars[e].number == characterNumber) {
            character = e;
            break;
        }
    }
    if (character == undefined) {
        return;//TODO: error
    }
    hidden[character] = allChars[character];
    makeTables(css, allChars);
    this.api.send("writeCSS", css);
    return character;
}

function addCharacter(character) {
    yInput.value = parseInt(yInput.value);
    xInput.value = parseInt(xInput.value);
    if ((css[yInput.value] == undefined) || (css[yInput.value][xInput.value] == undefined)) {
        return;//TODO: error
    }

    addCharacterE(character, xInput.value, yInput.value);
}

function addCharacterE(character, x, y) {
    let characterNumber = css[y][x];
    if (characterNumber !== "0000") {
        return;//TODO: alert
    }
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    if (allChars[character] == undefined) {
        return;//TODO: error
    }
    css[y][x] = ('0000' + allChars[character].number).slice(-4);
    delete hidden[character];
    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function resort() {
    inputBlurred('sortingType');
    getCSS();
}

// function addFranchise() {
//     //REQUIRES empty css slots
//     if (franchiseSelect.value == "") {
//         return;//Doesn't really happen
//     }
//     for (character of Object.keys(hidden)) {
//         if (allChars[character].franchise == franchiseSelect.value) {
//             addCharacter(character);
//         }
//     }
// }

function removeFranchise() {
    if (franchiseSelect.value == "") {
        return;//Doesn't really happen
    }
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    for (character of Object.keys(allChars)) {
        // console.log(character, allChars[character]);
        if (allChars[character].franchise == franchiseSelect.value) {
            let maxX = css[0].length;
            let maxY = css.length;

            for (let y = 0; y < maxY; y++) {
                for (let x = 0; x < maxX; x++) {
                    if (('0000' + allChars[character].number).slice(-4) == css[y][x]) {
                        let characterNumber = css[y][x];
                        css[y][x] = "0000";
                        let add;
                        for (let e of Object.keys(allChars)) {
                            if (allChars[e].number == characterNumber) {
                                add = e;
                                break;
                            }
                        }
                        if (add == undefined) {
                            return;//TODO: error
                        }
                        hidden[add] = allChars[add];
                    }
                }
            }
        }
    }
    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function addRow() {
    let maxX = css[0].length;
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    
    let output = [];
    for (let x = 0; x < maxX; x++) {
        output.push("0000");
    }
    css.push(output);

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function removeRow() {
    if (css.length < 2) return;
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);

    css.pop();

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function addColumn() {
    let maxY = css.length;
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);

    for (let y = 0; y < maxY; y++) {
        css[y].push("0000");
    }

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function removeColumn() {
    if (css[0].length < 2) return;
    let maxY = css.length;
    let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);

    for (let y = 0; y < maxY; y++) {
        css[y].pop();
    }

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}