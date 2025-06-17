<script lang="ts">
    import { onMount } from 'svelte';
    import type { ObjectId, WithId } from 'mongodb';

    import t from "$lib/i18n/i18n.svelte";
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

    type Props = {
        pokemon: DbPartnerPokemon;
        specie: WithId<DbPokemon>;
        moves: WithId<DbMove>[];
        isOpen: boolean;
        updatePokemon: (pokemon: DbPartnerPokemon) => void;
    };

    let { pokemon: pkmn, specie, moves, isOpen = $bindable(), updatePokemon }: Props = $props();

    let rankUpSettingList: RankUpSetting[] = $state([rankUpSettings[0]]);

    let attributes: { stat: DbPokemonAttribute; values: number[] }[] = $state(
        Object.entries(pkmn.attributes).map(([stat, _]) => ({
            stat: stat as DbPokemonAttribute,
            values: [specie[stat], specie[`Max${stat}`], 0],
        })),
    );

    let socials: { stat: DbPokemonSocial; values: number[] }[] = $state(
        Object.entries(pkmn.socials).map(([stat, _]) => ({
            stat: stat as DbPokemonSocial,
            values: [1, 5, 0],
        })),
    );

    let skills: { stat: PokemonSkill; values: number[] }[] = $state(
        Object.entries(pkmn.skills).map(([stat, _]) => ({
            stat: stat as PokemonSkill,
            values: [0, 5, 0],
        })),
    );

    let attributePoints: number = $derived(
        rankUpSettingList.reduce((acc, setting) => acc + setting.config.attributePoints, 0),
    );
    let socialPoints: number = $derived(
        rankUpSettingList.reduce((acc, setting) => acc + setting.config.socialPoints, 0),
    );

    let skillSettingIndex = $state(0);
    let skillSettings: [number, number][] = $derived(
        rankUpSettingList.map((setting, i) => {
            const previousSkillPoints = Array.from({ length: i }).reduce((acc: number, _, j) => {
                return acc + (rankUpSettingList[j]?.config.skillPoints || 0);
            }, 0);
            return [setting.config.skillPoints + previousSkillPoints, setting.config.skillLimit];
        }),
    );

    $inspect(skillSettings);
    let currentSkillSetting: [number, number] = $derived(skillSettings[skillSettingIndex]);

    let insightIndex: number = $derived(attributes.findIndex((attr) => attr.stat === 'Insight'));
    let insightIncrease: number = $derived(attributes[insightIndex].values[2]);

    let learnedMoves: ObjectId[] = $state([]);
    let learnableMoves: WithId<DbMove>[] = $state([]);
    let learnableAmount: number = $derived(specie['Insight'] + insightIncrease + 2 - learnedMoves.length);

    let tabs: string[] = ['character.attributes', 'pokemon.moveset', 'character.socials', 'character.skills', 'character.summary'];
    let currentTab: string = $state(tabs[0]);

    $effect(() => {
        const totalSkillPoints = skills.reduce((acc, skill) => acc + skill.values[2], 0);
        if (totalSkillPoints === currentSkillSetting[0] && skillSettingIndex < skillSettings.length - 1) {
            skillSettingIndex += 1;
        }
    });

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

        updatedPokemon.moves = [...learnedMoves];
        updatePokemon(updatedPokemon);
        isOpen = false;
    };

    onMount(() => {
        const currentRankSettingIndex = rankUpSettings.findIndex((conf) => conf.from === pkmn.rank);
        rankUpSettingList = rankUpSettings.slice(0, currentRankSettingIndex);
        learnableMoves = getLearnableMovesData(moves, specie['Moves'], rankUpSettingList.at(-1).to, pkmn.moves);
    });
</script>

<Dialog bind:isOpen title={t('form.retrain.title')}>
    <h1>{pkmn.nickname}: {rankUpSettings[0].from} → {pkmn.rank}</h1>
    <form>
        <ul class="tabs">
            {#each tabs as tab}
                <li class:selected={currentTab === tab}>{t(`form.${tab}`)}</li>
            {/each}
        </ul>
        {#if currentTab === 'character.attributes'}
            <RankUpAttributes {stat} bind:attributes onNextTab={() => (currentTab = 'pokemon.moveset')} {attributePoints}
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
                {socialPoints}
            ></RankUpSocials>
        {:else if currentTab === 'character.skills'}
            <RankUpSkills
                {stat}
                bind:skills
                onNextTab={() => (currentTab = 'character.summary')}
                onPrevTab={() => (currentTab = 'character.socials')}
                skillPoints={currentSkillSetting[0]}
                skillLimit={currentSkillSetting[1]}
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
                text-indent: var(--medium-gap);
            }

            & > ul {
                display: flex;
                gap: var(--medium-gap);

                padding: var(--small-gap);
                border-radius: var(--medium-gap);
                background-color: var(--background-color);

                & > li {
                    height: calc(var(--large-gap) * 1.2);
                    aspect-ratio: 1;
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
        overflow-x: auto;

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
