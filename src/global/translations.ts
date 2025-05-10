import english from "../assets/lang/english.json";
import portuguese from "../assets/lang/portuguese.json";
import spanish from "../assets/lang/spanish.json";
import { Language, ModTypes } from "./global";

export type MessageMap = typeof english & typeof portuguese & typeof spanish;
    
// This is currently the only enum that is displayed.
export type DisplayEnums = ModTypes;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function translations(language: Language) {
    let lang: MessageMap;
    switch (language) {
        case Language.ENGLISH:
            lang = english;
            break;
        case Language.PORTUGUESE:
            lang = portuguese;
            break;
        case Language.SPANISH:
            lang = spanish;
            break;
    }
    
    function substitute(template: string, args: any[]): string {
        const exp: RegExp = /\{(\d+)\}/gd; // Make stateful expression
    
        let result: string = "";
        let lastIndex: number = 0;
        let match: RegExpExecArray | null;
    
        while ((match = exp.exec(template)) != null) {
            result += template.substring(lastIndex, match.indices![0][0]);
            result += args[match[1] as unknown as number] ?? error("invalidStringArgs");
            lastIndex = match.indices![0][1];
        }
        result += template.substring(lastIndex, template.length);
        return result;
    }
    
    function message(key: keyof MessageMap, ...args: any): string {
        return substitute(lang[key], args);
    }
    
    function tryMessage(key: string, ...args: any): string | undefined {
        // @ts-ignore
        return lang[key] ? substitute(lang[key], args) : undefined;
    }
    
    function error(key: string, ...args: any): never {
        throw new Error(tryMessage("error." + key, ...args) ?? key);
    }
    
    function displayEnum(variant: DisplayEnums): string {
        return tryMessage("enumDisplayName." + variant)!;
    }

    return {
        message,
        tryMessage,
        error,
        displayEnum
    };
}