<script lang="ts">
    import t from "$lib/i18n/i18n.svelte";
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import { DEFAULT_PICTURE_URL } from '$lib/constants/urls';
    import { getIdFromName } from '$lib/functions/getIdFromName';

    type Props = {
        pokemon: DbPokemon;
    };

    let { pokemon }: Props = $props();
</script>

<evolution
    class="wrapper"
    style:--url="url('{DEFAULT_PICTURE_URL}{pokemon['Number']}.png')"
    data-title={t('pokedex.pokemon.title-evolution')}
>
    <ul>
        {#each pokemon['Evolutions'] as evolution}
            {@const name = evolution.From ?? evolution.To ?? ''}
            <h1><a href="/pokemon/{getIdFromName(name)}" data-sveltekit-reload>{name}</a></h1>
            {#each Object.entries(evolution) as [key, value]}
                <li>{key}: {value}</li>
            {/each}
        {/each}
    </ul>
</evolution>

<style>
    evolution {
        display: grid;
        grid-template: 1fr / 1fr;

        background-image: var(--url);
        background-blend-mode: overlay;
        background-position: bottom;
        background-repeat: no-repeat;
        background-size: contain;

        & > ul {
            overflow: auto;
            backdrop-filter: blur(var(--small-gap));
        }
    }
</style>
