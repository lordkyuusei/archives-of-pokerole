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

        const types = dataAsArray.filter(([key, _]) => key.startsWith('type-')).map(([_, value]) => value as string);

        const areTypesCombined = data.get('type-combination') === 'on';
        const isEvolved = Number(data.get('stage')?.toString()) as ThreegleState;
        const isStarted = Number(data.get('starter')?.toString()) as ThreegleState;
        const isLegendary = Number(data.get('legendary')?.toString()) as ThreegleState;

        console.log(areTypesCombined);
        const { pokemon, moves} = await generatePokemon(types, areTypesCombined, isEvolved, isStarted, isLegendary);

        return { success: true, message: "OK", results: { pokemon, moves } };
    }
} satisfies Actions