import { dev } from "$app/environment"
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    if (dev) {
        return {};
    } else {
        return error(404);
    }
}