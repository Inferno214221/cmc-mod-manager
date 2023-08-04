this.api.receive("throwError", (error) => {
    alert("An Error Occured: " + error);
});

// Misc Mods
function installModDir() {
    this.api.send("installModDir");
}

function installModArch() {
    this.api.send("installModArch");
}

this.api.receive("from_installMod", (data) => {
    alert("Mod installed.");
});

/*
// On Page Load
this.api.send("getInstalledModList");

this.api.receive("fromGetInstalledModList", (installed) => {
    listMods(installed);
});

function installMod() {
    this.api.send("installMod");
}

function installModZip() {
    this.api.send("installModZip");
}

this.api.receive("fromInstallMod", (installed) => {
    listMods(installed);
});

function removeMod(mod) {
    this.api.send("removeMod", mod);
}

this.api.receive("fromRemoveMod", (installed) => {
    listMods(installed);
});

function increaseModMergePriority(mod) {
    this.api.send("increaseModMergePriority", mod);
}

this.api.receive("fromIncreaseModMergePriority", (installed) => {
    listMods(installed);
});

function listMods(installed) {
    let output = "";
    installed.misc.forEach((mod) => {
        output += 
        "<tr id=\"" + mod + "\">\n\
            <td>" + mod + "</td>\n\
            <td><button type=\"button\" onclick=\"removeMod('" + mod + "')\">Remove</button></td>\n\
            <td><button type=\"button\" onclick=\"openModFolder('" + mod + "')\">Open Directory</button></td>\n\
            <td><button type=\"button\" onclick=\"increaseModMergePriority('" + mod + "')\">Increase Merge Priority</button></td>\n\
        </tr>\n"
    });
    modTable.innerHTML = output;
}

function openModFolder(mod) {
    this.api.send("openModFolder", mod);
}*/