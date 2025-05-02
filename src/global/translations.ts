// /"[^"+><=\]]+ [^"+><=]+"/g
// Have to remain relatively formal and grammatically correct (as much as my existing strings are)
// Keep "CMC Mod Manager" and other proper nouns
// I'll leave out some strings that shouldn't be translated e.g. "GPLv3"
// Licensed under GPLv3
// System errors are out of scope
// Needs to be consistent with keywords e.g. "Character" is always translated the same
// Casing consistency would also be nice, if applicable

import english from "../assets/lang/english.json";
import { ModTypes } from "./global";

type Language = typeof english;

export function substitute(template: string, args: any[]): string {
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

export function message(key: keyof Language, ...args: any): string {
    const lang: Language = english;
    return substitute(lang[key], args);
}

export function tryMessage(key: string, ...args: any): string | undefined {
    const lang: Language = english;
    // @ts-ignore
    return lang[key] ? substitute(lang[key], args) : undefined;
}

export function error(key: string, ...args: any): never {
    throw new Error(tryMessage("error." + key, ...args) ?? key);
}

// This is currently the only enum that is displayed.
type DisplayEnums = ModTypes;

export function displayEnum(variant: DisplayEnums): string {
    return tryMessage("enumDisplayName." + variant)!;
}

// Typed version of gen-langs.mjs

// type StringStore = string | { [key: string]: StringStore };
// type StringKeyObj = { [key: string]: string };

// export function squash(obj: Exclude<StringStore, string>): StringKeyObj {
//     const objects: StringKeyObj[] = Object.keys(obj).flatMap(
//         (key: string) => squashRecursive(obj[key], key)
//     );
//     const result: any = {};
//     for (const o of objects) {
//         Object.assign(result, o);
//     }
//     return result;
// }

// export function squashRecursive(obj: StringStore, path: string): StringKeyObj[] {
//     if (typeof obj == "string") {
//         const out: StringKeyObj = {};
//         out[path] = obj;
//         return [out];
//     }
//     return Object.keys(obj).flatMap(
//         (key: string) => squashRecursive(obj[key], path + "." + key)
//     );
// }