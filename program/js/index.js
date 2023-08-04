// General
function openDir(dir) {
    this.api.send("openDir", dir);
}

this.api.receive("throwError", (error) => {
    alert("An Error Occured: " + error);
});

// Index
function checkGameInstalled() {
    this.api.send("checkGameInstalled");
}

this.api.receive("from_checkGameInstalled", (installed) => {
    writeGameInstalled(installed);
});

function writeGameInstalled(installed) {
    gameSource.innerHTML = "CMC: " + (installed ? "Installed" : "Not Installed");
}

function importUnmodded() {
    this.api.send("importUnmodded");
}

this.api.receive("from_importUnmodded", () => {
    alert("CMC installed succesfully");
    writeGameInstalled(true);
});

function runGame() {
    this.api.send("runGame");
}

// On Page Load
checkGameInstalled();