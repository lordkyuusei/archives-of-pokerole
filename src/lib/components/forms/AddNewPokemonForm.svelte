<script lang="ts">
    import { getContext } from 'svelte';
    import type { WithId } from 'mongodb';
    import { goto } from '$app/navigation';

    import t from '$lib/i18n/i18n.svelte';
    import { PokemonSkills } from '$lib/constants/skills';
    import type { DbNature } from '$lib/types/mongo/nature';
    import { pokemonRankOrder } from '$lib/constants/pokemonRank';
    import { AILMENTS } from '$lib/constants/ailments';
    import { convertPokemonToPartner } from '$lib/functions/convertPokemonToPartner';
    import type { DbPartnerPokemon, DbPokemon, DbPokemonMove, DbPokemonRank } from '$lib/types/mongo/pokemon';

    import Dialog from '../fragments/Dialog.svelte';

    type Props = { pokemon: WithId<DbPokemon>; isOpen: boolean, onPokemonCreate: (pokemon: DbPartnerPokemon) => void };
    let { pokemon: pkmn, isOpen = $bindable(), onPokemonCreate }: Props = $props();

    let natures: () => WithId<DbNature>[] = getContext('natures');

    let attributes: { stat: string; values: number[] }[] = $state([
        { stat: 'Strength', values: [pkmn['Strength'], pkmn['MaxStrength']] },
        { stat: 'Dexterity', values: [pkmn['Dexterity'], pkmn['MaxDexterity']] },
        { stat: 'Vitality', values: [pkmn['Vitality'], pkmn['MaxVitality']] },
        { stat: 'Special', values: [pkmn['Special'], pkmn['MaxSpecial']] },
        { stat: 'Insight', values: [pkmn['Insight'], pkmn['MaxInsight']] },
    ]);

    let socials: { stat: string; value: number }[] = $state([
        { stat: 'Tough', value: 1 },
        { stat: 'Cool', value: 1 },
        { stat: 'Beauty', value: 1 },
        { stat: 'Cute', value: 1 },
        { stat: 'Clever', value: 1 },
    ]);

    let loyaltyHappiness: { stat: string; value: number }[] = $state([
        { stat: 'Loyalty', value: 2 },
        { stat: 'Happiness', value: 2 },
    ]);

    let battlesVictories: { stat: string; value: number }[] = $state([
        { stat: 'Battles', value: 0 },
        { stat: 'Victories', value: 0 },
    ]);

    let statuses = $state(AILMENTS);

    let skills: { stat: string; value: number }[] = $state(
        PokemonSkills.map((skill) => ({
            stat: skill,
            value: 0,
        })),
    );

    let selectedRank: DbPokemonRank = $state('Starter');
    let movesetSize: number = $derived(2 + attributes[4].values[0]);
    let moveset: DbPokemonMove[] = $derived(
        pkmn['Moves'].filter((move) => {
            const rank = pokemonRankOrder[selectedRank];
            return pokemonRankOrder[move.Learned] <= rank;
        }),
    );

    let learnCapacity: number = $derived(Math.min(movesetSize, moveset.length));

    const submit = (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => {
        event.preventDefault();
        event.stopPropagation();

        const pokemon = [...event.currentTarget.elements]
            .filter((x) => ['SELECT', 'INPUT'].includes(x.tagName))
            .reduce((newPokemon, { name, value }) => ({ ...newPokemon, [name]: value }), {} as any);

        pokemon["Box"] = 0;
        const partner = convertPokemonToPartner(pkmn, pokemon);
        onPokemonCreate(partner);
    };
</script>

<Dialog bind:isOpen title={t('form.pokemon.add')}>
    <h1>{pkmn['Name']}</h1>
    <form method="post" onsubmit={submit}>
        <h2>{t('form.character.matricule')}</h2>
        <fieldset class="matricule">
            <label for="Nickname">{t('form.pokemon.nickname')}</label>
            <input type="text" name="Nickname" placeholder="Nickname" />
            <label for="Rank">{t('form.character.rank')}</label>
            <select name="Rank" bind:value={selectedRank}>
                {#each Object.keys(pokemonRankOrder) as rank}
                    <option value={rank}>{rank}</option>
                {/each}
            </select>
            <label for="Nature">{t('form.character.nature')}</label>
            <select name="Nature">
                {#each natures() as nature}
                    <option value={nature['Name']}>{nature['Name']} (conf: {nature['Confidence']})</option>
                {/each}
            </select>
            <label for="Nature">{t('form.pokemon.status')}</label>
            <select name="Status">
                {#each statuses as status}
                    <option value={status}>{t(`pokemon.ailment.${status}`)}</option>
                {/each}
            </select>
            <label for="Shiny">{t('form.pokemon.is-shiny')}</label>
            <select name="Shiny">
                <option value={false} selected>{t('no')}</option>
                <option value={true}>{t('yes')}</option>
            </select>
            {#each loyaltyHappiness as attr}
                <label for={attr.stat}>{t(`form.pokemon.${attr.stat}`)}</label>
                <input id={attr.stat} name={attr.stat} type="number" min="0" bind:value={attr.value} max="4" />
            {/each}
            {#each battlesVictories as attr}
                <label for={attr.stat}>{t(`form.pokemon.${attr.stat}`)}</label>
                <input id={attr.stat} name={attr.stat} type="number" min="0" bind:value={attr.value} />
            {/each}
            <label for="HeldItem">{t('form.pokemon.held-item')}</label>
            <input type="text" name="HeldItem" />
        </fieldset>
        <h2>{t('form.character.attributes')}</h2>
        <fieldset>
            <ul class="attributes">
                {#each attributes as attr}
                    <li>
                        <label for="ATTR_{attr.stat}">{t(`character.attribute.${attr.stat}`)}</label>
                        <input
                            id="ATTR_{attr.stat}"
                            name="ATTR_{attr.stat}"
                            type="range"
                            min="1"
                            bind:value={attr.values[0]}
                            max={attr.values[1]}
                        />
                        <output>{attr.values[0]}</output>
                    </li>
                {/each}
            </ul>
        </fieldset>
        <h2>{t(`form.character.socials`)}</h2>
        <fieldset>
            <ul class="socials">
                {#each socials as attr}
                    <li>
                        <label for="SOC_{attr.stat}">{t(`character.attribute.${attr.stat}`)}</label>
                        <input
                            id="SOC_{attr.stat}"
                            name="SOC_{attr.stat}"
                            type="range"
                            min="1"
                            bind:value={attr.value}
                            max="5"
                        />
                        <output>{attr.value}</output>
                    </li>
                {/each}
            </ul>
        </fieldset>
        <h2>{t(`form.pokemon.moveset`)}</h2>
        <fieldset>
            <ul class="moveset">
                {#each new Array(learnCapacity) as _, i}
                    <select name="MOVE_{i + 1}">
                        {#each moveset as move}
                            <option value={move['Name']}>{move['Name']}</option>
                        {/each}
                    </select>
                {/each}
            </ul>
        </fieldset>
        <h2>{t(`form.character.skills`)}</h2>
        <fieldset>
            <ul class="skills">
                {#each skills as attr}
                    <li>
                        <label for="SKILL_{attr.stat}">{t(`character.attribute.${attr.stat}`)}</label>
                        <input
                            id="SKILL_{attr.stat}"
                            name="SKILL_{attr.stat}"
                            type="range"
                            min="0"
                            bind:value={attr.value}
                            max="5"
                        />
                        <output>{attr.value}</output>
                    </li>
                {/each}
            </ul>
        </fieldset>
        <button type="submit">{t(`form.actions.add`)}</button>
    </form>
</Dialog>

<style>
    form {
        display: grid;
        gap: var(--small-gap);
        overflow-y: auto;
        grid-auto-rows: min-content;

        & > fieldset.matricule {
            display: grid;
            grid-template: auto 1fr auto 1fr / repeat(5, 1fr);

            gap: var(--small-gap) var(--large-gap);

            & > label {
                padding-inline-start: var(--medium-gap);

                &:nth-child(-n + 10) {
                    grid-row: 1;
                }

                &:nth-child(n + 10) {
                    grid-row: 3;
                }
            }

            & > :not(label):nth-child(-n + 11) {
                grid-row: 2;
            }

            & > :not(label):nth-child(n + 11) {
                grid-row: 4;
            }
        }
    }

    ul {
        display: flex;
        flex-wrap: wrap;
        gap: var(--large-gap);
        padding-block: var(--medium-gap);
        padding-inline: var(--large-gap);
    }

    ul:is(.attributes, .socials, .skills) {
        justify-content: start;

        & > li {
            display: grid;
            grid-template: auto auto / auto auto;
            gap: var(--small-gap) var(--large-gap);

            & > :nth-child(1) {
                grid-area: 1 / 1 / 1 / -1;
            }
            & > :nth-child(2) {
                grid-area: 2 / 1;
            }
            & > :nth-child(3) {
                grid-area: 2 / 2;
            }
        }
    }

    ul.moveset {
        justify-content: start;
    }
</style>
