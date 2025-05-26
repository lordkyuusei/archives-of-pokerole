import { rankAchievements } from "$lib/constants/rankUpConfigs";
import type { DbPokemonRank } from "$lib/types/mongo/pokemon";
import type { Trainer, TrainerBadges, TrainerBattlePocket, TrainerMainPocket } from "$lib/types/mongo/trainer"

const regroupPropertiesAsObj = (obj: any, prefix: string) =>
    Object.entries(obj)
        .filter(([key]) => key.startsWith(prefix))
        .reduce(
            (acc, [key, value]) => ({
                ...acc,
                [key.replace(prefix, '')]: parseInt(value as string),
            }),
            {} as any,
        );

export const convertCharacterToTrainer = (trainerData: { [x: string]: string}) => {
    const trainer: Trainer = {
        name: trainerData["Name"],
        rank: trainerData['Rank'] as DbPokemonRank,
        age: Number(trainerData["Age"]),
        player: "Player",
        concept: trainerData["Concept"],
        nature: trainerData["Nature"],
        money: Number(trainerData["Money"]),
        hp: 4 + Number(trainerData['ATTR_Vitality']),
        will: 2 + Number(trainerData['ATTR_Insight']),
        party: [],
        pokedex: [],
        notes: "",
        skills: regroupPropertiesAsObj(trainerData, 'SKILL_'),
        socials: regroupPropertiesAsObj(trainerData, 'SOC_'),
        attributes: regroupPropertiesAsObj(trainerData, 'ATTR_'),
        achievements: rankAchievements[trainerData['Rank'] as DbPokemonRank].map((a) => [a, false]),
        healingBag: { "Potions": [0, 0, 2], "S. Potions": [0, 0, 4], "H. Potions": [0, 0, 14] },
        mainPocket: Array.from({ length: 5}).map((_) => "") as TrainerMainPocket,
        battlePocket: Array.from({ length: 24}).map((_) => "") as TrainerBattlePocket,
        badges: Array.from({ length: 8}).map((_, i) => ["Badge" + i, false]) as TrainerBadges
    };

    return trainer;
}