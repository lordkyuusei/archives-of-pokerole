<script lang="ts">
    import type { Snippet } from 'svelte';

    import t from "$lib/i18n/i18n.svelte";
    import type { DbPokemonSocial } from '$lib/types/mongo/pokemon';

    type Props = {
        socials: { stat: DbPokemonSocial; values: number[] }[];
        socialPoints: number;
        onNextTab: () => void;
        onPrevTab: () => void;
        stat: Snippet<[string, number, number, number]>;
    };

    let { socials = $bindable(), socialPoints, stat, onNextTab, onPrevTab }: Props = $props();

    let socIncreaseVal: number = $derived(socials.reduce((acc, attr) => acc + attr.values[2], 0));
    let socIncreasable: boolean = $derived(socIncreaseVal < socialPoints);
    let socDecreasable: boolean = $derived(0 < socIncreaseVal && socIncreaseVal <= socialPoints);
</script>

<rank-up-socials>
    <h2>{t('form.training.remaining-points')} {socialPoints - socIncreaseVal}</h2>
    <ul>
        {#each socials as soc}
            {@const value = soc.values[0] + soc.values[2]}
            {@const decrDisabled = !(socDecreasable && soc.values[2] > 0)}
            {@const incrDisabled = !(socIncreasable && value < soc.values[1])}
            <li>
                <button class="round" disabled={decrDisabled} onclick={() => (soc.values[2] -= 1)}> ➖ </button>
                {@render stat(soc.stat, soc.values[0], value, soc.values[1])}
                <button class="round" disabled={incrDisabled} onclick={() => (soc.values[2] += 1)}> ➕ </button>
            </li>
        {/each}
    </ul>
    <div style="display: grid; grid-auto-flow: column; gap: var(--medium-gap);">
        <button onclick={() => onPrevTab()}>{t('previous')}</button>
        <button onclick={() => onNextTab()}>{t('next')}</button>
    </div>
</rank-up-socials>

<style>
    rank-up-socials {
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: var(--small-gap);

        & > ul {
            display: grid;
            grid-template: repeat(5, 1fr) / repeat(3, 1fr);
            gap: var(--medium-gap);
            margin: var(--large-gap);

            & > li {
                grid-column: 2;

                display: grid;
                grid-template: 100% / auto 1fr auto;
                gap: var(--medium-gap);
                align-items: center;
            }
        }
    }
</style>
