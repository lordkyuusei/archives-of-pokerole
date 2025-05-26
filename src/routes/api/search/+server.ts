import { searchDatabase } from "$lib/server/database/functions";
import { json, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ url }) => {
    const searchText = url.searchParams.get('q');
    if (!searchText) return json([]);

    const results = await searchDatabase(searchText);
    return json(results);
}