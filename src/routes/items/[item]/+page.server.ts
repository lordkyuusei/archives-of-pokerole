import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getItemFromDb } from "$lib/server/database/functions";

export const load: PageServerLoad = async ({ params }) => {
    const item = await getItemFromDb(params.item);
    if (!item) return error(404, "Item not found");

    return { item };
}