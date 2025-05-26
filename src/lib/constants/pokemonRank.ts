import type { DbPokemonRank } from "$lib/types/mongo/pokemon";

export const pokemonRankOrder: { [x in DbPokemonRank]: number} = {
    "None": 0,
    "Starter": 1,
    "Beginner": 2,
    "Amateur": 3,
    "Ace": 4,
    "Pro": 5,
    "Master": 6
} 