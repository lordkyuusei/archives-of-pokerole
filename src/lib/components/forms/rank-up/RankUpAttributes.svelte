<script lang="ts">
    import type { Snippet } from 'svelte';

    import t from "$lib/i18n/i18n.svelte";
    import type { DbPokemonAttribute } from '$lib/types/mongo/pokemon';

    type Props = {
        attributes: { stat: DbPokemonAttribute; values: number[] }[];
        attributePoints: number;
        onNextTab: () => void;
        stat: Snippet<[string, number, number, number]>;
    };

    let { attributes = $bindable(), attributePoints, stat, onNextTab }: Props = $props();

    let attrIncreaseVal: number = $derived(attributes.reduce((acc, attr) => acc + attr.values[2], 0));
    let attrIncreasable: boolean = $derived(attrIncreaseVal < attributePoints);
    let attrDecreasable: boolean = $derived(0 < attrIncreaseVal && attrIncreaseVal <= attributePoints);
</script>

<rank-up-attributes>
    <h2>{t('form.training.remaining-points')} {attributePoints - attrIncreaseVal}</h2>
    <ul>
        {#each attributes as attr}
            {@const value = attr.values[0] + attr.values[2]}
            {@const decrDisabled = !(attrDecreasable && attr.values[2] > 0)}
            {@const incrDisabled = !(attrIncreasable && value < attr.values[1])}
            <li>
                <button class="round" disabled={decrDisabled} onclick={() => (attr.values[2] -= 1)}> ➖ </button>
                {@render stat(attr.stat, attr.values[0], value, attr.values[1])}
                <button class="round" disabled={incrDisabled} onclick={() => (attr.values[2] += 1)}> ➕ </button>
            </li>
        {/each}
    </ul>
    <button onclick={() => onNextTab()} disabled={attributePoints - attrIncreaseVal !== 0}>{t('next')}</button>
</rank-up-attributes>

<style>
    rank-up-attributes {
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
