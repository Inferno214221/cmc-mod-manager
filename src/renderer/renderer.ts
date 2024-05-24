import { render } from "./app/app";
import cmcmm from "../assets/icon.png";

render();

api.on("showNotification", (
    title: string,
    options?: NotificationOptions,
    onclick?: MainCall
) => {
    options.icon = cmcmm;
    const notif: Notification = new Notification(title, options);
    if (onclick != undefined) notif.onclick = () => {
        if (api[onclick.name] != undefined) {
            api[onclick.name](...onclick.args);
        } else {
            // TODO: throw error
        }
    }
});