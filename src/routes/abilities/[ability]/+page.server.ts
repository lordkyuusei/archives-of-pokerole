import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAbilityFromDb, getAbilityLearnersFromDb } from "$lib/server/database/functions";

export const load: PageServerLoad = async ({ params }) => {
    const ability = await getAbilityFromDb(params.ability);
    if (!ability) return error(404, "Ability not found");

    const pokemons = await getAbilityLearnersFromDb(ability);

    return { pokemons, ability };
}