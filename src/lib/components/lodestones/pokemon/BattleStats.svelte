<script lang="ts">
    import PokemonTypes from '$lib/components/PokemonTypes.svelte';
    import { getIdFromName } from '$lib/functions/getIdFromName';
    import type { DbPokemon } from '$lib/types/mongo/pokemon';

    type Props = {
        pokemon: DbPokemon;
    };

    let { pokemon }: Props = $props();
</script>

{#snippet stat(name: string, base: number, max: number)}
    <li class="stat">
        <span>{name}</span>
        <ul class="values">
            {#each Array.from({ length: max }) as _, i}
                <li class="value" class:filled={i < base}></li>
            {/each}
        </ul>
    </li>
{/snippet}

<battle-stats class="wrapper" data-title="Statistiques de combat">
    <PokemonTypes helperPosition="top" types={[pokemon['Type1'], pokemon['Type2']]}></PokemonTypes>
    <ul class="abilities">
        <li><a href="/abilities/{getIdFromName(pokemon['Ability1'])}">{pokemon['Ability1']}</a></li>
        {#if pokemon['Ability2'] !== ''}
            <li><a href="/abilities/{getIdFromName(pokemon['Ability2'])}">{pokemon['Ability2']}</a></li>
        {/if}
        {#if pokemon['HiddenAbility'] !== ''}
            <li style:font-style="italic">
                <a href="/abilities/{getIdFromName(pokemon['HiddenAbility'])}">* {pokemon['HiddenAbility']}</a>
            </li>
        {/if}
    </ul>
    <ul class="stats">
        {@render stat('B.HP', pokemon['BaseHP'], pokemon['BaseHP'])}
        {@render stat('STR.', pokemon['Strength'], pokemon['MaxStrength'])}
        {@render stat('DEX.', pokemon['Dexterity'], pokemon['MaxDexterity'])}
        {@render stat('VIT.', pokemon['Vitality'], pokemon['MaxVitality'])}
        {@render stat('SPE.', pokemon['Special'], pokemon['MaxSpecial'])}
        {@render stat('INS.', pokemon['Insight'], pokemon['MaxInsight'])}
    </ul>
</battle-stats>

<style>
    battle-stats {
        display: grid;
        grid-auto-flow: row;
        grid-auto-rows: min-content;
        gap: var(--medium-gap);

        & > ul.abilities {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
            border-radius: var(--medium-gap);
            overflow: hidden;
            background-color: var(--background-color);

            & > li {
                text-wrap: nowrap;
                text-align: center;
                padding: var(--medium-gap);
            }
        }

        & > ul.stats {
            display: grid;
            grid-auto-flow: row;
            gap: var(--medium-gap);

            & > li.stat {
                display: grid;
                grid-template-columns: auto 1fr;
                justify-items: safe;
                gap: var(--large-gap);

                & > span {
                    font-size: large;
                    font-family: monospace;
                    text-align: end;
                }

                & > ul.values {
                    display: flex;
                    gap: var(--medium-gap);
                    align-items: center;
                    justify-items: end;
                    padding: var(--small-gap);
                    border-radius: var(--medium-gap);
                    background-color: var(--background-color);

                    & > li.value {
                        height: calc(var(--large-gap) * 1.2);
                        aspect-ratio: 1;
                        border: 4px solid transparent;
                        border-radius: var(--small-gap);
                        background-color: var(--background-fourth-color);

                        &.filled {
                            background-color: var(--accent-color);
                        }
                    }
                }
            }
        }
    }
</style>
