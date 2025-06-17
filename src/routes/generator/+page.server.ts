import { generatePokemon } from "$lib/server/database/functions";
import type { Actions } from "@sveltejs/kit";

type FormData = {
    [key: string]: string,
    'rank-1': string,
    'rank-2': string,
    stage: 'on' | 'off',
    starter: 'on' | 'off',
}

export const load = () => {

};

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();

        const dataAsArray = [...data.entries()];

        const types = dataAsArray.filter(([key, _]) => key.startsWith('type-')).map(([_, value]) => value as string);
        const ranks = dataAsArray.filter(([key, _]) => key.startsWith('rank-')).map(([_, value]) => value as string);
        const isEvolved = data.get('stage') === 'on';
        const isStarted = data.get('starter') === 'on';

        const results = await generatePokemon(types, ranks, isEvolved, isStarted);

        return { success: true, message: "OK", results: results };
    }
} satisfies Actions