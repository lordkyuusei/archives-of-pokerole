import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAllPokemonFromDb } from "$lib/server/database/functions";

export const load: PageServerLoad = async () => {
    const species = await getAllPokemonFromDb();

    return { species };
}
