// Global Functions
this.api.receive("from_oneClickStart", () => {
    alert("Download started. Please wait for it to finish before initialising another.");
});

// this.api.receive("from_oneClickFinish", (e) => {
//     alert("Download finished. Installing.");
//     window.location = "./program/html/characterManager.html";
// });

// General
function openDir(dir) {
    this.api.send("openDir", dir);
}

// Index
function checkGameDir() {
    this.api.send("checkGameDir");
}

this.api.receive("from_checkGameDir", (dir) => {
    writeGameLocation(dir);
});

function writeGameLocation(dir) {
    gameSource.innerHTML = "CMC Directory: " + dir;
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

function selectGameDir() {
    this.api.send("selectGameDir");
}

this.api.receive("from_selectGameDir", (dir) => {
    alert("CMC directory set successfully.");
    writeGameLocation(dir);
});

function openGameDir() {
    this.api.send("openGameDir");
}

function runGame() {
    this.api.send("runGame");
}

// On Page Load
checkGameDir();