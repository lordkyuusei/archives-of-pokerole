<script lang="ts">
    import type { WithId } from 'mongodb';
    import { onMount, setContext } from 'svelte';
    import { slide } from 'svelte/transition';

    import { dev } from '$app/environment';
    import t from '$lib/i18n/i18n.svelte';

    import type { Box } from '$lib/types/box.js';
    import { setTrainer } from '$lib/state/trainer.svelte.js';
    import type { Trainer } from '$lib/types/mongo/trainer.js';
    import { setBox, setBoxes } from '$lib/state/boxes.svelte.js';
    import { GET_POKEMON_SPECIES_MOVES } from '$lib/constants/api.js';
    import { type DbPartnerPokemon } from '$lib/types/mongo/pokemon.js';
    import {
        setMoves,
        setPokemon,
        setPokemonParty,
        setSpecies,
    } from '$lib/state/pokemon.svelte.js';

    import ItemListResult from '$lib/components/ItemListResult.svelte';
    import MoveListResult from '$lib/components/MoveListResult.svelte';
    import AbilityListResult from '$lib/components/AbilityListResult.svelte';
    import LangSwitcher from '$lib/components/lodestones/LangSwitcher.svelte';
    import NatureListResult from '$lib/components/NatureListResult.svelte';
    import PokemonListResult from '$lib/components/PokemonListResult.svelte';
    import { getSavingState, getStorageOrDefault } from '$lib/state/storage.svelte.js';
    import SaveStateIcon from '$lib/components/SaveStateIcon.svelte';

    let { children, data } = $props();

    setContext('natures', () => data.natures);

    let debounce: NodeJS.Timeout | null;
    let showSearch: boolean = $state(false);
    let isSaving = $derived(getSavingState());
    let results: { name: string; results: any[] }[] = $state([] as any);
    
    const mapCollectionToComponent = {
        Abilities: AbilityListResult,
        Items: ItemListResult,
        Moves: MoveListResult,
        Pokedex: PokemonListResult,
        Natures: NatureListResult,
    };

    const search = (target: EventTarget & HTMLInputElement) => {
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(async () => {
            const searchValue = target.value;
            if (searchValue.length < 3) results = [];
            else {
                const response = await fetch(`/api/search?q=${searchValue}`);
                results = await response.json();
            }
        }, 250);
    };

    onMount(async () => {
        const pokemonsData = getStorageOrDefault<DbPartnerPokemon[]>('team', []);
        const pokemonsBoxes = getStorageOrDefault<Box[]>('boxes', []);
        const pokemonTrainer = getStorageOrDefault<Trainer | null>('trainer', null);

        const pokemonNames = pokemonsData.map((p) => p.specie).join(',');
        const pokemonMoves = pokemonsData.flatMap((p) => p.moves).join(',');
        const request = await fetch(`${GET_POKEMON_SPECIES_MOVES}?species=${pokemonNames}&moves=${pokemonMoves}`);
        const { species, moves } = await request.json();

        setBoxes(pokemonsBoxes);
        setBox(pokemonsBoxes[0]);
        setTrainer(pokemonTrainer);
        setSpecies(species);
        setPokemonParty(pokemonsData);
        setMoves(moves);
        setPokemon(pokemonsData[0]);
    });
</script>

<header class="wrapper">
    <nav>
        <li>
            <a href="/">
                <img src="/logo.png" alt="logo" height="50" />
            </a>
        </li>
        <li></li>
        <li>
            <a href="/"><button class="primary">🔴 {t('home.layout.action-pokemon')}</button></a>
        </li>
        <li>
            <a href="/me"><button class="primary">👤 {t('home.layout.action-me')}</button></a>
        </li>
        <li>
            <a href="/generator"><button class="primary">🎰 {t('home.layout.action-generator')}</button></a>
        </li>
        {#if dev}
            <a href="/admin">
                <button class="primary">⚙️ {t('home.layout.action-admin')}</button>
            </a>
        {/if}
    </nav>
    <span></span>
    <nav>
        <li>
            <SaveStateIcon {isSaving}></SaveStateIcon>
        </li>
        <li>
            <LangSwitcher></LangSwitcher>
        </li>
        <li>
            <button class="primary" onclick={() => (showSearch = !showSearch)}
                >🔍 {t('home.layout.action-search')}</button
            >
        </li>
    </nav>
</header>

<main>
    {@render children()}
</main>

{#if showSearch}
    <aside class="wrapper" data-title={t('home.layout.action-search')} transition:slide={{ duration: 250 }}>
        <input
            type="text"
            placeholder={t('home.layout.placeholder-search')}
            oninput={({ currentTarget }) => search(currentTarget)}
        />
        <ul>
            {#each results as collection}
                {@const ListResultComponent = mapCollectionToComponent[collection.name]}
                {#if collection.results.length > 0}
                    <h2>{collection.name}</h2>
                    {#each collection.results as result (result._id)}
                        <ListResultComponent value={result}></ListResultComponent>
                    {/each}
                {/if}
            {/each}
        </ul>
    </aside>
{/if}

<style>
    header {
        grid-area: 1 / 1 / 1 / -1;

        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: var(--large-gap);
        padding-inline: var(--large-gap);

        & > nav {
            display: flex;
            align-items: center;
            gap: var(--large-gap);
        }
    }

    main {
        z-index: 1;
        grid-area: 2 / 1 / -1 / -1;

        display: grid;
        grid-template: subgrid / subgrid;
    }

    aside {
        z-index: 2;
        grid-area: 2 / 3 / 2 / 3;

        display: grid;
        grid-template: auto 1fr / 100%;
        box-shadow: 0px 0px var(--large-gap) var(--small-gap) var(--background-color);

        & > input {
            width: 100%;
            color: var(--text-color);
            margin-bottom: var(--large-gap);

            &::placeholder {
                color: var(--text-color);
                opacity: 0.5;
            }
        }

        & > ul {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--small-gap);
            overflow-y: auto;
        }
    }
</style>
