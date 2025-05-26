<script lang="ts">
    import { setContext } from 'svelte';
    import { slide } from 'svelte/transition';

    import t from '$lib/i18n/i18n.svelte';

    import ItemListResult from '$lib/components/ItemListResult.svelte';
    import MoveListResult from '$lib/components/MoveListResult.svelte';
    import NatureListResult from '$lib/components/NatureListResult.svelte';
    import PokemonListResult from '$lib/components/PokemonListResult.svelte';
    import AbilityListResult from '$lib/components/AbilityListResult.svelte';
    import LangSwitcher from '$lib/components/lodestones/LangSwitcher.svelte';

    let { children, data } = $props();

    setContext('natures', () => data.natures);

    let isOpen: boolean = $state(false);
    let results: { name: string; results: any[] }[] = $state([] as any);
    let debounce: number | null;

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
</script>

<header class="wrapper">
    <a href="/">
        <img src="/logo.png" alt="logo" height="50" />
    </a>
    <button class="primary" onclick={() => (isOpen = !isOpen)}>🔍 {t('home.layout.action-search')}</button>
    <a href="/me"><button class="primary">👤 {t('home.layout.action-me')}</button></a>
    <LangSwitcher></LangSwitcher>
</header>

<main>
    {@render children()}
</main>

{#if isOpen}
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
        grid-template-columns: 1fr auto auto auto;
        align-items: center;
        gap: var(--large-gap);
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
            padding: var(--small-gap);
            border-radius: var(--large-gap);
            margin-bottom: var(--large-gap);
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
