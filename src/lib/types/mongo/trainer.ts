import type { TrainerSkill } from "$lib/constants/skills";
import type { Tween } from "svelte/motion";
import type { DbPokemonAttribute, DbPokemonRank, DbPokemonSocial } from "./pokemon";

export enum PokemonStudyState {
    "NeverMet" = 0,
    "Seen" = 1,
    "Caught" = 2,
};

export type Trainer = {
    name: string;
    rank: DbPokemonRank,
    age: number,
    player: string,
    concept: string,
    nature: string,
    money: number,
    hp: number,
    will: number,
    party: string[],
    pokedex: string;
    attributes: TrainerAttributes
    skills: TrainerSkills
    socials: TrainerSocials
    notes: string;
    achievements: TrainerAchievements
    healingBag: TrainerHealingBag;
    mainPocket: TrainerMainPocket
    battlePocket: TrainerBattlePocket
    badges: TrainerBadges
}

export type TrainerHealingBagItem = "Potions" | "S. Potions" | "H. Potions";

export type TrainerHealingBag = {
    [key in TrainerHealingBagItem]: [number, number, number];
};

type TrainerAttributes = {
    [x in Exclude<DbPokemonAttribute, 'Special'>]: number;
}

type TrainerSkills = {
    [x in TrainerSkill]: number;
}

type TrainerSocials = {
    [x in DbPokemonSocial]: number;
}

type TrainerAchievements = [string, boolean][];

export type TrainerMainPocket = [string, ...string[]] & { length: 5 };
export type TrainerBattlePocket = [string, ...string[]] & { length: 24 };
export type TrainerBadges = [[string, boolean], ...[string, boolean][]] & { length: 8 };
