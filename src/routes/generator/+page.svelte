<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { fly } from 'svelte/transition';

    import Toggle from '$lib/components/fragments/Toggle.svelte';
    import PokemonTypes from '$lib/components/PokemonTypes.svelte';

    import Threeggle from '$lib/components/fragments/Threeggle.svelte';
    import { pokemonRankOrder } from '$lib/constants/pokemonRank';
    import POKEMON_TYPES from '$lib/constants/pokemonTypes';
    import { rankUpSettings } from '$lib/constants/rankUpConfigs';
    import { SPRITE_PICTURE_URL } from '$lib/constants/urls';
    import { convertPokemonToPartner } from '$lib/functions/convertPokemonToPartner';
    import { findLowestRankPossible, findPokemonArchetype, generatePokemon } from '$lib/functions/generatePokemon';
    import t from '$lib/i18n/i18n.svelte';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';
    import { getBoxes } from '$lib/state/boxes.svelte';
    import { addPokemonToParty } from '$lib/state/pokemon.svelte';
    import type { DbPokemonRank } from '$lib/types/mongo/pokemon';
    import type { PageProps } from './$types';

    let { form, data }: PageProps = $props();

    let boxes = $derived(getBoxes());
    let currentLang: Lang = $derived(getLang());

    let pokemonList = $derived(form?.results.pokemon || []);
    let movesList = $derived(form?.results.moves || []);

    let nbrTypesFilter: number = $state(1);
    let selectedNames: string[] = $state([]);
    let isAllChecked: boolean = $state(false);
    let isRange: boolean = $state(false);
    let allowedRanks: string[] = $state(Object.keys(pokemonRankOrder).splice(1));

    const generatePokemons = (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => {
        event.preventDefault();
        const { elements } = event.currentTarget;

        const rank1 = (elements.namedItem('rank-1') as HTMLSelectElement).value as DbPokemonRank;
        const rank2 = (elements.namedItem('rank-2') as HTMLSelectElement).value as DbPokemonRank;
        const boxId = (elements.namedItem('box-id') as HTMLSelectElement).value;
        const isRange = (elements.namedItem('rank-range') as HTMLInputElement).checked;
        const isStrategic = (elements.namedItem('is-strategic') as HTMLInputElement).checked;

        const rank1Boundary = rankUpSettings.findIndex((r) => r.to === rank1);
        const rank2Boundary = rankUpSettings.findIndex((r) => r.to === rank2);
        if (rank1Boundary === -1 || (isRange && rank2Boundary === -1)) return;

        const generatedPokemons = selectedNames.map((name) => {
            const pokemon = pokemonList.find((p) => p._id.toString() === name);
            if (!pokemon) return { pokemon: null, rawPokemonData: null };
            const moveset = movesList.filter((m) => pokemon['Moves'].flatMap((x) => x.Name).includes(m['Name']));
            if (moveset.length === 0) return { pokemon: null, rawPokemonData: null };

            const randomNature = data.natures[Math.floor(Math.random() * data.natures.length)].Nature.split(' ')[0];
            const lowestRank = findLowestRankPossible([pokemon]);
            const nonNegociableLowerBoundary = pokemonRankOrder[lowestRank];

            let chosenRank = nonNegociableLowerBoundary;

            if (isRange) {
                chosenRank =
                    Math.floor(Math.random() * (Math.abs(nonNegociableLowerBoundary - rank2Boundary) + 1)) +
                    Math.min(nonNegociableLowerBoundary, rank2Boundary);
            } else {
                const isChosenRankValid = nonNegociableLowerBoundary <= rank1Boundary;
                const rankSettingIndex = rankUpSettings.findIndex((r) => (isChosenRankValid ? r.to === rank1 : r.to === lowestRank));
                if (rankSettingIndex === -1) return;

                chosenRank = rankSettingIndex;
            }

            return generatePokemon(pokemon, moveset, chosenRank, randomNature, boxId, isStrategic);
        });

        generatedPokemons.forEach(({ pokemon, rawPokemonData }) => {
            if (!pokemon || !rawPokemonData) return;

            const partnerPokemon = convertPokemonToPartner(pokemon, rawPokemonData);
            addPokemonToParty(partnerPokemon);
        });

        goto('/', { invalidateAll: true });
    };

    const toggleCheckAll = () => {
        if (selectedNames.length === 0) {
            selectedNames = pokemonList.map((pokemon) => pokemon._id.toString()) || [];
        } else {
            selectedNames = [];
        }
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
                <label for="type-combination">Combiner les types ?</label>
                <Toggle name="type-combination" toggled={false}></Toggle>
                <button onclick={() => nbrTypesFilter++} type="button">
                    {t('form.generator.add-type')}
                </button>
                <button onclick={() => nbrTypesFilter--} type="button" disabled={nbrTypesFilter === 1}>
                    {t('form.generator.remove-type')}
                </button>
            </fieldset>
            <fieldset>
                <legend>Stade</legend>
                <label for="stage">Evolué ?</label>
                <Threeggle name="stage"></Threeggle>
                <label for="starter">Pokémon starter ?</label>
                <Threeggle name="starter"></Threeggle>
                <label for="legendary">Légendaire ?</label>
                <Threeggle name="legendary"></Threeggle>
            </fieldset>
        </div>
        <button type="submit">{t('form.generator.generate')}</button>
    </form>

    <output class="wrapper" data-title={t('form.generator.output')}>
        <ul class:results={form?.success}>
            <li>
                <span> Sprite </span>
                <span> N° </span>
                <span> Nom </span>
                <span> Type(s) </span>
                <input type="checkbox" bind:checked={isAllChecked} oninput={() => toggleCheckAll()} />
            </li>
            {#if form?.success}
                {#each pokemonList as pokemon, i (pokemon['_id'])}
                    <li in:fly|global={{ delay: 75 * i }}>
                        <img class="sprite" src="{SPRITE_PICTURE_URL}{pokemon['Number']}.png" alt={pokemon['Name']} />
                        <h3>#{pokemon['Number']}</h3>
                        <h2 title={pokemon['I18n'][currentLang]}>
                            <a href="/pokemon/{pokemon['_id']}" target="_blank" class="link"> {pokemon['I18n'][currentLang]}</a>
                        </h2>
                        <p>
                            <PokemonTypes types={[pokemon['Type1'], pokemon['Type2']]} helperPosition={i >= pokemonList.length / 2 ? 'top' : 'bottom'}
                            ></PokemonTypes>
                        </p>
                        <input type="checkbox" bind:group={selectedNames} value={pokemon['_id'].toString()} />
                    </li>
                {/each}
            {:else}
                <li>
                    <p>🗒️{t('form.generator.tutorial')}</p>
                </li>
                <li>
                    <p>❗{t('form.generator.generation-info')}</p>
                </li>
            {/if}
        </ul>
    </output>

    <div class="wrapper" data-title={t('form.pokemon.actions')}>
        <form onsubmit={generatePokemons}>
            <div>
                <fieldset disabled={!selectedNames.length}>
                    <legend>Rang</legend>
                    <label for="rank-1">{isRange ? 'Entre le rang' : 'Rang'}</label>
                    <select id="rank-1" name="rank-1">
                        {#each allowedRanks as rank}
                            <option value={rank}>{rank}</option>
                        {/each}
                    </select>
                    <label for="rank-range">Définir un intervalle</label>
                    <Toggle name="rank-range" bind:toggled={isRange}></Toggle>
                    <label for="rank-2">Et le rang</label>
                    <select id="rank-2" name="rank-2" disabled={!isRange}>
                        {#each allowedRanks as rank}
                            <option value={rank}>{rank}</option>
                        {/each}
                    </select>
                </fieldset>
                <fieldset disabled={!selectedNames.length}>
                    <legend>Stratégie</legend>
                    <label for="is-strategic">Stratégique ?</label>
                    <Toggle name="is-strategic" toggled={false}></Toggle>
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
                    gap: var(--large-gap) var(--medium-gap);

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
                height: 100%;
                overflow-y: auto;
                gap: var(--medium-gap);

                &:not(.results) {

                    & > li p {
                        grid-column: 1 / -1;
                    }
                }

                & > li {
                    display: grid;
                    grid-auto-flow: column;
                    grid-template-columns: auto 0.25fr 1fr 0.5fr auto;
                    align-items: center;
                    gap: var(--large-gap);

                    padding-inline: var(--small-gap) var(--large-gap);
                    border: 1px solid var(--background-color);
                    background-color: var(--background-third-color);

                    &:first-child {
                        font-weight: bold;
                        background-color: var(--background-fourth-color);
                        padding-inline: var(--large-gap) var(--large-gap);

                        & > input {
                            height: var(--large-gap);
                        }
                    }

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
