import type { WithId } from "mongodb";

import t from '$lib/i18n/i18n.svelte';
import type { Box } from "$lib/types/box";
import type { DbPartnerPokemon } from "$lib/types/mongo/pokemon";

export const applyMigrationsToPokemon = (pokemons: DbPartnerPokemon[]) => {
    return pokemons.map(pokemon => {

        /* Update 25/05: adding default boxes to Pokemon */
        if (pokemon.box === undefined) {
            pokemon.box = 0;
        }

        return pokemon;
    });
}

const generateBoxes = (currentAmount: number, maxAmount: number): Box[] => Array.from({ length: maxAmount - currentAmount }).map((_, i) => ({
    id: parseInt(crypto.getRandomValues(new Uint32Array(1))[0].toString()),
    name: `${t('boxes.form.new-box-name')} ${i + currentAmount}`,
    selected: false
}));

export const applyMigrationsToBoxes = (boxes: Box[], defaultName: string): Box[] => {
    /* Update 25/05: adding boxes */
    if (boxes.length === 0) {
        return [{
            id: 0,
            name: defaultName,
            selected: true,
        }, ...generateBoxes(1, 20)];
    }

    /* Update 26/05: fixing box amount to 19 + pokémon team = 20*/
    if (boxes.length !== 20) {
        return [...boxes, ...generateBoxes(boxes.length, 20)];
    }

    return boxes;
}