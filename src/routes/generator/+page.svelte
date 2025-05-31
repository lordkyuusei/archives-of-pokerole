<script lang="ts">
    import type { PageProps } from './$types';
    import POKEMON_TYPES from '$lib/constants/pokemonTypes';

    import t from '$lib/i18n/i18n.svelte';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';
    import { pokemonRankOrder } from '$lib/constants/pokemonRank';

    import Toggle from '$lib/components/fragments/Toggle.svelte';
    import { enhance } from '$app/forms';
    import { SPRITE_PICTURE_URL } from '$lib/constants/urls';

    let { form, data }: PageProps = $props();
    let currentLang: Lang = $derived(getLang());

    let nbrTypesFilter: number = $state(1);
</script>

<pokemon-generator>
    <form
        class="wrapper"
        method="POST"
        action="/generator"
        data-title={t('form.generator.title')}
        use:enhance={() => async ({ update }) => update({ reset: false })}>
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
                        <h3>#{pokemon['DexID']} {pokemon['Name']}</h3>
                        <p>
                            {pokemon['Type1']}{#if pokemon['Type2']}, {pokemon['Type2']}{/if}
                        </p>
                        <p>Starter: {pokemon.GoodStarter ? 'Yes' : 'No'}</p>
                    </li>
                {/each}
            </ul>
        {/if}
    </output>

    <div class="wrapper" data-title={t('form.pokemon.actions')}>
        <button>{t('form.generator.generate-selected')}</button>
    </div>
</pokemon-generator>

<style>
    pokemon-generator {
        grid-column: 1 / -1;

        display: grid;
        grid-template: subgrid / subgrid;
        gap: var(--large-gap);

        & > form {
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
                    grid-template-columns: auto 1fr auto auto;
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
