export type DbMoveCategory = 'Special' | 'Physical' | 'Support';
export type DbMoveHealType = 'Leech';
export type DbMoveTarget = "User" | "Targets" | "All Foes";

export type DbMove = {
    Name: string,
    Type: string,
    Power: number,
    Damage1: string,
    Damage2: string,
    Accuracy1: string,
    Accuracy2: string,
    Target: string,
    Effect: string,
    Description: string,
    Attributes: DbAttributes,
    AddedEffects: DbAddedEffects,
    Category: DbMoveCategory,
}

export type DbMoveLight = {
    Name: string,
    Type: string,
    Accuracy: [string, string],
    Damage: [string, string],
    Power: number,
}

export type DbAttributes = {
    "Priority": number,
    "NeverFail"?: boolean,
    "HighCritical"?: boolean,
    "Lethal"?: boolean,
    "SwitcherMove"?: boolean,
    "PhysicalRanged"?: boolean,
    "BlockDamagePool"?: number,
}

export type DbAddedEffects = {
    "Heal"?: DbHealEffect,
    "StatChanges": DbMoveStatChangeEffect[],
    "Ailments": DbMoveAilmentEffect[],
}

export type DbMoveAilmentEffect = {
    "Type": string,
    "Affects": string,
    "ChanceDice"?: number,
}

export type DbMoveStatChangeEffect = {
    "Stats": string[],
    "Stages": number,
    "ChanceDice"?: number,
    "Affects": string,
}

export type DbHealEffect = {
    "Type": string,
    "Percentage": number,
    "Target": string,
}