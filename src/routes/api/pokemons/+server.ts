import { pokemonRankOrder } from "$lib/constants/pokemonRank";
import { searchDatabaseMult } from "$lib/server/database/functions";
import { json, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ url }) => {
    const pokemonSearchText = url.searchParams.get('species');
    const movesSearchText = url.searchParams.get('moves');
    if (!pokemonSearchText || !movesSearchText) return json([]);

    const { species, moves } = await searchDatabaseMult(pokemonSearchText, movesSearchText);

    const movesList = species.map(x => x.Moves).flat();

    const sortedMoves = moves.toSorted((a, z) => {
        const aMove = movesList.find(m => m.Name === a.Name);
        const zMove = movesList.find(m => m.Name === z.Name);
        if (!aMove || !zMove) return 0;

        return pokemonRankOrder[aMove.Learned] - pokemonRankOrder[zMove.Learned];
    });

    return json({ species, moves: sortedMoves });
}