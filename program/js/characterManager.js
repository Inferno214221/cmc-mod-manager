// On Page Load

function openCharacterFolder(character) {
    this.api.send("openCharacterFolder", character);
}

function installCharacter() {
    this.api.send("installCharacter");
}

//FIXME: run on start
this.api.receive("fromInstallCharacter", (installed) => {
    let output = "";
    Object.keys(installed.characters).forEach((character) => {
        output += 
        "<tr id=\"" + character + "\">\n\
            <td>" + installed.characters[character].displayName + "</td>\n\
            <td><button type=\"button\">Remove</button></td>\n\
            <td><button type=\"button\" onclick=\"openCharacterFolder('" + character + "')\">Open Directory</button></td>\n\
            <td><button type=\"button\">Increase Merge Priority</button></td>\n\
        </tr>\n"
    });
    characterTable.innerHTML = output;
});