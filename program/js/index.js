this.api.receive("throwError", (error) => {
    alert("An Error Occured: " + error);
});

// On Page Load
checkGameSourceInstalled();
updateControlProfiles();
this.api.send("getLastMerge");

this.api.receive("fromGetLastMerge", (data) => {
    lastMerge.innerHTML = "Last Merge: " + data;
});

function checkGameSourceInstalled() {
    this.api.send("checkGameSourceInstalled");
}

this.api.receive("fromCheckGameSourceInstalled", (data) => {
    gameSourceInstalled(data);
});

function gameSourceInstalled(data) {
    gameSource.innerHTML = "Base Game: " + (data ? "Found" : "Not Found");
}

function getGameSource() {
    this.api.send("getGameSource");
}

this.api.receive("fromGetGameSource", (data) => {
    alert("CMC base game installed succesfully");
    gameSourceInstalled(data);
    mergeInstalledMods();
});

function mergeInstalledMods() {
    this.api.send("mergeInstalledMods");
}

this.api.receive("fromMergeInstalledMods", (data) => {
    lastMerge.innerHTML = "Last Merge: " + data;
    //2:13 PM 27/5/23
    alert("Mods merged succesfully");
    if (removeUselessFiles.checked) {
        this.api.send("removeMergedBloat");
    }
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