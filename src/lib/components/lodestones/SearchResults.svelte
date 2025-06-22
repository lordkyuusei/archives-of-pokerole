<script lang="ts">
    import type { WithId } from 'mongodb';

    import type { DbAbility } from '$lib/types/mongo/ability';
    import type { DbItem } from '$lib/types/mongo/item';
    import type { DbMove } from '$lib/types/mongo/move';
    import type { DbNature } from '$lib/types/mongo/nature';
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import t from '$lib/i18n/i18n.svelte';
    import AbilityListResult from '../search/AbilityListResult.svelte';
    import ItemListResult from '../search/ItemListResult.svelte';
    import MoveListResult from '../search/MoveListResult.svelte';
    import NatureListResult from '../search/NatureListResult.svelte';
    import PokemonListResult from '../search/PokemonListResult.svelte';

    type CollectionKeys = {
        Pokedex: (keyof DbPokemon)[];
        Abilities: (keyof DbAbility)[];
        Natures: (keyof DbNature)[];
        Items: (keyof DbItem)[];
        Moves: (keyof DbMove)[];
    };

    type CollectionName = 'Pokedex' | 'Abilities' | 'Natures' | 'Items' | 'Moves';

    type ComponentProps =
        | { name: 'Pokedex'; results: WithId<DbPokemon>[] }
        | { name: 'Abilities'; results: WithId<DbAbility>[] }
        | { name: 'Natures'; results: WithId<DbNature>[] }
        | { name: 'Items'; results: WithId<DbItem>[] }
        | { name: 'Moves'; results: WithId<DbMove>[] };

    type ComponentMap = {
        Pokedex: typeof PokemonListResult;
        Abilities: typeof AbilityListResult;
        Natures: typeof NatureListResult;
        Items: typeof ItemListResult;
        Moves: typeof MoveListResult;
    };

    type Props = {
        showSearch: boolean;
        results: ComponentProps[];
    };

    let { showSearch = $bindable(), results }: Props = $props();

    const mapCollectionToKeys: CollectionKeys = {
        Pokedex: ['Number', 'Name', 'Type1', 'Type2', 'GoodStarter', 'Legendary'],
        Abilities: ['Name', 'Description', 'Effect'],
        Natures: ['Name', 'Confidence', 'Keywords'],
        Items: ['Name', 'Pocket', 'Category', 'Description', 'TrainerPrice'],
        Moves: ['Name', 'Type', 'Category', 'Damage1', 'Damage2', 'Accuracy1', 'Accuracy2'],
    };

    const mapCollectionToComponent: ComponentMap = {
        Pokedex: PokemonListResult,
        Abilities: AbilityListResult,
        Natures: NatureListResult,
        Items: ItemListResult,
        Moves: MoveListResult,
    };
</script>

<output>
    {#if results.length === 0}
        <p>{t('home.search.start-searching')}</p>
    {:else}
        <ul style="display: flex;">
            <li class="buttons-group" style:flex="1">
                <a href="#abilities"><button class="group">Abilities</button></a>
            </li>
            <li class="buttons-group" style:flex="1">
                <a href="#moves"><button class="group">Moves</button></a>
            </li>
            <li class="buttons-group" style:flex="1">
                <a href="#pokedex"><button class="group">Pokedex</button></a>
            </li>
            <li class="buttons-group" style:flex="1">
                <a href="#natures"><button class="group">Natures</button></a>
            </li>
            <li class="buttons-group" style:flex="1">
                <a href="#items"><button class="group">Items</button></a>
            </li>
        </ul>
    {/if}
    {#each results as collection}
        <h1 id={collection.name.toLocaleLowerCase()}>{collection.name}</h1>
        {#if collection.results.length > 0}
            {@const keys = mapCollectionToKeys[collection.name as CollectionName]}
            <table>
                <thead>
                    <tr>
                        {#each keys as key, i}
                            <th>{key}</th>
                        {/each}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each collection.results as result}
                        {@const Component = mapCollectionToComponent[collection.name as CollectionName]}
                        <Component {keys} value={result} bind:showSearch></Component>
                    {/each}
                </tbody>
            </table>
        {:else}
            <p>{t('home.search.no-results')}</p>
        {/if}
    {/each}
</output>

<style>
    output {
        overflow-x: auto;

        & > table {
            & > thead {
                & > tr > th {
                    &:last-of-type {
                        width: 0;
                    }
                }
            }
            & > tbody {
            }
        }
    }
</style>
