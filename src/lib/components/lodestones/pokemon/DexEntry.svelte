<script lang="ts">
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import t from '$lib/i18n/i18n.svelte';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';

    type Props = {
        pokemon: DbPokemon;
    };
    
    let { pokemon }: Props = $props();

    let lang: Lang = $derived(getLang());
    let heightUnit: string = $derived(lang === 'en' ? pokemon['Height']['Feet'] + '\"' : pokemon['Height']['Meters'] + ' m');
    let weightUnit: string = $derived(lang === 'en' ? pokemon['Weight']['Pounds'] + ' pounds' : pokemon['Weight']['Kilograms'] + ' kgs');
</script>

<dex-entry class="wrapper" data-title="Matricule">
    <h2 class="number">#{pokemon['Number']}</h2>
    <h1 class="name">{pokemon['Name']}</h1>
    <sub class="gentile">The {pokemon['DexCategory']}</sub>
    <q class="description">{pokemon['DexDescription']}</q>
    <code class="dimensions">
        {t('pokedex.pokemon.data-height')} {heightUnit} / {t('pokedex.pokemon.data-weight')} {weightUnit}
    </code>
    {#if pokemon['GoodStarter']}
        <img src="/icons/starter.svg" alt="Good starter" />
    {:else if pokemon['Legendary']}
        <img src="/icons/starter.svg" alt="Legendary" />
    {/if}
</dex-entry>

<style>
    dex-entry {
        display: grid;
        grid-auto-flow: row;
        grid-auto-rows: min-content;
        align-content: center;

        & > h2 {
            font-weight: bold;
            margin-bottom: 0;
        }

        q.description {
            max-height: 10svh;
            overflow: auto;
            text-align: justify;
            padding: var(--medium-gap);
            border-radius: var(--medium-gap);
            background-color: var(--background-fourth-color);
        }

        & > img {
            position: absolute;
            right: var(--large-gap);
            top: var(--large-gap);
        }
    }
</style>
