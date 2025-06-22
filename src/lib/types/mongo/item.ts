export type DbItem = {
    "Name": string,
    "Source": string,
    "PMD": boolean,
    "Pocket": ItemPocket,
    "Category": string,
    "Description": string,
    "OneUse": boolean,
    "TrainerPrice": string,
    "ForPokemon"?: string,
    "Cures"?: string,
    "ForTypes"?: string,
    "Boost"?: string,
    "Value"?: string
    "HealthRestored"?: string
}

export type ItemPocket = "HeldItems" | "Medicine" | "TrainerItems" | "EvolutionItems" | "Pokeballs";