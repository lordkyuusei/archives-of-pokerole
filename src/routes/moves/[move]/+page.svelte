<script lang="ts">
    import t from '$lib/i18n/i18n.svelte';
    import { SPRITE_PICTURE_URL } from '$lib/constants/urls';
    import { getIconFromRank } from '$lib/functions/getIconFromData';
    import { getPkmnTypeColor } from '$lib/functions/getPkmnTypeColor';
    import { computeCoverage, fetchFullTypes } from '$lib/functions/getTypesRelationship';

    import Popover from '$lib/components/fragments/Popover.svelte';
    import TypesRelationships from '$lib/components/TypesRelationships.svelte';

    let { data } = $props();
    let { pokemons, move } = data;

    let isOpen: boolean = $state(false);
    let typesRef: HTMLUListElement | null = $state(null);

    let typeName: string = $state(move['Type'].toLocaleLowerCase());
    let relationships = computeCoverage(fetchFullTypes([typeName]));

    $inspect(move["AddedEffects"]["FixedDamage"])
</script>

<div class="infos">
    <div class="id wrapper" data-title="Matricule">
        <h1>{move['Name']}</h1>
        <sub>{t(`move.category.${move['Category']}`)}</sub>
        <q>{move['Description']}</q>
    </div>
    <div class="battle-stats wrapper" data-title={t(`move.data.info`)}>
        <ul
            class="types"
            bind:this={typesRef}
            onmouseover={() => (isOpen = true)}
            onmouseleave={() => (isOpen = false)}
            onfocus={() => (isOpen = !isOpen)}
        >
            <li style:background={getPkmnTypeColor(typeName)}>{t(`pokemon.type.${typeName}`)}</li>
        </ul>
        <Popover element={typesRef} {isOpen} position="top">
            <TypesRelationships {relationships}></TypesRelationships>
        </Popover>
        <p>{t(`move.data.power`)} {move['Power']}</p>
        <p>
            {t(`move.data.accuracy`)}
            {move['Accuracy1']}
            {#if move['Accuracy2']}
                + {move['Accuracy2']}
            {/if}
        </p>
        <p>
            {t(`move.data.damage`)}
            {t(`character.attribute.${move['Damage1']}`)}
            {#if move['Damage2']}
                + {t(`character.attribute.${move['Damage2']}`)}
            {/if}
        </p>
        <code>
            {t(`move.data.target`)}{move['Target']}
        </code>
    </div>
</div>

{#snippet decomposeObject(obj: any | any[])}
    {#if Array.isArray(obj)}
        <ul>
            {#each obj as item}
                <li>{@render decomposeObject(item)}</li>
            {/each}
        </ul>
    {:else if typeof obj === 'object'}
        <ul>
            {#each Object.entries(obj) as [key, value]}
                <li>{key}: {@render decomposeObject(value)}</li>
            {/each}
        </ul>
    {:else}
        {obj}
    {/if}
{/snippet}

<div class="moves wrapper" data-title="Effets">
    <h1>{t(`move.data.battle-effects`)}</h1>
    <blockquote>{move['Effect']}</blockquote>
    <h1>{t(`move.data.attributes`)}</h1>
    {@render decomposeObject(move['Attributes'])}
    <br />
    <h1>{t(`move.data.additional-effects`)}</h1>
    {@render decomposeObject(move['AddedEffects'])}
</div>

<div class="learners wrapper" data-title={t(`move.data.learners`)}>
    <ul>
        {#each pokemons as learner}
            {@const learnedRank = learner['Moves'].find((m) => m['Name'] === move['Name'])?.Learned || 'Starter'}
            {@const rankIcon = getIconFromRank(learnedRank)}
            <li class="learner">
                <img src="{SPRITE_PICTURE_URL}{learner['Number']}.png" alt={learner['Name']} />
                <a href="/pokemon/{learner['_id']}">{learner['Name']}</a>
                <img src="/icons/{rankIcon}" alt={learnedRank} />
            </li>
        {/each}
    </ul>
</div>

<style>
    div.infos {
        grid-column: 1;

        display: grid;
        grid-template-rows: 1fr 1fr;
        gap: var(--large-gap);

        & > .id {
            display: grid;
            grid-auto-flow: row;
            grid-auto-rows: min-content;
            padding-inline: var(--large-gap);
            align-content: center;

            & > h1 {
                max-width: 10em;
            }

            & > q {
                margin-block: var(--large-gap);
                font-style: italic;
                quotes: '« ' ' »';
                padding: var(--medium-gap);
                background-color: var(--background-third-color);
            }
        }

        & > .battle-stats {
            display: grid;
            grid-auto-flow: row;
            grid-auto-rows: min-content;
            gap: var(--medium-gap);

            & > :not(ul) {
                padding: var(--medium-gap);
                background-color: var(--background-third-color);
            }

            & > ul.types {
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 1fr;
                border-radius: var(--medium-gap);
                overflow: hidden;

                & > li {
                    text-wrap: nowrap;
                    text-align: center;
                    padding: var(--medium-gap);
                }
            }
        }
    }

    ul ul {
        margin-inline-start: var(--medium-gap);
    }

    div.moves {
        grid-column: 2;

        & > :not(h1) {
            margin-block: var(--medium-gap);
            padding: var(--medium-gap);
            background-color: var(--background-third-color);
        }
    }

    div.learners {
        grid-column: 3;

        display: grid;
        grid-template: 1fr / 100%;
        gap: var(--large-gap);

        & > ul {
            display: flex;
            flex-direction: column;
            gap: var(--medium-gap);
            overflow: auto;

            & > li {
                display: grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;

                border-radius: var(--large-gap);
                padding-inline-end: var(--large-gap);
                background-color: var(--background-third-color);

                & > img:first-child {
                    height: 100%;
                    object-position: 0px -0.75rem;
                    border-radius: var(--medium-gap);
                }
            }
        }
    }
</style>
