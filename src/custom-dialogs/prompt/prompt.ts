export {}

declare const dialog: typeof import("../api").default;
declare const window: {
    ok: (input: string) => void,
    cancel: () => void
}

let id: string;
dialog.onStart((options: PromptOptions) => {
    console.log(options);
    id = options.id;
    document.getElementById("body").innerHTML = options.body;
    if (options.title != undefined) {
        document.title = options.title;
    }
    if (options.placeholder != undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Property 'placeholder' does not exist on type 'HTMLElement'.
        document.getElementById("input").placeholder = options.placeholder;
    }
    if (options.invalidCharacters != undefined) {
        document.getElementById("input").oninput = (event: Event) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Property 'value' does not exist on type 'HTMLElement'.
            event.target.value = event.target.value.replace(options.invalidCharacters, "");
        }
    }
    if (options.okLabel != undefined) {
        document.getElementById("ok").innerHTML = options.okLabel;
    }
    if (options.cancelLabel != undefined) {
        document.getElementById("cancel").innerHTML = options.cancelLabel;
    }
    dialog.resize(id, document.documentElement.getBoundingClientRect().height);
    document.getElementById("input").focus();
});

window.ok = (input: string) => {
    if (id == undefined) return;
    dialog.ok(id, input);
}

window.cancel = () => {
    if (id == undefined) return;
    dialog.cancel(id);
}