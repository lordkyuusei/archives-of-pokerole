<script lang="ts">
    import type { ObjectId } from 'mongodb';
    import type { Snippet } from 'svelte';

    import t from '$lib/i18n/i18n.svelte';
    import type { PokemonSkill } from '$lib/constants/skills';
    import type { DbPokemonAttribute, DbPokemonSocial } from '$lib/types/mongo/pokemon';

    type Props = {
        movesUpdates: [string[], ObjectId[]];
        attrUpdates: { stat: DbPokemonAttribute; values: number[] }[];
        socialUpdates: { stat: DbPokemonSocial; values: number[] }[];
        skillUpdates: { stat: PokemonSkill; values: number[] }[];
        stat: Snippet<[string, number, number, number]>;
        onPrevTab: () => void;
        onSubmit: () => void;
    };

    let { movesUpdates, attrUpdates, socialUpdates, skillUpdates, stat, onPrevTab, onSubmit }: Props = $props();
</script>

<rank-up-summary>
    <h2>{t('form.training.summary')}</h2>
    <div>
        <h3>{t('form.training.summary-attributes')}</h3>
        <ul>
            {#each attrUpdates as { stat: statistic, values }}
                <li>
                    {@render stat(`${statistic} (+${values[2]})`, values[0], values[0] + values[2], values[1])}
                </li>
            {/each}
        </ul>
        <h3>{t('form.training.summary-socials')}</h3>
        <ul>
            {#each socialUpdates as { stat: statistic, values }}
                <li>
                    {@render stat(`${statistic} (+${values[2]})`, values[0], values[0] + values[2], values[1])}
                </li>
            {/each}
        </ul>
        <h3>{t('form.training.summary-skills')}</h3>
        <ul>
            {#each skillUpdates as { stat: statistic, values }}
                <li>
                    {@render stat(`${statistic} (+${values[2]})`, values[0], values[0] + values[2], values[1])}
                </li>
            {/each}
        </ul>
        {#if movesUpdates[1].length}
            <h3>{t('form.training.summary-moveset')}</h3>
            <ul>
                {#each movesUpdates[1] as move}
                    <li>
                        <span>{move}: ✅</span>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
    <div class="dialog-actions">
        <button onclick={() => onPrevTab()}>{t('previous')}</button>
        <button onclick={() => onSubmit()}>{t('finish')}</button>
    </div>
</rank-up-summary>

<style>
    rank-up-summary {
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: var(--large-gap);
        min-height: 0;

        & > div {
            height: 100%;
            overflow: auto;

            & > h3 {
                margin-bottom: var(--large-gap);
            }

            & > ul {
                display: flex;
                flex-wrap: wrap;
                gap: var(--large-gap);

                & > li {
                    display: grid;
                    grid-template: 100% / auto 1fr auto;
                    gap: var(--large-gap);
                    align-items: start;
                }
            }
        }

        & > div.dialog-actions {
            display: flex;
            justify-content: space-between;
            gap: var(--medium-gap);
        }
    }
</style>
