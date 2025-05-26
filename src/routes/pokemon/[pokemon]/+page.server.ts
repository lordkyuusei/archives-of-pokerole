import { getMovesFromPokemon, getPokemonFromDb } from "$lib/server/database/functions";
import type { DbPokemon } from "$lib/types/mongo/pokemon";
import { error, json } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { pokemonRankOrder } from "$lib/constants/pokemonRank";

export const load: PageServerLoad = async ({ params }) => {
    const pokemon = await getPokemonFromDb(params.pokemon);
    if (!pokemon) return error(404, "Pokemon not found");

    const dbMoves = await getMovesFromPokemon(pokemon.Moves);
    const moves = dbMoves.toSorted((a, z) => {
        const aMove = pokemon.Moves.find(m => m.Name === a.Name);
        const zMove = pokemon.Moves.find(m => m.Name === z.Name);
        if (!aMove || !zMove) return 0;

        return pokemonRankOrder[aMove.Learned] - pokemonRankOrder[zMove.Learned];
    })

    return { pokemon, moves };
}