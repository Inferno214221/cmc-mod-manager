// General
function openDir(dir) {
    this.api.send("openDir", dir);
}

function inputFocused(element) {
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

// Stages
function getStageList() {
    this.api.send("getStageList");
}

this.api.receive("from_getStageList", (data) => {
    listStages(data.stages, data.cmcDir, data.random);
});

function listStages(stages, cmcDir, random) {
    let output = "<tr><th>Image</th><th>Name</th><th>Extract</th><th>Remove</th><th>Random Selection</th></tr>";
    sorted = sortStages(stages, sortingType.value);
    if (reverseSort.checked) {
        sorted.reverse();
    }
    sorted.forEach((stages, index, array) => {
        stages.excluded = (random.indexOf(stages.name) == -1);
        array[index] = stages;
    });
    for (let stage of sorted) {
        console.log(stage);
        output += 
        "<tr id=\"" + stage.number + "\">\n\
            <td class=\"mug\"><image src=\"" + cmcDir + "/gfx/stgicons/" + stage.name + ".png\" draggable=\"false\" onerror=\"this.onerror=null; this.src='" + cmcDir + "/gfx/stgicons/empty.png'\" /></td>\n\
            <td>" + stage.displayName + "</td>\n\
            <td><button type=\"button\" onclick=\"extractStage('" + stage.number + "')\">Extract</button></td>\n\
            <td><button type=\"button\" onclick=\"removeStage('" + stage.number + "')\">Remove</button></td>\n\
            <td><input type=\"checkbox\"" + (stage.excluded ? " checked" : "") + " onclick=\"toggleRandomStage(this, '" + stage.name + "');\"></td>\n\
        </tr>\n";
    };
    stageTable.innerHTML = output;
}

function installStageDir() {
    this.api.send("installStageDir", filteredInstall.checked);
}

function installStageArch() {
    this.api.send("installStageArch", filteredInstall.checked);
}

this.api.receive("from_installStage", (data) => {
    alert("Stage installed successfully.");
    getStageList();
});

function removeStage(id) {
    this.api.send("removeStage", id);
    getStageList();
}

this.api.receive("from_removeStage", (data) => {
    alert("Stage removed successfully.");
});

function extractStage(id) {
    this.api.send("extractStage", id);
    getStageList();
}

this.api.receive("from_extractStage", (data) => {
    alert("Stage extracted successfully.");
});

function toggleRandomStage(checkbox, stageName) {
    this.api.send("toggleRandomStage", {
        stageName: stageName,
        excluded: checkbox.checked,
    });
}

function sortStages(stages, sortType) {
    let stagesSorted = [];
    for (let stage in stages) {
        stagesSorted.push({
            number: parseInt(stage) + 1,
            name: stages[stage].name,
            displayName: stages[stage].displayName,
            sortName: stages[stage].displayName.toLowerCase(),
            series: stages[stage].series,
        });
    }
    let sorted = stagesSorted.toSorted((a, b) => (a[sortType] > b[sortType] ? 1 : -1));
    return sorted;
}

function resort() {
    inputBlurred('sortingType');
    getStageList();
}

// function removeAllStages() {
//     if(!confirm("All stages except for Master Hand and Fighting Sprite will be removed.\nAre you sure you want to continue?")) return;
//     this.api.send("removeAllStages");
// }

this.api.receive("from_removeAllStages", () => {
    alert("Stages removed successfully.");
    getStageList();
});

// On Page Load
var stages;
getStageList();