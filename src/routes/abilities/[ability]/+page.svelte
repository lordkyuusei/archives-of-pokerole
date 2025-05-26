<script lang="ts">
    import { SPRITE_PICTURE_URL } from '$lib/constants/urls';
    import type { DbAbility } from '$lib/types/mongo/ability';
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import type { WithId } from 'mongodb';

    type Props = {
        pokemons: WithId<DbPokemon>[];
        ability: WithId<DbAbility>;
    };

    let { data } = $props();
    let { pokemons, ability }: Props = data;
</script>

<div class="infos wrapper" data-title="Matricule">
    <h1>{ability['Name']}</h1>
    <q>{ability['Description']}</q>
</div>

<div class="effect wrapper" data-title="Effets">
    <p>{ability['Effect']}</p>
</div>

<div class="learners wrapper" data-title="Compatibilités">
    <ul>
        {#each pokemons as learner}
            <li class="learner">
                <img src="{SPRITE_PICTURE_URL}{learner['Number']}.png" alt={learner['Name']} />
                <a href="/pokemon/{learner['_id']}">{learner['Name']}</a>
            </li>
        {/each}
    </ul>
</div>

<style>
    div.learners {
        grid-column: 3;

        display: grid;
        grid-template: calc(100svh - 8svh - 5rem) / 100%;
        gap: var(--large-gap);

        & > ul {
            display: grid;
            grid-auto-rows: auto;
            gap: var(--medium-gap);
            overflow: auto;

            & > li {
                display: grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;

                border-radius: var(--large-gap);
                padding-inline-end: var(--large-gap);

                & > img:first-child {
                    height: 100%;
                    object-position: 0px -0.75rem;
                    border-radius: var(--medium-gap);
                }
            }
        }
    }
</style>
