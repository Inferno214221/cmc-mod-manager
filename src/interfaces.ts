export interface Character {
    name: string,
    displayName: string,
    series: string,
    randomSelection: boolean,
    cssNumber: number,
    // alts: []
    mug: string
}

export interface CharacterIndicesByName {
    [name: string]: number
}

export enum SortTypes {
    cssNumber = "cssNumber",
    series = "series",
    displayName = "displayName"
}