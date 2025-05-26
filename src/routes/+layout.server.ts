import { getNaturesFromDb } from "$lib/server/database/functions";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
    const natures = await getNaturesFromDb();

    return { natures };
}