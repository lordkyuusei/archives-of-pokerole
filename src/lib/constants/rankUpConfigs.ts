import type { DbPokemonRank } from "$lib/types/mongo/pokemon";
import type { RankUpSetting } from "$lib/types/rank";

export const rankUpSettings: RankUpSetting[] = [
    { from: 'None',     to: 'Starter',  config: { attributePoints: 0, socialPoints: 0, skillPoints: 5, skillLimit: 1, attributeOverload: 0 } },
    { from: 'Starter',  to: 'Beginner', config: { attributePoints: 2, socialPoints: 2, skillPoints: 4, skillLimit: 2, attributeOverload: 0 } },
    { from: 'Beginner', to: 'Amateur',  config: { attributePoints: 2, socialPoints: 2, skillPoints: 3, skillLimit: 3, attributeOverload: 0 } },
    { from: 'Amateur',  to: 'Ace',      config: { attributePoints: 2, socialPoints: 2, skillPoints: 2, skillLimit: 4, attributeOverload: 0 } },
    { from: 'Ace',      to: 'Pro',      config: { attributePoints: 2, socialPoints: 2, skillPoints: 1, skillLimit: 5, attributeOverload: 0 } },
    { from: 'Pro',      to: 'Master',   config: { attributePoints: 0, socialPoints: 14, skillPoints: 0, skillLimit: 5, attributeOverload: 0 } },
    { from: 'Master',   to: 'Champion', config: { attributePoints: 14, socialPoints: 0, skillPoints: 1, skillLimit: 5, attributeOverload: 2 } },
];

export const rankAchievements: Record<DbPokemonRank, string[]> = {
    "None": [
        "get-trainer-license",
        "get-first-pokemon",
    ],
    "Starter": [
        "understand-pokemon",
        "train-pokemon",
        "catch-second-pokemon",
        "win-first-trainer-battle",
    ],
    "Beginner": [
        "evolve-pokemon",
        "win-first-badge",
        "increase-pokemon-loyalty-happiness",
    ],
    "Amateur": [
        "win-eight-badges",
        "full-party-evolved-pokemon",
        "defeat-pokemon",
    ],
    "Ace": [
        "get-pokemon-related-job",
        "clear-victory-road",
        "catch-pro-rank-pokemon",
    ],
    "Pro": [
        "study-all-pokemon",
    ],
    "Master": [
        "defeat-pokemon-champion",
    ],
    "Champion": [
    ]
};
