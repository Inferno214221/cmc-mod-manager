export {}

declare const dialog: typeof import("../api").default;
declare const window: {
    ok: () => void
}

let id: string;
dialog.onStart((options: AlertOptions) => {
    console.log(options);
    id = options.id;
    document.getElementById("body").innerHTML = options.body;
    if (options.title != undefined) {
        document.title = options.title;
    }
    if (options.okLabel != undefined) {
        document.getElementById("ok").innerHTML = options.okLabel;
    }
    dialog.resize(id, document.documentElement.getBoundingClientRect().height);
});

window.ok = () => {
    if (id == undefined) return;
    dialog.ok(id, undefined);
}