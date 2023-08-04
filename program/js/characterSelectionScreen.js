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

// Character Selection Screen

function getPages() {
    this.api.send("getPages");
}

this.api.receive("fromGetPages", (data) => {
    pages = data;
});

function getCSS(page) {
    this.api.send("getCSS", page);
}

this.api.receive("fromGetCSS", (data) => {
    css = data.css;
    characters = data.characters;
    console.log(data.css, data.characters);
    makeTables(css, characters);
});

function makeTables(css, characters) {
    let maxY = css.length;
    let maxX = css[0].length;
    let output = "<tr>\n\
        <th class=\"cssSquare\"></th>\n";
    for(let i = 0; i < maxX; i++) {
        output += "<th class=\"cssSquare\">" + (i + 1) + "</th>\n";
    }
    output += "</tr>\n";

    hidden = Object.assign({}, characters);
    for (let y = 0; y < maxY; y++) {
        output += "<tr>\n<th class=\"cssSquare\">"+ (y + 1) + "</th>\n";
        for (let x = 0; x < maxX; x++) {
            let character;
            let number = parseInt(css[y][x]);
            character = characters[number - 1];
            delete hidden[number - 1];
            if (number == 9999) {
                output += "\
<td class=\"cssSquare hoverText\" id=\"9999\">\n\
    <div id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"true\" ondragover=\"event.preventDefault();\" ondragstart=\"onDragStartCSS(event);\" ondrop=\"onDropOnCSS(event);\">\n\
        <image draggable=\"false\" class=\"icon\" src=\"../../cmc/gfx/mugs/random.png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\" \" />\n\
        <div class=\"cssName\">?</div>\n\
    </div>\n\
    <span class=\"tooltipText\">?</span>\n\
</td>";
            } else if (character === undefined) {
                //NOTE: resets all css values not in the list of characters
                output += "<td class=\"cssSquare\" id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"false\" ondragover=\"event.preventDefault();\" ondrop=\"onDropOnCSS(event);\"><image class=\"icon\" src=\"../images/empty.png\" alt=\" \" /></td>";
                css[y][x] = "0000";
            } else {
                output += "\
<td class=\"cssSquare hoverText\" id=\"" + number + "\">\n\
    <div id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"true\" ondragover=\"event.preventDefault();\" ondragstart=\"onDragStartCSS(event);\" ondrop=\"onDropOnCSS(event);\">\n\
        <image draggable=\"false\" class=\"icon\" src=\"../../cmc/gfx/mugs/" + characters[number - 1].name + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\" \" />\n\
        <div class=\"cssName\">" + characters[number - 1].displayName + "</div>\n\
    </div>\n\
    <span class=\"tooltipText\">" + characters[number - 1].displayName + "</span>\n\
</td>";
            }
        }
        output += "</tr>\n";
    }
    characterSelectTable.innerHTML = output;

    output = "";
    sorted = sortCharacters((showAll.checked ? characters : hidden), sortingType.value);
    if (reverseSort.checked) {
        sorted.reverse();
    }

    output += "<tr draggable=\"false\">\n"
    for (let character of sorted) {
        output += 
        "<td class=\"hoverText hiddenCharacter\">\n\
            <div draggable=\"true\" ondragstart=\"onDragStartHidden(event);\" id=\"" + character.name + "\" class=\"mug\">\n\
                <image draggable=\"false\" class=\"mugIcon\" src=\"../../cmc/gfx/mugs/" + character.name + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\"\" />\n\
                <div class=\"hiddenName\">" + character.displayName + "</div>\n\
            </div>\n\
            <span class=\"tooltipText\" draggable=\"false\">" + character.displayName + "</span>\n\
        </td>\n";
    }
    output += "</tr>";
    hiddenCharactersTable.innerHTML = output;

    let series = [];
    for (let character of Object.keys(allChars)) {
        if (!series.includes(allChars[character].series)) {
            series.push(allChars[character].series);
        }
    }
}

function sortCharacters(characters, sortType) {
    let charactersSorted = [];
    for (let character in characters) {
        charactersSorted.push({
            number: parseInt(character) + 1,
            name: characters[character].name,
            displayName: characters[character].displayName,
            series: characters[character].series,
        });
    }
    console.log(charactersSorted);
    let sorted = charactersSorted.toSorted((a, b) => (a[sortType] > b[sortType] ? 1 : -1));
    return sorted;
}

function getCSSPage(offset) {
    let index = pages.indexOf(currentPage) + offset;
    if (index < 0) index = pages.length - 1;
    if (index > pages.length - 1) index = 0;
    currentPage = pages[index];
    CSSPageName.value = currentPage.replace(".txt", "");
    getCSS(currentPage);
}

function resort() {
    inputBlurred('sortingType');
    getCSS(currentPage);
}

// function makeTables(css, allChars) {
//     let maxX = css[currentPage][0].length;
//     let maxY = css[currentPage].length;

//     let output = "<tr>\n\
//         <th class=\"cssSquare\"></th>\n";
//     for(let i = 0; i < maxX; i++) {
//         output += "<th class=\"cssSquare\">" + (i + 1) + "</th>\n";
//     }
//     output += "</tr>\n";

//     hidden = Object.assign({}, allChars);
//     for (let y = 0; y < maxY; y++) {
//         output += "<tr>\n<th class=\"cssSquare\">"+ (y + 1) + "</th>\n";
//         for (let x = 0; x < maxX; x++) {
//             let character;
//             for (let e of allChars) {
//                 if (e + 1 == css[currentPage][y][x]) {
//                     character = e;
//                     delete hidden[e];
//                     break;
//                 }
//             }
//             if (character === undefined) {
//                 //NOTE: resets all css values not in the list of characters
//                 output += "<td class=\"cssSquare\" id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"false\" ondragover=\"event.preventDefault();\" ondrop=\"onDropOnCSS(event);\"><image class=\"icon\" src=\"../images/empty.png\" alt=\" \" /></td>";
//                 css[currentPage][y][x] = "0000";
//             } else {
//                 output += "\
// <td class=\"cssSquare hoverText\" id=\"" + character + "\">\n\
//     <div id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"true\" ondragover=\"event.preventDefault();\" ondragstart=\"onDragStartCSS(event);\" ondrop=\"onDropOnCSS(event);\">\n\
//         <image draggable=\"false\" class=\"icon\" src=\"../../cmc/gfx/mugs/" + allChars[character].name + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\" \" />\n\
//         <div class=\"cssName\">" + allChars[character].displayName + "</div>\n\
//     </div>\n\
//     <span class=\"tooltipText\">" + allChars[character].displayName + "</span>\n\
// </td>";
//             }
//         }
//         output += "</tr>\n";
//     }
//     characterSelectTable.innerHTML = output;
    
//     output = "";
//     sorted = sortCharacters((showAll.checked ? allChars : hidden), sortingType.value);
//     if (reverseSort.checked) {
//         sorted.reverse();
//     }

//     output += "<tr draggable=\"false\">\n"
//     for (let character of sorted) {
//         character = character.name
//         output += 
//         "<td class=\"hoverText hiddenCharacter\">\n\
//             <div draggable=\"true\" ondragstart=\"onDragStartHidden(event);\" id=\"" + character + "\" class=\"mug\">\n\
//                 <image draggable=\"false\" class=\"mugIcon\" src=\"../../cmc/gfx/mugs/" + allChars[character].name + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\"\" />\n\
//                 <div class=\"hiddenName\">" + allChars[character].displayName + "</div>\n\
//             </div>\n\
//             <span class=\"tooltipText\" draggable=\"false\">" + allChars[character].displayName + "</span>\n\
//         </td>\n";
//         //  <button class=\"addButton\" type=\"button\" onclick=\"addCharacter('" + character + "')\">Add</button>\n\
//     }
//     output += "</tr>";
//     hiddenCharactersTable.innerHTML = output;

//     let seriess = [];
//     for (let character of Object.keys(allChars)) {
//         if (!seriess.includes(allChars[character].series)) {
//             seriess.push(allChars[character].series);
//         }
//     }

//     seriess.sort((a, b) => (a > b ? 1 : -1));
//     output = "";
//     for (series of seriess) {
//         output += "<option value=\"" + series + "\">" + series + "</option>";
//     }
//     seriesSelect.innerHTML = output;

//     rowNumber.innerHTML = "Rows: " + maxY;
//     columnNumber.innerHTML = "Columns: " + maxX;
// }

// ////

// function findCSS(character) {
//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
//     let number = ('0000' + allChars[character].number).slice(-4);
//     let coords;

//     let maxX = css[currentPage][0].length;
//     let maxY = css[currentPage].length;
//     for (let y = 0; y < maxY; y++) {
//         for (let x = 0; x < maxX; x++) {
//             if (css[currentPage][y][x] == number) {
//                 coords = {
//                     x: x,
//                     y: y
//                 };
//                 break;
//             }
//         }
//     }
//     if (coords == undefined) {
//         return;//TODO: error
//     }
//     return coords;
// }

// function onDragStartCSS(ev) {
//     let coords = JSON.parse(ev.currentTarget.id);
//     ev.dataTransfer.setData("css", JSON.stringify(coords));
// }

// function onDropOnHidden(ev) {
//     ev.preventDefault();
//     if (ev.dataTransfer.getData("css") != "") {
//         let received = JSON.parse(ev.dataTransfer.getData("css"));
//         removeCharacter(received.x, received.y);
//     }
// }

// function onDragStartHidden(ev) {
//     ev.dataTransfer.setData("hidden", ev.target.id);
// }

// function onDropOnCSS(ev) {
//     ev.preventDefault();
//     if (ev.dataTransfer.getData("hidden") != "") {
//         let coords = JSON.parse(ev.currentTarget.id);
//         removeCharacter(coords.x, coords.y);
//         addCharacterE(ev.dataTransfer.getData("hidden"), coords.x, coords.y);
//     } else if (ev.dataTransfer.getData("css") != "") {
//         let dropCoords = JSON.parse(ev.currentTarget.id);
//         let drop = removeCharacter(dropCoords.x, dropCoords.y);
//         let dragCoords = JSON.parse(ev.dataTransfer.getData("css"));
//         let drag = removeCharacter(dragCoords.x, dragCoords.y);
//         addCharacterE(drop, dragCoords.x, dragCoords.y);
//         addCharacterE(drag, dropCoords.x, dropCoords.y);
//     }
// }

// function hideCharacter() {
//     yInput.value = parseInt(yInput.value);
//     xInput.value = parseInt(xInput.value);
//     if ((css[currentPage][yInput.value] == undefined) || (css[currentPage][yInput.value][xInput.value] == undefined)) {
//         return;//TODO: error
//     }
//     removeCharacter(xInput.value, yInput.value);
// }

// function removeCharacter(x, y) {
//     let characterNumber = css[currentPage][y][x];
//     if (characterNumber === "0000") {
//         return;//TODO: alert
//     }

//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
//     css[currentPage][y][x] = "0000";
//     let character;
//     for (let e of Object.keys(allChars)) {
//         if (allChars[e].number == characterNumber) {
//             character = e;
//             break;
//         }
//     }
//     if (character == undefined) {
//         return;//TODO: error
//     }
//     hidden[character] = allChars[character];
//     makeTables(css, allChars);
//     this.api.send("writeCSS", css);
//     return character;
// }

// function addCharacter(character) {
//     yInput.value = parseInt(yInput.value);
//     xInput.value = parseInt(xInput.value);
//     if ((css[currentPage][yInput.value] == undefined) || (css[currentPage][yInput.value][xInput.value] == undefined)) {
//         return;//TODO: error
//     }

//     addCharacterE(character, xInput.value, yInput.value);
// }

// function addCharacterE(character, x, y) {
//     let characterNumber = css[currentPage][y][x];
//     if (characterNumber !== "0000") {
//         return;//TODO: alert
//     }
//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
//     if (allChars[character] == undefined) {
//         return;//TODO: error
//     }
//     css[currentPage][y][x] = ('0000' + allChars[character].number).slice(-4);
//     delete hidden[character];
//     makeTables(css, allChars);
//     this.api.send("writeCSS", css);
// }

// function removeFranchise() {
//     if (franchiseSelect.value == "") {
//         return;//Doesn't really happen
//     }
//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
//     for (character of Object.keys(allChars)) {
//         // console.log(character, allChars[character]);
//         if (allChars[character].franchise == franchiseSelect.value) {
//             let maxX = css[currentPage][0].length;
//             let maxY = css[currentPage].length;

//             for (let y = 0; y < maxY; y++) {
//                 for (let x = 0; x < maxX; x++) {
//                     if (('0000' + allChars[character].number).slice(-4) == css[currentPage][y][x]) {
//                         let characterNumber = css[currentPage][y][x];
//                         css[currentPage][y][x] = "0000";
//                         let add;
//                         for (let e of Object.keys(allChars)) {
//                             if (allChars[e].number == characterNumber) {
//                                 add = e;
//                                 break;
//                             }
//                         }
//                         if (add == undefined) {
//                             return;//TODO: error
//                         }
//                         hidden[add] = allChars[add];
//                     }
//                 }
//             }
//         }
//     }
//     makeTables(css, allChars);
//     this.api.send("writeCSS", css);
// }

// function addRow() {
//     let maxX = css[currentPage][0].length;
//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);
    
//     let output = [];
//     for (let x = 0; x < maxX; x++) {
//         output.push("0000");
//     }
//     css[currentPage].push(output);

//     makeTables(css, allChars);
//     this.api.send("writeCSS", css);
// }

// function removeRow() {
//     if (css[currentPage].length < 2) return;
//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);

//     css[currentPage].pop();

//     makeTables(css, allChars);
//     this.api.send("writeCSS", css);
// }

// function addColumn() {
//     let maxY = css[currentPage].length;
//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);

//     for (let y = 0; y < maxY; y++) {
//         css[currentPage][y].push("0000");
//     }

//     makeTables(css, allChars);
//     this.api.send("writeCSS", css);
// }

// function removeColumn() {
//     if (css[currentPage][0].length < 2) return;
//     let maxY = css[currentPage].length;
//     let allChars = Object.assign({}, basegame.versions[version].builtin, basegame.cmc, installed.characters);

//     for (let y = 0; y < maxY; y++) {
//         css[currentPage][y].pop();
//     }

//     makeTables(css, allChars);
//     this.api.send("writeCSS", css);
// }

// On Page Load
var css, characters, hidden, currentPage, pages;
getPages();
currentPage = "css.txt";
CSSPageName.value = "css";
getCSS(currentPage);