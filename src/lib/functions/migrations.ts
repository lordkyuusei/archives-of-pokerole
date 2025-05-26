import type { WithId } from "mongodb";

import t from '$lib/i18n/i18n.svelte';
import type { Box } from "$lib/types/box";
import type { DbPartnerPokemon } from "$lib/types/mongo/pokemon";

export const applyMigrationsToPokemon = (pokemons: WithId<DbPartnerPokemon>[]) => {
    return pokemons.map(pokemon => {

        /* Update 25/05: adding default boxes to Pokemon */
        if (pokemon.box === undefined) {
            pokemon.box = 0;
        }

        return pokemon;
    });
}

export const applyMigrationsToBoxes = (boxes: Box[], defaultName: string) => {
    /* Update 25/05: adding boxes */
    if (boxes.length === 0) {
        return [{
            id: 0,
            name: defaultName
        }];
    }

    if (boxes.length !== 20) {
        const additionalBoxes: Box[] = Array.from({ length: 20 - boxes.length }).map((_, i) => (
            {
                id: parseInt(crypto.getRandomValues(new Uint32Array(1))[0].toString()),
                name: `${t('boxes.form.new-box-name')} ${i + boxes.length}`,
            }
        ));

        return [...boxes, ...additionalBoxes];
    }

    return boxes;
}