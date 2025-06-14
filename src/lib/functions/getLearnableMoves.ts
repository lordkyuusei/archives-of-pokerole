import type { WithId } from "mongodb";

import { pokemonRankOrder } from "$lib/constants/pokemonRank";
import type { DbPokemonMove, DbPokemonRank } from "$lib/types/mongo/pokemon";
import type { DbMove, DbMoveLight } from "$lib/types/mongo/move";
import { getIdFromName } from "./getIdFromName";

const getLearnableMoves = (moves: WithId<DbPokemonMove>[], rank: DbPokemonRank) => {
    const rankOrder = pokemonRankOrder[rank];

    const learnableMoves = moves.filter((move) => pokemonRankOrder[move["Learned"]] <= rankOrder);
    return learnableMoves.toSorted((a, z) => pokemonRankOrder[a["Learned"]] - pokemonRankOrder[z["Learned"]]);
}

export const getLearnableMovesData = (allMoves: WithId<DbMove>[], pkmnMoves: WithId<DbPokemonMove>[], rank: DbPokemonRank = "Master", knownMoves: string[] = []) => {
    const learnableMoves = getLearnableMoves(pkmnMoves, rank);
    const learnableMovesData = allMoves.filter((move) => {
        const id = move["_id"].toString();
        const moveIndex = learnableMoves.findIndex(pkmnMove => getIdFromName(pkmnMove["Name"]) === id);
        const learnedIndex = knownMoves.findIndex(knownMove => knownMove === id);

        return knownMoves.length ? (moveIndex !== -1 || learnedIndex !== -1) : moveIndex !== -1;
    });

    return learnableMovesData.toSorted((a, z) => a["Name"].localeCompare(z["Name"]));
}