// Almost Global
this.api.send("throwGameDir");
this.api.receive("from_throwGameDir", (error) => {
    alert("Please select your CMC+ directory first!");
    window.location = "../../index.html";
});

this.api.receive("from_oneClickStart", () => {
    alert("Download started.");
});

this.api.receive("from_oneClickFinish", () => {
    alert("Download finished. Installing.");
    window.location = "./characterManager.html";
});

this.api.receive("alert", (info) => {
    alert(info);
});