import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getLearnersFromDb, getMoveFromDb } from "$lib/server/database/functions";

export const load: PageServerLoad = async ({ params }) => {
    const move = await getMoveFromDb(params.move);
    if (!move) return error(404, "Move not found");

    const pokemons = await getLearnersFromDb(move);

    return { pokemons, move };
}