// Global Functions
this.api.receive("from_oneClickStart", (e) => {
    alert("Download started.");
});

this.api.receive("from_oneClickFinish", (e) => {
    alert("Download finished. Installing.");
    window.location = "./program/html/characterManager.html";
});

// General
function openDir(dir) {
    this.api.send("openDir", dir);
}

this.api.receive("throwError", (error) => {
    alert("An Error Occured: " + error);
});

// Index
// function checkGameInstalled() {
//     this.api.send("checkGameInstalled");
// }

// this.api.receive("from_checkGameInstalled", (installed) => {
//     writeGameInstalled(installed);
// });

// function writeGameInstalled(installed) {
//     gameSource.innerHTML = "CMC: " + (installed ? "Installed" : "Not Installed");
// }

// function importUnmodded() {
//     this.api.send("importUnmodded");
// }

// this.api.receive("from_importUnmodded", () => {
//     alert("CMC installed succesfully");
//     writeGameInstalled(true);
// });

function checkGameDir() {
    this.api.send("checkGameDir");
}

this.api.receive("from_checkGameDir", (dir) => {
    writeGameLocation(dir);
});

function selectGameDir() {
    this.api.send("selectGameDir");
}

this.api.receive("from_selectGameDir", (dir) => {
    alert("CMC directory set successfully.");
    writeGameLocation(dir);
});

function writeGameLocation(dir) {
    gameSource.innerHTML = "CMC Directory: " + dir;
}

function openGameDir() {
    this.api.send("openGameDir");
}

function runGame() {
    this.api.send("runGame");
}

function setupOneClick() {
    this.api.send("setupOneClick");
}

this.api.receive("from_setupOneClick", (success) => {
    if (success) {
        alert("URI associated.");
    } else {
        alert("Failed to associate URI.");
    }
});

// On Page Load
checkGameDir();