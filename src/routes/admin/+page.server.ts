import { dev } from "$app/environment"
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";
import { getAllItemsFromDb } from "$lib/server/database/functions";

export const load: PageServerLoad = async () => {
    if (dev) {
        const items = await getAllItemsFromDb();
        return { items };
    } else {
        return error(404);
    }
}