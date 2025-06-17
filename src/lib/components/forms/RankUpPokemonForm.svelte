<script lang="ts">
    import { onMount } from 'svelte';
    import type { ObjectId, WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { DbMove } from '$lib/types/mongo/move';
    import type { RankUpSetting } from '$lib/types/rank';
    import type { PokemonSkill } from '$lib/constants/skills';
    import { rankUpSettings } from '$lib/constants/rankUpConfigs';
    import { getLearnableMovesData } from '$lib/functions/getLearnableMoves';
    import type { DbPartnerPokemon, DbPokemon, DbPokemonAttribute, DbPokemonSocial } from '$lib/types/mongo/pokemon';

    import Dialog from '../fragments/Dialog.svelte';
    import RankUpMoves from './rank-up/RankUpMoves.svelte';
    import RankUpSkills from './rank-up/RankUpSkills.svelte';
    import RankUpSummary from './rank-up/RankUpSummary.svelte';
    import RankUpSocials from './rank-up/RankUpSocials.svelte';
    import RankUpAttributes from './rank-up/RankUpAttributes.svelte';
    import { getIdFromName } from '$lib/functions/getIdFromName';
    
    type Props = {
        pokemon: DbPartnerPokemon;
        specie: WithId<DbPokemon>;
        moves: WithId<DbMove>[];
        isOpen: boolean;
        updatePokemon: (pokemon: DbPartnerPokemon) => void;
    };

    let { pokemon: pkmn, specie, moves, isOpen = $bindable(), updatePokemon }: Props = $props();

    let rankUpSetting: RankUpSetting = $state(rankUpSettings[0]);

    let attributes: { stat: DbPokemonAttribute; values: number[] }[] = $state(
        Object.entries(pkmn.attributes).map(([stat, value]) => ({
            stat: stat as DbPokemonAttribute,
            values: [value, specie[`Max${stat}`], 0],
        })),
    );

    let socials: { stat: DbPokemonSocial; values: number[] }[] = $state(
        Object.entries(pkmn.socials).map(([stat, value]) => ({
            stat: stat as DbPokemonSocial,
            values: [value, 5, 0],
        })),
    );

    let skills: { stat: PokemonSkill; values: number[] }[] = $state(
        Object.entries(pkmn.skills).map(([stat, value]) => ({
            stat: stat as PokemonSkill,
            values: [value, 5, 0],
        })),
    );

    let insightIndex: number = $derived(attributes.findIndex((attr) => attr.stat === 'Insight'));
    let insightIncrease: number = $derived(attributes[insightIndex].values[2]);

    let learnedMoves: ObjectId[] = $state([]);
    let learnableMoves: WithId<DbMove>[] = $state([]);
    let learnableMissingAmount: number = $derived(pkmn.attributes['Insight'] + 2 - pkmn.moves.length);
    let initLearnableAmount: number = $derived(Math.max(insightIncrease, learnableMissingAmount));
    let learnableAmount: number = $derived(initLearnableAmount - learnedMoves.length);

    let tabs: string[] = ['character.attributes', 'pokemon.moveset', 'character.socials', 'character.skills', 'character.summary'];
    let currentTab: string = $state(tabs[0]);

    let submit = () => {
        const updatedPokemon = { ...pkmn };

        updatedPokemon.attributes = attributes.reduce(
            (acc, { stat, values }) => ({ ...acc, [stat]: values[0] + values[2] }),
            {} as any,
        );

        updatedPokemon.socials = socials.reduce(
            (acc, { stat, values }) => ({ ...acc, [stat]: values[0] + values[2] }),
            {} as any,
        );

        updatedPokemon.skills = skills.reduce(
            (acc, { stat, values }) => ({ ...acc, [stat]: values[0] + values[2] }),
            {} as any,
        );

        updatedPokemon.rank = rankUpSetting.to;
        updatedPokemon.moves = [...updatedPokemon.moves, ...learnedMoves.map(x => x.toString())];
        updatePokemon(updatedPokemon);
        isOpen = false;
    };

    onMount(() => {
        rankUpSetting = rankUpSettings.find((conf) => conf.from === pkmn.rank) ?? rankUpSettings[0];
        const notLearnedMoves = specie['Moves'].filter(m => !pkmn.moves.includes(getIdFromName(m.Name)));
        learnableMoves = getLearnableMovesData(moves, notLearnedMoves, rankUpSetting.to);
    });
</script>

<Dialog bind:isOpen title={t('form.rank-up.title')}>
    <h1>{pkmn.nickname}: {rankUpSetting.from} → {rankUpSetting.to}</h1>
    <form>
        <ul class="tabs">
            {#each tabs as tab}
                <li class:selected={currentTab === tab}>{t(`form.${tab}`)}</li>
            {/each}
        </ul>
        {#if currentTab === 'character.attributes'}
            <RankUpAttributes
                {stat}
                bind:attributes
                onNextTab={() => (currentTab = 'pokemon.moveset')}
                attributePoints={rankUpSetting.config.attributePoints}
            ></RankUpAttributes>
        {:else if currentTab === 'pokemon.moveset'}
            <RankUpMoves
                {specie}
                bind:learnedMoves
                {learnableMoves}
                {learnableAmount}
                {insightIncrease}
                onNextTab={() => (currentTab = 'character.socials')}
                onPrevTab={() => (currentTab = 'character.attributes')}
            ></RankUpMoves>
        {:else if currentTab === 'character.socials'}
            <RankUpSocials
                {stat}
                bind:socials
                onNextTab={() => (currentTab = 'character.skills')}
                onPrevTab={() => (currentTab = 'pokemon.moveset')}
                socialPoints={rankUpSetting.config.socialPoints}
            ></RankUpSocials>
        {:else if currentTab === 'character.skills'}
            <RankUpSkills
                {stat}
                bind:skills
                onNextTab={() => (currentTab = 'character.summary')}
                onPrevTab={() => (currentTab = 'character.socials')}
                skillPoints={rankUpSetting.config.skillPoints}
                skillLimit={rankUpSetting.config.skillLimit}
            ></RankUpSkills>
        {:else}
            <RankUpSummary
                {stat}
                movesUpdates={[pkmn.moves, learnedMoves]}
                attrUpdates={attributes.filter((attr) => attr.values[2] > 0)}
                socialUpdates={socials.filter((attr) => attr.values[2] > 0)}
                skillUpdates={skills.filter((attr) => attr.values[2] > 0)}
                onPrevTab={() => (currentTab = 'character.skills')}
                onSubmit={() => submit()}
            ></RankUpSummary>
        {/if}
    </form>
</Dialog>

{#snippet stat(name: string, base: number, value: number, max: number)}
    <fieldset>
        <legend>{name}</legend>
        <ul>
            {#each Array.from({ length: max }) as _, i}
                <li class:base={i < base} class:bonus={i >= base && i < value}></li>
            {/each}
        </ul>
    </fieldset>

    <style>
        fieldset {
            display: flex;
            flex-direction: column;
            gap: var(--medium-gap);

            & > legend {
                font-size: larger;
                font-weight: bold;
                text-align: center;
                text-indent: var(--medium-gap);
            }

            & > ul {
                display: flex;
                gap: var(--medium-gap);

                padding: var(--small-gap);
                border-radius: var(--medium-gap);
                background-color: var(--background-color);

                & > li {
                    aspect-ratio: 1;
                    height: calc(var(--larger-gap));
                    border-radius: var(--large-gap);
                    border: 4px solid transparent;
                    border-radius: var(--small-gap);
                    background-color: var(--background-fourth-color);

                    &.base {
                        background-color: var(--accent-color);
                    }

                    &.bonus {
                        background-color: var(--text-color);
                    }
                }
            }
        }
    </style>
{/snippet}

<style>
    form {
        display: grid;
        grid-template-rows: auto 1fr;
        gap: var(--medium-gap);
        overflow: hidden;

        & > ul.tabs {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;

            & > li {
                font-size: larger;
                border-radius: 0;
                width: 100%;
                text-align: center;
                padding-block: var(--small-gap);
                background-color: var(--background-color);

                &.selected {
                    background-color: var(--background-fourth-color);
                }
            }
        }
    }
</style>
