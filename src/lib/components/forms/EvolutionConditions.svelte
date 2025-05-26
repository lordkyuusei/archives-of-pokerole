<script lang="ts">
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import { DEFAULT_PICTURE_URL } from '$lib/constants/urls';

    type Props = {
        species: WithId<DbPokemon>[];
        onNextTab: (specie: WithId<DbPokemon>) => void;
    };

    let { species, onNextTab }: Props = $props();
</script>

<rank-up-attributes>
    <h2>{t('evolution.conditions.title')}</h2>
    {#if species.length > 0}
        <ul>
            {#each species as specie}
                {@const evolution = specie['Evolutions'][0]}
                <li>
                    <h3>{specie['Name']}</h3>
                    <img src="{DEFAULT_PICTURE_URL}{Number(specie['DexID'])}.png" alt={specie['Name']} />
                    <p>
                        {t('evolution.conditions.condition')} {evolution['Kind']}, {t('evolution.conditions.prerequisites')} {evolution.Item ??
                            evolution.Special ??
                            evolution.Speed ??
                            evolution.Stat ??
                            evolution.Value}
                    </p>
                    <button onclick={() => onNextTab(specie)}>{t('evolution.condition.to')} {specie["Name"]}</button>
                </li>
            {/each}
        </ul>
    {:else}
        <p>{t('evolution.condition.error-to')}</p>
    {/if}
</rank-up-attributes>

<style>
    rank-up-attributes {
        display: grid;
        grid-template-rows: auto 1fr;
        gap: var(--small-gap);

        & > ul {
            display: grid;
            grid-auto-flow: column;
            gap: var(--medium-gap);
            margin: var(--large-gap);

            & > li {
                display: grid;
                grid-auto-flow: row;
                justify-items: center;
                background: var(--background-third-color);
                padding: var(--large-gap);
                border-radius: var(--large-gap);

                & > img {
                    width: 150px;
                }
            }
        }
    }
</style>
