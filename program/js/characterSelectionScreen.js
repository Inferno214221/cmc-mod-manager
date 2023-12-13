// General
this.api.send("throwGameDir");
this.api.receive("from_throwGameDir", (error) => {
    alert("Please select your CMC+ directory first!");
    window.location = "../../index.html";
});

function openDir(dir) {
    this.api.send("openDir", dir);
}

function inputFocused(element) {
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

// Character Selection Screen
function getPages() {
    this.api.send("getPages");
}

this.api.receive("from_getPages", (data) => {
    pages = data;
    writePages();
    currentPage = pages[0];
    getCSS(currentPage);
});

function getCSS(page) {
    if (typeof page == "string") {
        page = pages.filter((e) => e.path == page)[0];
    }
    currentPage = page;
    this.api.send("getCSS", page.path);
    writePages();
}

function writePages() {
    let output = "";
    pages.forEach((page) => {
        output += "<button type=\"button\" onclick=\"getCSS('" + page.path + "')\"" + (page == currentPage ? "class=\"activePage\"" : "class=\"inactivePage\"") + ">" + page.name + "</button>";
    });
    pagesContainer.innerHTML = output;
}

this.api.receive("from_getCSS", (data) => {
    css = data.css;
    characters = data.characters;
    cmcDir = data.cmcDir;
    characters[9998] = {
        name: "random",
        displayName: "?",
        series: null,
    };
    console.log(data.css, data.characters);
    makeTables();
});

function writeCSS() {
    makeTables();
    this.api.send("writeCSS", {
        css: css,
        page: currentPage,
    });
}

function makeTables() {
    let maxY = css.length;
    let maxX = css[0].length;
    let output = "<tr>\n\
        <th class=\"cssSquare\"></th>\n";
    for(let i = 0; i < maxX; i++) {
        output += "<th class=\"cssSquare\">" + (i + 1) + "</th>\n";
    }
    output += "\
<td class=\"cssSquare hoverText\" rowspan=\"" + (maxY + 1) + "\">\n\
    <button type=\"button\" onclick=\"removeColumn()\" class=\"modColumn\">\n\
        <span class=\"matIcon\">remove</span>\n\
    </button>\n\
    <div class=\"uiTooltip columnTooltip\">\n\
        <span>Remove Column</span>\n\
    </div>\n\
</td>\n\
<td class=\"cssSquare hoverText\" rowspan=\"" + (maxY + 1) + "\">\n\
    <button type=\"button\" onclick=\"addColumn()\" class=\"modColumn\">\n\
        <span class=\"matIcon\">add</span>\n\
    </button>\n\
    <div class=\"uiTooltip columnTooltip\">\n\
        <span>Add Column</span>\n\
    </div>\n\
</td>\n\
</tr>\n";

    hidden = Object.assign({}, characters);
    for (let y = 0; y < maxY; y++) {
        output += "<tr>\n<th class=\"cssSquare\">"+ (y + 1) + "</th>\n";
        for (let x = 0; x < maxX; x++) {
            let character;
            let number = parseInt(css[y][x]);
            character = characters[number - 1];
            delete hidden[number - 1];
            if (character === undefined) {
                //NOTE: resets all css values not in the list of characters
                output += "<td class=\"cssSquare\" id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"false\" ondragover=\"event.preventDefault();\" ondrop=\"onDropOnCSS(event);\"><image class=\"icon\" src=\"../images/empty.png\" alt=\" \" /></td>";
                css[y][x] = "0000";
            } else {
                output += "\
<td class=\"cssSquare hoverText\" id=\"" + number + "\">\n\
    <div id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"true\" ondragover=\"event.preventDefault();\" ondragstart=\"onDragStartCSS(event);\" ondrop=\"onDropOnCSS(event);\">\n\
        <image draggable=\"false\" class=\"icon\" src=\"" + cmcDir + "/gfx/mugs/" + characters[number - 1].name + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\" \" />\n\
        <div class=\"cssName\">" + characters[number - 1].displayName + "</div>\n\
    </div>\n\
    <div class=\"cssTooltip\" draggable=\"false\">\n\
        <span>" + characters[number - 1].displayName + "</span>\n\
    </div>\n\
</td>";
            }
        }
        output += "</tr>\n";
    }
    output += "\
<tr>\n\
    <td class=\"cssSquare hoverText\" colspan=\"" + (maxX + 1) + "\">\
        <button type=\"button\" onclick=\"removeRow()\" class=\"modRow\">\n\
            <span class=\"matIcon\">remove</span>\n\
        </button>\n\
        <div class=\"uiTooltip rowTooltip\">\n\
            <span>Remove Row</span>\n\
        </div>\n\
    </td>\n\
</tr>\n\
<tr>\n\
    <td class=\"cssSquare hoverText\" colspan=\"" + (maxX + 1) + "\">\
        <button type=\"button\" onclick=\"addRow()\" class=\"modRow\">\n\
            <span class=\"matIcon\">add</span>\n\
        </button>\n\
        <div class=\"uiTooltip rowTooltip\">\n\
            <span>Add Row</span>\n\
        </div>\n\
    </td>\n\
</tr>";
    characterSelectTable.innerHTML = output;

    output = "";
    sorted = sortCharacters((showAll.checked ? characters : hidden), sortingType.value, characterSearch.value.toLowerCase());
    if (reverseSort.checked) {
        sorted.reverse();
    }

    output += "<tr draggable=\"false\">\n"
    for (let character of sorted) {
        output += 
        "<td class=\"hoverText hiddenCharacter\">\n\
            <div draggable=\"true\" ondragstart=\"onDragStartHidden(event);\" id=\"" + character.number + "\" class=\"mug\">\n\
                <image draggable=\"false\" class=\"mugIcon\" src=\"" + cmcDir + "/gfx/mugs/" + character.name + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\"\" />\n\
                <div class=\"hiddenName\">" + character.displayName + "</div>\n\
            </div>\n\
            <div class=\"hiddenCharactersTooltip\" draggable=\"false\">\n\
                <span>" + character.displayName + "</span>\n\
            </div>\n\
        </td>\n";
    }
    output += "</tr>";
    hiddenCharactersTable.innerHTML = output;

    // let series = [];
    // for (let character of characters) {
    //     if (character != undefined && !series.includes(character.series)) {
    //         series.push(character.series);
    //     }
    // }
    // output = "";
    // series.forEach((s) => {
    //     output += "<option value=\"" + s + "\">" + s + "</option>'\n";
    // });
    // seriesSelect.innerHTML = output;
}

function sortCharacters(characters, sortType, search) {
    let charactersSorted = [];
    if (search == "") {
        for (let character in characters) {
            charactersSorted.push({
                number: parseInt(character) + 1,
                name: characters[character].name,
                displayName: characters[character].displayName,
                series: characters[character].series,
            });
        }
    } else {
        for (let character in characters) {
            if (characters[character].displayName.toLowerCase().includes(search)) {
                charactersSorted.push({
                    number: parseInt(character) + 1,
                    name: characters[character].name,
                    displayName: characters[character].displayName,
                    series: characters[character].series,
                });
            }
        }
    }
    let sorted = charactersSorted.toSorted((a, b) => (a[sortType] > b[sortType] ? 1 : -1));
    return sorted;
}

function removeCharacter(x, y) {
    let number = parseInt(css[y][x]);
    if (number === "0000") {
        return;
    }
    let character;
    character = characters[number - 1];
    if (character == undefined) {
        return;
    }
    // hidden[number - 1] = character;
    css[y][x] = "0000";
    writeCSS();
    return number;
}

function addCharacter(characterNumber, x, y) {
    let replaceNumber = css[y][x];
    if (replaceNumber !== "0000") {
        return;
    }
    css[y][x] = ('0000' + characterNumber).slice(-4);
    // delete hidden[characterNumber - 1];
    makeTables();
    writeCSS();
}

// function getCSSPage(offset) {
//     let index = pages.indexOf(currentPage) + offset;
//     if (index < 0) index = pages.length - 1;
//     if (index > pages.length - 1) index = 0;
//     currentPage = pages[index];
//     CSSPageName.value = currentPage.replace(".txt", "");
//     getCSS(currentPage);
// }

function resort() {
    inputBlurred("sortingType");
    getCSS(currentPage);
}

function onDragStartCSS(ev) {
    let coords = JSON.parse(ev.currentTarget.id);
    ev.dataTransfer.setData("css", JSON.stringify(coords));
}

function onDropOnHidden(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.getData("css") != "") {
        let received = JSON.parse(ev.dataTransfer.getData("css"));
        removeCharacter(received.x, received.y);
    }
}

function onDragStartHidden(ev) {
    ev.dataTransfer.setData("hidden", ev.target.id);
}

function onDropOnCSS(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.getData("hidden") != "") {
        let coords = JSON.parse(ev.currentTarget.id);
        removeCharacter(coords.x, coords.y);
        addCharacter(ev.dataTransfer.getData("hidden"), coords.x, coords.y);
    } else if (ev.dataTransfer.getData("css") != "") {
        let dropCoords = JSON.parse(ev.currentTarget.id);
        let drop = removeCharacter(dropCoords.x, dropCoords.y);
        let dragCoords = JSON.parse(ev.dataTransfer.getData("css"));
        let drag = removeCharacter(dragCoords.x, dragCoords.y);
        addCharacter(drop, dragCoords.x, dragCoords.y);
        addCharacter(drag, dropCoords.x, dropCoords.y);
    }
}

// function removeSeries() {
//     series = seriesSelect.value;
//     if (series == "") {
//         return;
//     }
//     for (let character = 0; character < characters.length; character++) {
//         if (characters[character] == undefined) {
//             continue;
//         }
//         if (characters[character].series == series) {
//             for (let y in css) {
//                 for (let x in css[y]) {
//                     if (('0000' + (character + 1)).slice(-4) == css[y][x]) {
//                         removeCharacter(x, y);
//                     }
//                 };
//             };
//         }
//     }
//     writeCSS();
// }

function addRow() {    
    let output = [];
    css[0].forEach((x) => {
        output.push("0000");
    });
    css.push(output);
    writeCSS();
}

function removeRow() {
    if (css.length < 2) return;
    css.pop();
    writeCSS();
}

function addColumn() {
    for (let y = 0; y < css.length; y++) {
        css[y].push("0000");
    }
    writeCSS();
}

function removeColumn() {
    if (css[0].length < 2) return;
    for (let y = 0; y < css.length; y++) {
        css[y].pop();
    }
    writeCSS();
}

// On Page Load
var css, characters, hidden, currentPage, pages, cmcDir;
getPages();