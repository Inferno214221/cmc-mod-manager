var css, basegame, installed, hidden;
getCSS();

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
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);
    makeTables(css, allChars);
});

function makeTables(css, allChars) {
    let maxX = css[0].length;
    let maxY = css.length;

    let output = "<tr>\n\
        <th class=\"cssSquare\"></th>\n";
    for(let i = 0; i < maxX; i++) {
        output += "<th class=\"cssSquare\">" + i + "</th>\n";
    }
    output += "</tr>\n";

    hidden = allChars;
    for (let y = 0; y < maxY; y++) {
        output += "<tr>\n\
            <th class=\"cssSquare\">"+ y + "</th>\n";
        for (let x = 0; x < maxX; x++) {
            if (css[y][x] === "0000") {
                output += "<td class=\"cssSquare\"><image class=\"icon\" src=\"../images/empty.png\" alt=\" \" /></td>";
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
                output += "<td class=\"cssSquare\" id=\"" + character + "\"><image class=\"icon\" src=\"../../merged/gfx/mugs/" + character + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\" \" /></td>";
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

    for (let character of sorted) {
        character = character.name
        output += "<tr>\n\
            <td class=\"mug\"><image class=\"mugIcon\" src=\"../../merged/gfx/mugs/" + character + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\"\" /></td>\n\
            <td>" + hidden[character].displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"addCharacter('" + character + "')\">Add @ Location</button></td>\n\
        </tr>\n";
    }
    hiddenCharactersTable.innerHTML = output;


    allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);
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

    rowNumber.innerHTML = "Rows: " + maxX;
    columnNumber.innerHTML = "Columns: " + maxY;
    //IDK if this is nessesary in all use cases
    // if (xInput.value < (maxX - 1)) {
    //     xInput.value++;
    // } else {
    //     xInput.value = 0;
    //     yInput.value++;
    //     if (yInput.value > (maxY - 1)) {
    //         yInput.value = 0;
    //     }
    // }
}

function hideCharacter() {
    yInput.value = parseInt(yInput.value);
    xInput.value = parseInt(xInput.value);
    if ((css[yInput.value] == undefined) || (css[yInput.value][xInput.value] == undefined)) {
        return;//TODO: error
    }

    let characterNumber = css[yInput.value][xInput.value];
    if (characterNumber === "0000") {
        return;//TODO: alert
    }
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);
    css[yInput.value][xInput.value] = "0000";
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
}

function addCharacter(character) {
    yInput.value = parseInt(yInput.value);
    xInput.value = parseInt(xInput.value);
    if ((css[yInput.value] == undefined) || (css[yInput.value][xInput.value] == undefined)) {
        return;//TODO: error
    }

    let characterNumber = css[yInput.value][xInput.value];
    if (characterNumber !== "0000") {
        return;//TODO: alert
    }
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);
    if (allChars[character] == undefined) {
        return;//TODO: error
    }
    css[yInput.value][xInput.value] = ('0000' + allChars[character].number).slice(-4);
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
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);
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
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);
    
    let output = [];
    for (let x = 0; x < maxX; x++) {
        output.push("0000");
    }
    css.push(output);

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function removeRow() {
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);

    css.pop();

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function addColumn() {
    let maxY = css.length;
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);

    for (let y = 0; y < maxY; y++) {
        css[y].push("0000");
    }

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}

function removeColumn() {
    let maxY = css.length;
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);

    for (let y = 0; y < maxY; y++) {
        css[y].pop();
    }

    makeTables(css, allChars);
    this.api.send("writeCSS", css);
}