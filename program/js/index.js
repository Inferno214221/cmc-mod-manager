// On Page Load
checkGameSourceInstalled();

// Called when message received from main process
this.api.receive("fromFs", (data) => {
    this[data.call](data.result, data.callArgs);
});

// this.api.receive("fromShowOpenDialog", (data) => {
//     this[data.call](data.result, data.callArgs);
// });

this.api.receive("fromGetGameSource", (data) => {
    this[data.call](data.result, data.callArgs);
});

function checkGameSourceInstalled() {
    // console.info("Checking if the game is installed");
    this.api.send("fs", {
        method: "existsSync",
        arguments: ["./basegame/CMC+ v7.exe"],
        call: "gameSourceInstalled",
    });
}

function gameSourceInstalled(data) {
    // console.info("CMC " + (data ? "is" : "isn't") + " installed");
    gameSource.innerHTML = "Base Game: " + (data ? "Found" : "Not Found");
}

function getGameSource() {
    this.api.send("getGameSource");
}

function mergeInstalledMods() {
    this.api.send("mergeInstalledMods");
}

function runCMC(path) {
    this.api.send("runCMC", {
        path: path
    });
}

function inputFocused(element) {
    console.log("here")
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}