import type { ThreegleState } from "$lib/constants/threegle";
import { generatePokemon, getAllItemsFromDb } from "$lib/server/database/functions";
import type { Actions } from "@sveltejs/kit";

export const load = async () => {
    const items = await getAllItemsFromDb();
    return { items };
};

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();

        const dataAsArray = [...data.entries()];

        console.log(dataAsArray);
        const types = dataAsArray.filter(([key, _]) => key.startsWith('type-')).map(([_, value]) => value as string);
        const ranks = dataAsArray.filter(([key, _]) => key.startsWith('rank-')).map(([_, value]) => value as string);
        const isEvolved = Number(data.get('stage')?.toString()) as ThreegleState;
        const isStarted = Number(data.get('starter')?.toString()) as ThreegleState;
        const isLegendary = Number(data.get('legendary')?.toString()) as ThreegleState;

        const { pokemon, moves} = await generatePokemon(types, ranks, isEvolved, isStarted, isLegendary);

        return { success: true, message: "OK", results: { pokemon, moves } };
    }
} satisfies Actions