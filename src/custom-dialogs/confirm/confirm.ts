export {}

declare const dialog: typeof import("../api").default;
declare const window: {
    ok: () => void,
    cancel: () => void
}

let id: string;
dialog.onStart((options: ConfirmOptions) => {
    console.log(options);
    id = options.id;
    document.getElementById("body").innerHTML = options.body;
    if (options.title != undefined) {
        document.title = options.title;
    }
    if (options.okLabel != undefined) {
        document.getElementById("ok").innerHTML = options.okLabel;
    }
    if (options.cancelLabel != undefined) {
        document.getElementById("cancel").innerHTML = options.cancelLabel;
    }
    dialog.resize(id, document.documentElement.getBoundingClientRect().height);
});

window.ok = () => {
    if (id == undefined) return;
    dialog.ok(id, undefined);
}

window.cancel = () => {
    if (id == undefined) return;
    dialog.cancel(id);
}