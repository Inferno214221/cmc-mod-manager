// Almost Global
this.api.send("throwGameDir");
this.api.receive("from_throwGameDir", (error) => {
    alert("Please select your CMC+ directory first!");
    window.location = "../../index.html";
});

this.api.receive("from_oneClickStart", () => {
    alert("Download started. Please wait for it to finish before initialising another.");
});

// this.api.receive("from_oneClickFinish", () => {
//     alert("Download finished. Installing.");
//     window.location = "./characterManager.html";
// });

this.api.receive("alert", (info) => {
    alert(info);
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