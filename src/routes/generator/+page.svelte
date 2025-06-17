<script lang="ts">
    import POKEMON_TYPES from '$lib/constants/pokemonTypes';
    import type { PageProps } from './$types';

    import { pokemonRankOrder } from '$lib/constants/pokemonRank';
    import t from '$lib/i18n/i18n.svelte';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';

    import { enhance } from '$app/forms';
    import Toggle from '$lib/components/fragments/Toggle.svelte';
    import PokemonTypes from '$lib/components/PokemonTypes.svelte';
    import { rankUpSettings } from '$lib/constants/rankUpConfigs';
    import { SPRITE_PICTURE_URL } from '$lib/constants/urls';
    import { convertPokemonToPartner } from '$lib/functions/convertPokemonToPartner';
    import { generatePokemon } from '$lib/functions/generatePokemon';
    import { getBoxes } from '$lib/state/boxes.svelte';
    import { addPokemonToParty } from '$lib/state/pokemon.svelte';
    import type { DbPokemonRank } from '$lib/types/mongo/pokemon';
    import { goto } from '$app/navigation';
    import { redirect } from '@sveltejs/kit';

    let { form, data }: PageProps = $props();

    let boxes = $derived(getBoxes());
    let currentLang: Lang = $derived(getLang());

    let selectedNames: string[] = $state([]);
    let nbrTypesFilter: number = $state(1);

    const generatePokemons = (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => {
        event.preventDefault();
        const { elements } = event.currentTarget;

        const rank1 = (elements.namedItem('rank-1') as HTMLSelectElement).value as DbPokemonRank;
        const rank2 = (elements.namedItem('rank-2') as HTMLSelectElement).value as DbPokemonRank;
        const boxId = (elements.namedItem('box-id') as HTMLSelectElement).value;

        const rank1Boundary = rankUpSettings.findIndex((r) => r.to === rank1);
        const rank2Boundary = rankUpSettings.findIndex((r) => r.to === rank2);
        if (rank1Boundary === -1 || rank2Boundary === -1) return;

        const generatedPokemons = selectedNames.map((name) => {
            const pokemon = form?.results.find((p) => p._id.toString() === name);
            if (!pokemon) return { pokemon: null, rawPokemonData: null };

            const randomRank = Math.floor(Math.random() * (Math.abs(rank1Boundary - rank2Boundary) + 1)) + Math.min(rank1Boundary, rank2Boundary);
            const randomNature = data.natures[Math.floor(Math.random() * data.natures.length)].Nature.split(' ')[0];

            return generatePokemon(pokemon, randomRank, randomNature, boxId);
        });

        generatedPokemons.forEach(({ pokemon, rawPokemonData }) => {
            if (!pokemon || !rawPokemonData) return;

            const partnerPokemon = convertPokemonToPartner(pokemon, rawPokemonData);
            addPokemonToParty(partnerPokemon);
        });

        goto('/', { invalidateAll: true });
};
</script>

<pokemon-generator>
    <form
        class="wrapper"
        method="POST"
        action="/generator"
        data-title={t('form.generator.title')}
        use:enhance={() =>
            async ({ update }) =>
                update({ reset: false })}>
        <div>
            <fieldset>
                <legend>Types</legend>
                {#each Array.from({ length: nbrTypesFilter }) as _, index}
                    <label for="type-{index + 1}">Type {index + 1}</label>
                    <select id="type-{index + 1}" name="type-{index + 1}">
                        {#each POKEMON_TYPES as type}
                            <option value={type.i18n.en}>{type.i18n[currentLang]}</option>
                        {/each}
                    </select>
                {/each}
                <button onclick={() => nbrTypesFilter++} type="button">
                    {t('form.generator.add-type')}
                </button>
                {#if nbrTypesFilter > 1}
                    <button onclick={() => nbrTypesFilter--} type="button">
                        {t('form.generator.remove-type')}
                    </button>
                {/if}
            </fieldset>
            <fieldset>
                <legend>Stade</legend>
                <label for="stage">Evolué ?</label>
                <Toggle name="stage" toggled={false}></Toggle>
                <label for="starter">Pokémon starter ?</label>
                <Toggle name="starter" toggled={false}></Toggle>
            </fieldset>
        </div>
        <button type="submit">{t('form.generator.generate')}</button>
    </form>

    <output class="wrapper" data-title={t('form.generator.output')}>
        {#if form?.success}
            <ul>
                {#each form.results as pokemon}
                    <li>
                        <img class="sprite" src="{SPRITE_PICTURE_URL}{pokemon['Number']}.png" alt={pokemon['Name']} />
                        <h3>#{pokemon['Number']}</h3>
                        <h2 title={pokemon['I18n'][currentLang]}>{pokemon['I18n'][currentLang]}</h2>
                        <p>
                            <PokemonTypes types={[pokemon['Type1'], pokemon['Type2']]}></PokemonTypes>
                        </p>
                        <input type="checkbox" bind:group={selectedNames} value={pokemon['_id'].toString()} />
                    </li>
                {/each}
            </ul>
        {/if}
    </output>

    <div class="wrapper" data-title={t('form.pokemon.actions')}>
        <form onsubmit={generatePokemons}>
            <div>
                <fieldset disabled={!selectedNames.length}>
                    <legend>Rang</legend>
                    <label for="rank-1">Entre le rang</label>
                    <select id="rank-1" name="rank-1">
                        {#each Object.keys(pokemonRankOrder) as rank}
                            <option value={rank}>{rank}</option>
                        {/each}
                    </select>
                    <label for="rank-2">Et le rang</label>
                    <select id="rank-2" name="rank-2">
                        {#each Object.keys(pokemonRankOrder) as rank}
                            <option value={rank}>{rank}</option>
                        {/each}
                    </select>
                </fieldset>
                <fieldset disabled={!selectedNames.length}>
                    <legend>Sauvegarde</legend>
                    <label for="box-id">Boîte</label>
                    <select id="box-id" name="box-id">
                        {#each boxes as box}
                            <option value={box.id}>{box.name}</option>
                        {/each}
                    </select>
                </fieldset>
            </div>
            <button disabled={!selectedNames.length} type="submit">
                {t('form.generator.generate-selected').replace('$1', `${selectedNames.length}`)}
            </button>
        </form>
    </div>
</pokemon-generator>

<style>
    pokemon-generator {
        grid-column: 1 / -1;

        display: grid;
        grid-template: subgrid / subgrid;
        gap: var(--large-gap);

        & > form,
        & > div > form {
            grid-column: 1;

            display: grid;
            grid-template-rows: 1fr auto;
            height: 100%;
            gap: var(--large-gap);

            & div {
                display: flex;
                flex-direction: column;
                gap: var(--large-gap);
                overflow-y: auto;

                > fieldset {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-auto-rows: 1fr;
                    align-items: center;
                    gap: var(--medium-gap);

                    padding: var(--medium-gap);
                    border-radius: var(--medium-gap);
                    background-color: var(--background-fourth-color);

                    & > legend {
                        grid-column: 1 / -1;

                        color: var(--background-color);
                        border-radius: var(--small-gap);
                        padding-inline: var(--medium-gap);
                        background-color: var(--second-color);
                    }

                    & > button {
                        grid-column: 1 / -1;
                    }
                }
            }
        }

        & > output {
            grid-column: 2;
            height: 100%;

            & > ul {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;

                & > li {
                    display: grid;
                    grid-auto-flow: column;
                    grid-template-columns: auto 0.25fr 1fr 0.5fr auto;
                    align-items: center;
                    gap: var(--large-gap);

                    padding-inline: var(--small-gap) var(--large-gap);
                    border: 1px solid var(--background-color);
                    background-color: var(--background-third-color);

                    & > * {
                        margin: 0;
                    }
                }
            }
        }

        & > div {
            grid-column: 3;
        }
    }
</style>
