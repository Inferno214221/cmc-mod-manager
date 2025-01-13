import { render } from "./app/app";
import CMCMM from "../assets/icon.svg";

render();

api.on("showNotification", (
    title: string,
    options: NotificationOptions = {},
    onclick?: MainCall
) => {
    options.icon = CMCMM;
    const notif: Notification = new Notification(title, options);
    if (onclick != undefined) notif.onclick = () => {
        if (api[onclick.name] != undefined) {
            api[onclick.name](...onclick.args);
        }
    }
});