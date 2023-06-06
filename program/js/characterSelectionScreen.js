var css, basegame, installed, hidden;
getCSS();

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

    for (let y = 0; y < maxY; y++) {
        output += "<tr>\n\
            <th class=\"cssSquare\">"+ y + "</th>\n";
        for (let x = 0; x < maxX; x++) {
            if (css[y][x] === "0000") {
                output += "<td class=\"cssSquare\"><image class=\"icon\" src=\"../images/empty.png\" alt=\" \" /></td>";
            } else {
                let character;
                for (let e of Object.keys(allChars)) {
                    if (allChars[e].number == css[y][x]) {
                        character = e;
                        delete allChars[e];//Only one copy of each
                        break;
                    }
                }
                if (character === undefined) {
                    break;
                }
                output += "<td class=\"cssSquare\" id=\"" + character + "\"><image class=\"icon\" src=\"../../merged/gfx/mugs/" + character + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\" \" /></td>";
            }
        }
        output += "</tr>\n";
    }
    characterSelectTable.innerHTML = output;
    hidden = allChars;
    
    output = "";
    for (let character of Object.keys(hidden)) {
        output += "<tr>\n\
            <td class=\"mug\"><image class=\"mugIcon\" src=\"../../merged/gfx/mugs/" + character + ".png\" onerror=\"this.onerror=null; this.src='../images/missing.png'\" alt=\"\" /></td>\n\
            <td>" + hidden[character].displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"addCharacter('" + character + "')\">Add @ Location</button></td>\n\
        </tr>\n";
    }
    hiddenCharactersTable.innerHTML = output;
}

function hideCharacter() {
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
}

function addCharacter(character) {
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
    css[yInput.value][xInput.value] = ('0000'+allChars[character].number).slice(-4);
    console.log(css[yInput.value][xInput.value]);
    delete hidden[character];
    makeTables(css, allChars);
}