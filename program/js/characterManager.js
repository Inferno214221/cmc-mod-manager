// On Page Load

function openCharacterFolder(character) {
    this.api.send("openCharacterFolder", character);
}

function installCharacter() {
    this.api.send("installCharacter");
}