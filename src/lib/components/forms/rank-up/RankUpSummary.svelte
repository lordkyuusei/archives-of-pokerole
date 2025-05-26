<script lang="ts">
    import type { ObjectId } from 'mongodb';
    import type { Snippet } from 'svelte';

    import t from "$lib/i18n/i18n.svelte";
    import type { PokemonSkill } from '$lib/constants/skills';
    import type { DbPokemonAttribute, DbPokemonSocial } from '$lib/types/mongo/pokemon';

    type Props = {
        attrUpdates: { stat: DbPokemonAttribute; values: number[] }[];
        socialUpdates: { stat: DbPokemonSocial; values: number[] }[];
        skillUpdates: { stat: PokemonSkill; values: number[] }[];
        learnedMoves: ObjectId[];
        stat: Snippet<[string, number, number, number]>;
        onPrevTab: () => void;
        onSubmit: () => void;
    };

    let { attrUpdates, socialUpdates, skillUpdates, learnedMoves, stat, onPrevTab, onSubmit }: Props = $props();
</script>

<rank-up-summary>
    <h2>{t('form.training.summary')}</h2>
    <ul>
        {#each [...attrUpdates, ...socialUpdates, ...skillUpdates] as { stat: statistic, values }}
            <li>
                {@render stat(statistic, values[0], values[0] + values[2], values[1])}
                <span>+{values[2]}</span>
            </li>
        {/each}
        {#each learnedMoves as move}
            <li>
                <span>{move}: ✅</span>
            </li>
        {/each}
    </ul>
    <div style="display: grid; grid-auto-flow: column; gap: var(--medium-gap);">
        <button onclick={() => onPrevTab()}>{t('previous')}</button>
        <button onclick={() => onSubmit()}>{t('finish')}</button>
    </div>
</rank-up-summary>

<style>
    ul {
        display: grid;
        grid-template: repeat(5, 1fr) / repeat(3, 1fr);
        gap: var(--medium-gap);
        margin: var(--large-gap);

        & > li {
            display: grid;
            grid-template: 100% / auto 1fr auto;
            gap: var(--medium-gap);
            align-items: center;
        }
    }
</style>
