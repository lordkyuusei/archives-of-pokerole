<script lang="ts">
    import t from '$lib/i18n/i18n.svelte';

    let { data } = $props();
    let { item } = data;

    let pocketName = $derived(`item-${item["Pocket"].toLocaleLowerCase()}`)
</script>

<div class="infos {pocketName}">
    <div class="id wrapper" data-title="Matricule">
        <h1>{item['Name']}</h1>
        <sub>{t(`item.category.${item['Pocket']}`)} > {t(`item.category.${item['Category']}`)}</sub>
        <q>{item['Description']}</q>
    </div>
    <div class="battle-stats wrapper" data-title={t(`item.data.info`)}>
        <p>{t(`item.data.power`)} {item['TrainerPrice']}</p>
        <p>{t(`item.data.one-use`)} {item['OneUse']}</p>
        <p>{t(`item.data.cures`)} {item['Cures']}</p>
        <code> </code>
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

<div class="moves wrapper {pocketName}" data-title="Effets">
    <h1>{t(`move.data.battle-effects`)}</h1>
    <!-- <blockquote>{move['Effect']}</blockquote> -->
    <h1>{t(`move.data.attributes`)}</h1>
    <!-- {@render decomposeObject(move['Attributes'])} -->
    <br />
    <h1>{t(`move.data.additional-effects`)}</h1>
    <!-- {@render decomposeObject(move['AddedEffects'])} -->
</div>

<div class="learners wrapper {pocketName}" data-title={t(`move.data.learners`)}>
    <ul>
        <!-- {#each pokemons as learner}
            {@const learnedRank = learner['Moves'].find((m) => m['Name'] === move['Name'])?.Learned || 'Starter'}
            {@const rankIcon = getIconFromRank(learnedRank)}
            <li class="learner">
                <img src="{SPRITE_PICTURE_URL}{learner['Number']}.png" alt={learner['Name']} />
                <a href="/pokemon/{learner['_id']}">{learner['Name']}</a>
                <img src="/icons/{rankIcon}" alt={learnedRank} />
            </li>
        {/each} -->
    </ul>
</div>

<style>
    .item-helditem {
        --accent-color: var(--tough);
    }

    .item-traineritems {
        --accent-color: var(--cool);
    }

    .item-evolutionitems {
        --accent-color: var(--cute);
    }

    .item-pokeballs {
        --accent-color: var(--beauty);
    }

    .item-medicine {
        --accent-color: var(--clever);
    }

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
        grid-template: 100% / 100%;
        gap: var(--large-gap);

        & > ul {
            display: grid;
            grid-auto-rows: min-content;
            gap: var(--medium-gap);
            overflow: auto;

            & > li {
                display: grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;

                border-radius: var(--large-gap);
                padding-inline-end: var(--large-gap);
                background-color: var(--background-fourth-color);

                &:hover {
                    background-color: var(--background-third-color);
                }

                & > img:first-child {
                    height: 100%;
                    object-position: 0px -0.5rem;
                }
            }
        }
    }
</style>
