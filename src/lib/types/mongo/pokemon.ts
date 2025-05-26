import type { Ailment } from "$lib/constants/ailments";
import type { PokemonSkill } from "$lib/constants/skills";
import type { WithId } from "mongodb";

export type DbPokemonAttribute = 'Strength' | 'Dexterity' | 'Vitality' | 'Special' | 'Insight';
export type DbPokemonSocial = 'Tough' | 'Cool' | 'Cute' | 'Beauty' | 'Clever';
export type DbPokemonRank = 'None' | 'Starter' | 'Beginner' | 'Amateur' | 'Ace' | 'Pro' | 'Master' | 'Champion'; 
export type DbPokemonEvolutionSpeed = 'Fast' | 'Medium' | 'Slow';

export type DbPokemon = {
    "Number": number,
    "DexID": string,
    "Name": string,
    "Type1": string,
    "Type2": string,
    "BaseHP": number,
    "Strength": number,
    "MaxStrength": number,
    "Dexterity": number,
    "MaxDexterity": number,
    "Vitality": number,
    "MaxVitality": number,
    "Special": number,
    "MaxSpecial": number,
    "Insight": number,
    "MaxInsight": number,
    "Ability1": string,
    "Ability2": string,
    "HiddenAbility": string,
    "EventAbilities": string,
    "RecommendedRank": string,
    "GenderType": string,
    "Legendary": boolean,
    "GoodStarter": boolean,
    "DexCategory": string,
    "Height": DbPokemonHeight,
    "Weight": DbPokemonWeight,
    "DexDescription": string,
    "Evolutions": DbPokemonEvolution[],
    "Image": string,
    "Moves": WithId<DbPokemonMove>[],
}

export type DbPartnerPokemon = {
    id: string,
    specie: [string, number],
    nickname: string,
    shiny: boolean,
    nature: string,
    loyalty: number,
    happiness: number,
    battles: number,
    victories: number,
    rank: DbPokemonRank,
    status: Ailment,
    moves: string[];
    hp: number;
    will: number;
    heldItem: string;
    notes: string,
    box: number,
    skills: { [x in PokemonSkill]: number };
    socials: { [x in DbPokemonSocial]: number };
    attributes: { [x in DbPokemonAttribute]: number };
}

export type DbPokemonHeight = {
    "Meters": number,
    "Feet": number,
}

export type DbPokemonWeight = {
    "Kilograms": number,
    "Pounds": number,
}

export type DbPokemonEvolution = {
    "From"?: string,
    "To"?: string,
    "Kind": string,
    "Item"?: string,
    "Speed"?: DbPokemonEvolutionSpeed,
    "Stat"? : string,
    "Value"? : number,
    "Special"? : string,
}

export type DbPokemonMove = {
    "Learned": DbPokemonRank,
    "Name": string,
}