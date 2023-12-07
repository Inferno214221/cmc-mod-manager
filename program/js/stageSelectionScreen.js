// General
this.api.send("throwGameDir");
this.api.receive("from_throwGameDir", (error) => {
    alert("Please select your CMC+ directory first!");
    window.location = "../../index.html";
});

function openDir(dir) {
    this.api.send("openDir", dir);
}

function inputFocused(element) {
    this[element].style.borderColor = "#2777ff";
}

function inputBlurred(element) {
    this[element].style.borderColor = "black";
}

// Stage Selection Screen
function getSSSPages() {
    this.api.send("getSSSPages");
}

this.api.receive("from_getSSSPages", (data) => {
    pages = data;
    currentPage = pages[0];
    SSSPageName.value = currentPage;
    getSSS(currentPage);
});

function getSSS(page) {
    this.api.send("getSSS", page);
}

this.api.receive("from_getSSS", (data) => {
    sss = data.sss;
    stages = data.stages;
    cmcDir = data.cmcDir;
    stages[9998] = {
        name: "random",
        displayName: "?",
        displaySource: "?",
        series: null,
    };
    console.log(data.sss, data.stages);
    makeTables();
});

function writeSSS() {
    makeTables();
    this.api.send("writeSSS", {
        sss: sss,
        page: currentPage,
    });
}

function makeTables() {
    let maxY = sss.length;
    let maxX = sss[0].length;
    let output = "<tr>\n\
        <th class=\"sssSquare\"></th>\n";
    for(let i = 0; i < maxX; i++) {
        output += "<th class=\"sssSquare\">" + (i + 1) + "</th>\n";
    }
    output += "</tr>\n";

    hidden = Object.assign({}, stages);
    for (let y = 0; y < maxY; y++) {
        output += "<tr>\n<th class=\"sssSquare\">"+ (y + 1) + "</th>\n";
        for (let x = 0; x < maxX; x++) {
            let stage;
            let number = parseInt(sss[y][x]);
            stage = stages[number - 1];
            delete hidden[number - 1];
            if (stage === undefined) {
                //NOTE: resets all sss values not in the list of stages
                output += "<td class=\"sssSquare\" id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"false\" ondragover=\"event.preventDefault();\" ondrop=\"onDropOnSSS(event);\"><image class=\"icon\" src=\"../images/empty.png\" alt=\" \" /></td>";
                sss[y][x] = "0000";
            } else {
                output += "\
<td class=\"sssSquare hoverText\" id=\"" + number + "\">\n\
    <div id=\'{ \"x\": " + x + ", \"y\": " + y + " }\' draggable=\"true\" ondragover=\"event.preventDefault();\" ondragstart=\"onDragStartSSS(event);\" ondrop=\"onDropOnSSS(event);\">\n\
        <image draggable=\"false\" class=\"icon\" src=\"" + cmcDir + "/gfx/stgicons/" + stages[number - 1].name + ".png\" onerror=\"this.onerror=null; this.src='" + cmcDir.replaceAll("\\", "\\\\")  + "/gfx/stgicons/empty.png'\" alt=\" \" />\n\
        <div class=\"sssName\">" + stages[number - 1].displayName + "</div>\n\
    </div>\n\
    <span class=\"tooltipText\">" + stages[number - 1].displayName + "</span>\n\
</td>";
            }
        }
        output += "</tr>\n";
    }
    stageSelectTable.innerHTML = output;

    output = "";
    sorted = sortStages((showAll.checked ? stages : hidden), sortingType.value);
    if (reverseSort.checked) {
        sorted.reverse();
    }

    output += "<tr draggable=\"false\">\n"
    for (let stage of sorted) {
        output += 
        "<td class=\"hoverText hiddenStage\">\n\
            <div draggable=\"true\" ondragstart=\"onDragStartHidden(event);\" id=\"" + stage.number + "\" class=\"mug\">\n\
                <image draggable=\"false\" class=\"mugIcon\" src=\"" + cmcDir + "/gfx/stgicons/" + stage.name + ".png\" onerror=\"this.onerror=null; this.src='" + cmcDir.replaceAll("\\", "\\\\")  + "/gfx/stgicons/empty.png'\" alt=\"\" />\n\
                <div class=\"hiddenName\">" + stage.displayName + "</div>\n\
            </div>\n\
            <span class=\"tooltipText\" draggable=\"false\">" + stage.displayName + "</span>\n\
        </td>\n";
    }
    output += "</tr>";
    hiddenStagesTable.innerHTML = output;

    let series = [];
    for (let stage of stages) {
        if (stage != undefined && !series.includes(stage.series)) {
            series.push(stage.series);
        }
    }
    output = "";
    series.forEach((s) => {
        output += "<option value=\"" + s + "\">" + s + "</option>'\n";
    });
    seriesSelect.innerHTML = output;
}

function sortStages(stages, sortType) {
    let stagesSorted = [];
    for (let stage in stages) {
        stagesSorted.push({
            number: parseInt(stage) + 1,
            name: stages[stage].name,
            displayName: stages[stage].displayName,
            series: stages[stage].series,
        });
    }
    let sorted = stagesSorted.toSorted((a, b) => (a[sortType] > b[sortType] ? 1 : -1));
    return sorted;
}

function removeStage(x, y) {
    let number = parseInt(sss[y][x]);
    if (number === "0000") {
        return;
    }
    let stage;
    stage = stages[number - 1];
    if (stage == undefined) {
        return;
    }
    // hidden[number - 1] = stage;
    sss[y][x] = "0000";
    writeSSS();
    return number;
}

function addStage(stageNumber, x, y) {
    let replaceNumber = sss[y][x];
    if (replaceNumber !== "0000") {
        return;
    }
    sss[y][x] = ('0000' + stageNumber).slice(-4);
    // delete hidden[stageNumber - 1];
    makeTables();
    writeSSS();
}

function getSSSPage(offset) {
    let index = pages.indexOf(currentPage) + offset;
    if (index < 0) index = pages.length - 1;
    if (index > pages.length - 1) index = 0;
    currentPage = pages[index];
    SSSPageName.value = currentPage;
    getSSS(currentPage);
}

function resort() {
    inputBlurred('sortingType');
    getSSS(currentPage);
}

function onDragStartSSS(ev) {
    let coords = JSON.parse(ev.currentTarget.id);
    ev.dataTransfer.setData("sss", JSON.stringify(coords));
}

function onDropOnHidden(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.getData("sss") != "") {
        let received = JSON.parse(ev.dataTransfer.getData("sss"));
        removeStage(received.x, received.y);
    }
}

function onDragStartHidden(ev) {
    ev.dataTransfer.setData("hidden", ev.target.id);
}

function onDropOnSSS(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.getData("hidden") != "") {
        let coords = JSON.parse(ev.currentTarget.id);
        removeStage(coords.x, coords.y);
        addStage(ev.dataTransfer.getData("hidden"), coords.x, coords.y);
    } else if (ev.dataTransfer.getData("sss") != "") {
        let dropCoords = JSON.parse(ev.currentTarget.id);
        let drop = removeStage(dropCoords.x, dropCoords.y);
        let dragCoords = JSON.parse(ev.dataTransfer.getData("sss"));
        let drag = removeStage(dragCoords.x, dragCoords.y);
        addStage(drop, dragCoords.x, dragCoords.y);
        addStage(drag, dropCoords.x, dropCoords.y);
    }
}

function removeSeries() {
    series = seriesSelect.value;
    if (series == "") {
        return;
    }
    for (let stage = 0; stage < stages.length; stage++) {
        if (stages[stage] == undefined) {
            continue;
        }
        if (stages[stage].series == series) {
            for (let y in sss) {
                for (let x in sss[y]) {
                    if (('0000' + (stage + 1)).slice(-4) == sss[y][x]) {
                        removeStage(x, y);
                    }
                };
            };
        }
    }
    writeSSS();
}

// On Page Load
var sss, stages, hidden, currentPage, pages, cmcDir;
getSSSPages();