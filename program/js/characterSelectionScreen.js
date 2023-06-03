getCSS();

function inputFocused(element) {
    console.log("here")
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

function getCSS() {
    this.api.send("getCSS");
}

this.api.receive("fromGetCSS", (data) => {
    let css = data.css;
    let basegame = data.basegame;
    let installed = data.installed;
    let allChars = Object.assign({}, basegame.ssbc, basegame.cmc, installed.characters);
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
            let character;
            for (let e of Object.keys(allChars)) {
                if (allChars[e].number == css[y][x]) {
                    character = e;
                    delete allChars[e];//Only one copy of each
                    break;
                }
            }
            if (character == undefined) {
                break;
            }
            output += "<td class=\"cssSquare\" id=\"" + character + "\"><image class=\"icon\" src=\"../../merged/gfx/mugs/" + character + ".png\" /></td>";
        }
        output += "</tr>\n";
    }
    characterSelectTable.innerHTML = output;
    
    output = "";
    for (let character of Object.keys(allChars)) {
        output += "<tr>\n\
            <td class=\"mug\"><image class=\"mugIcon\" src=\"../../merged/gfx/mugs/" + character + ".png\" alt=\"\" /></td>\n\
            <td>" + allChars[character].displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"addCharacter('" + character + "')\">Add @ Location</button></td>\n\
        </tr>\n";
    }
    hiddenCharactersTable.innerHTML = output;
});

function hideCharacter() {
    //
}