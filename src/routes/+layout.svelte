<script lang="ts">
    import { onMount, setContext } from 'svelte';
    import { fly } from 'svelte/transition';

    import { dev } from '$app/environment';
    import t from '$lib/i18n/i18n.svelte';

    import { GET_POKEMON_SPECIES_MOVES } from '$lib/constants/api';
    import { setBox, setBoxes } from '$lib/state/boxes.svelte';
    import { setMoves, setPokemon, setPokemonParty, setSpecies } from '$lib/state/pokemon.svelte';
    import { setTrainer } from '$lib/state/trainer.svelte';
    import type { Box } from '$lib/types/box';
    import { type DbPartnerPokemon } from '$lib/types/mongo/pokemon';
    import type { Trainer } from '$lib/types/mongo/trainer';

    import LangSwitcher from '$lib/components/lodestones/LangSwitcher.svelte';
    import SearchResults from '$lib/components/lodestones/SearchResults.svelte';
    import SaveStateIcon from '$lib/components/SaveStateIcon.svelte';
    import { getSavingState, getStorageOrDefault } from '$lib/state/storage.svelte';
    import Settings from '$lib/components/lodestones/Settings.svelte';
    import { setSettings } from '$lib/state/settings.svelte.js';
    import type { Settings as _Settings } from '$lib/types/meta/settings.js';

    let { children, data } = $props();

    setContext('natures', () => data.natures);

    let debounce: NodeJS.Timeout | null;
    let showSearch: boolean = $state(false);
    let showOptions: boolean = $state(false);
    let isSaving = $derived(getSavingState());
    let results: { name: string; results: any[] }[] = $state([] as any);

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
        const settings = getStorageOrDefault<_Settings>('settings', {});
        const pokemonsData = getStorageOrDefault<DbPartnerPokemon[]>('team', []);
        const pokemonsBoxes = getStorageOrDefault<Box[]>('boxes', [{ id: 0, name: t('home.pokemon.title-team'), selected: true }]);
        const pokemonTrainer = getStorageOrDefault<Trainer | null>('trainer', null);

        const pokemonNames = pokemonsData.map((p) => p.specie).join(',');
        const pokemonMoves = pokemonsData.flatMap((p) => p.moves).join(',');
        const request = await fetch(`${GET_POKEMON_SPECIES_MOVES}?species=${pokemonNames}&moves=${pokemonMoves}`);
        const { species, moves } = await request.json();

        setSettings(settings);
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
            <a href="/">🔴 {t('home.layout.action-pokemon')}</a>
        </li>
        <li>
            <a href="/me">👤 {t('home.layout.action-me')}</a>
        </li>
        <li>
            <a href="/generator">🎰 {t('home.layout.action-generator')}</a>
        </li>
        <li class="navigation-group">
            <a href="#.">⇲ {t('home.layout.action-resources')}</a>
            <nav>
                <li>
                    <a href="/items">🎒 {t('home.layout.action-resources-items')}</a>
                </li>
            </nav>
        </li>
        {#if dev}
            <a href="/admin">
                ⚙️ {t('home.layout.action-admin')}
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
            <button class="primary" onclick={() => (showSearch = !showSearch)}>🔍 {t('home.layout.action-search')}</button>
        </li>
        <li>
            <button class="primary" onclick={() => (showOptions = !showOptions)}>⚙️ {t('home.layout.action-options')}</button>
        </li>
    </nav>
</header>

<main>
    {@render children()}
</main>

{#if showSearch}
    <aside class="wrapper search" data-title={t('home.layout.action-search')} transition:fly={{ duration: 250, x: '50' }}>
        <input type="text" placeholder={t('home.layout.placeholder-search')} oninput={({ currentTarget }) => search(currentTarget)} />
        <SearchResults bind:showSearch {results}></SearchResults>
    </aside>
{/if}
{#if showOptions}
    <aside class="wrapper settings" data-title={t('home.layout.title-options')} transition:fly={{ duration: 250, x: '50' }}>
        <Settings></Settings>
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
            align-content: center;
            gap: calc(var(--large-gap) * 2);

            & > li.navigation-group {
                position: relative;
                display: flex;
                flex-direction: column;

                &:hover > nav {
                    display: block;
                }

                & > nav {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background-color: var(--background-third-color);
                    z-index: 2;

                    & > li {
                        padding: var(--medium-gap);
                        width: 100%;
                        text-align: center;

                        & > a {
                            width: 100%;
                        }
                    }
                }
            }
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

        display: grid;
        grid-template: auto 1fr / 100%;
        gap: var(--large-gap);
        box-shadow: 0px 0px var(--large-gap) var(--small-gap) var(--background-color);

        &.search {
            grid-area: 2 / 2 / 2 / -1;
        }

        &.settings {
            grid-area: 2 / 3;
        }

        & > input {
            width: 100%;
            color: var(--text-color);
            margin-bottom: var(--large-gap);

            &::placeholder {
                color: var(--text-color);
                opacity: 0.5;
            }
        }
    }
</style>
