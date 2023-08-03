// General
function new_openDir(dir) {
    this.api.send("new_openDir", dir);
}

this.api.receive("new_throwError", (error) => {
    alert("An Error Occured: " + error);
});

// On Page Load
new_checkGameInstalled();

function new_checkGameInstalled() {
    this.api.send("new_checkGameInstalled");
}

this.api.receive("new_from_checkGameInstalled", (installed) => {
    new_writeGameInstalled(installed);
});

function new_writeGameInstalled(installed) {
    gameSource.innerHTML = "CMC: " + (installed ? "Installed" : "Not Installed");
}

function new_importUnmodded() {
    this.api.send("new_importUnmodded");
}

this.api.receive("new_from_importUnmodded", () => {
    alert("CMC base game installed succesfully");
    new_writeGameInstalled(true);
});

function new_runGame() {
    this.api.send("new_runGame");
}