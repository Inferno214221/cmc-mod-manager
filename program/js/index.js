// On Page Load
checkGameSourceInstalled();
updateControlProfiles();
this.api.send("getLastMerge");

this.api.receive("fromGetLastMerge", (data) => {
    lastMerge.innerHTML = "Last Merge: " + data;
});

// Called when message received from main process
this.api.receive("fromFs", (data) => {
    this[data.call](data.result, data.callArgs);
});

// this.api.receive("fromShowOpenDialog", (data) => {
//     this[data.call](data.result, data.callArgs);
// });

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

this.api.receive("fromGetGameSource", (data) => {
    alert("CMC base game installed succesfully");
    this[data.call](data.result, data.callArgs);
});

function mergeInstalledMods() {
    this.api.send("mergeInstalledMods");
}

this.api.receive("fromMergeInstalledMods", (data) => {
    lastMerge.innerHTML = "Last Merge: " + data;
    //2:13 PM 27/5/23
    alert("Mods merged succesfully");
});

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

function saveControls() {
    this.api.send("saveControls", {
        name: controlsSaveName.value
    });
}

this.api.receive("fromSaveControls", (data) => {
    alert("Controls saved succesfully");
});

function loadControls() {
    this.api.send("loadControls", {
        name: controlsLoadName.value
    });
}

this.api.receive("fromLoadControls", (data) => {
    alert("Controls loaded succesfully");
});

function updateControlProfiles() {
    this.api.send("updateControlProfiles");
}

this.api.receive("fromUpdateControlProfiles", (profiles) => {
    let options = ""
    for (let profile of profiles) {
        profile = profile.slice(0, -4)
        options += '<option value="' + profile + '">' + profile + '</option>\n';
    }
    controlsLoadName.innerHTML = options;
});

function openFolder(directory) {
    this.api.send("openFolder", directory);
}