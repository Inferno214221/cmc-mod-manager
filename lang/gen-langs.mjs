/* eslint-disable */
import fs from "fs-extra";
import path from "path";

const IN_DIR = path.parse(
    process.argv[1].replace("node_modules/@electron-forge/cli/dist/electron-forge-start.js", "lang/gen-langs.mjs")
).dir;
const OUT_DIR = path.resolve(IN_DIR, "../src/assets/lang/");

export function squash(obj) {
    const objects = Object.keys(obj).flatMap(
        (key) => squashRecursive(obj[key], key)
    );
    const result = {};
    for (const o of objects) {
        Object.assign(result, o);
    }
    return result;
}

export function squashRecursive(obj, path) {
    if (typeof obj == "string") {
        const out = {};
        out[path] = obj;
        return [out];
    }
    return Object.keys(obj).flatMap(
        (key) => squashRecursive(obj[key], path + "." + key)
    );
}

export function squashLangToFile(lang, file) {
    fs.ensureFileSync(file);
    fs.writeFileSync(file, JSON.stringify(
        Object.assign(squash(lang), squash(CONSTANTS.default)),
        null,
        2
    ));
}

const LANGS = ["english"];
const CONSTANTS = await import(path.join(IN_DIR, "constants.mjs"));

for (const lang of LANGS) {
    const object = await import(path.join(IN_DIR, lang + ".mjs"));
    squashLangToFile(object.default, path.join(OUT_DIR, lang + ".json"));
}