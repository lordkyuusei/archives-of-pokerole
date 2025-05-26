import type { DbMoveCategory } from "$lib/types/mongo/move";
import type { DbPokemonRank } from "$lib/types/mongo/pokemon";

export const getIconFromRank = (rank: DbPokemonRank) => {
    const rankIcon: { [x in DbPokemonRank]: string } = {
        "Starter": "honorball.svg",
        "Beginner": "pokeball.svg",
        "Amateur": "superball.svg",
        "Ace": "hyperball.svg",
        "Pro": "memoryball.svg",
        "Master": "masterball.svg",
    }

    return rankIcon[rank];
}

export const getIconFromMoveCategory = (category: DbMoveCategory) => {
    const categoryIcon: { [x in DbMoveCategory]: string } = {
        "Physical": "physical.png",
        "Special": "special.png",
        "Support": "status.png",
    }

    return categoryIcon[category];
}