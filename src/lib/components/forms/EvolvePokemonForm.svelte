<script lang="ts">
    import { onMount } from 'svelte';
    import type { ObjectId, WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { DbMove } from '$lib/types/mongo/move';
    import type { RankUpSetting } from '$lib/types/rank';
    import type { PokemonSkill } from '$lib/constants/skills';
    import { getIdFromName } from '$lib/functions/getIdFromName';
    import { rankUpSettings } from '$lib/constants/rankUpConfigs';
    import { getLearnableMovesData } from '$lib/functions/getLearnableMoves';
    import type {
        DbPartnerPokemon,
        DbPokemon,
        DbPokemonAttribute,
        DbPokemonSocial,
    } from '$lib/types/mongo/pokemon';

    import Dialog from '../fragments/Dialog.svelte';
    import RankUpMoves from './rank-up/RankUpMoves.svelte';
    import RankUpSkills from './rank-up/RankUpSkills.svelte';
    import RankUpSummary from './rank-up/RankUpSummary.svelte';
    import RankUpSocials from './rank-up/RankUpSocials.svelte';
    import EvolutionConditions from './EvolutionConditions.svelte';
    import RankUpAttributes from './rank-up/RankUpAttributes.svelte';
    import type { SpeciesAndMoves } from '$lib/types/api/pokemons';

    type Props = {
        pokemon: WithId<DbPartnerPokemon>;
        specie: WithId<DbPokemon>;
        moves: WithId<DbMove>[];
        isOpen: boolean;
        updatePokemon: (pokemon: WithId<DbPartnerPokemon>) => void;
    };

    let { pokemon: pkmn, specie, moves, isOpen = $bindable(), updatePokemon }: Props = $props();

    let currentSpecie: WithId<DbPokemon> = $state(specie);
    let evolutionSpecies: WithId<DbPokemon>[] = $state([]);
    let rankUpSettingList: RankUpSetting[] = $state([rankUpSettings[0]]);

    let attributes: { stat: DbPokemonAttribute; values: number[] }[] = $state(
        Object.entries(pkmn.attributes).map(([stat, _]) => ({
            stat: stat as DbPokemonAttribute,
            values: [currentSpecie[stat], currentSpecie[`Max${stat}`], 0],
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
    let currentSkillSetting: [number, number] = $derived(skillSettings[skillSettingIndex]);

    let insightIndex: number = $derived(attributes.findIndex((attr) => attr.stat === 'Insight'));
    let insightIncrease: number = $derived(attributes[insightIndex].values[2]);

    let learnedMoves: ObjectId[] = $state([]);
    let allLearnableMoves: WithId<DbMove>[] = $state([]);
    let learnableMoves: WithId<DbMove>[] = $state([]);
    let learnableAmount: number = $derived(currentSpecie['Insight'] + insightIncrease + 2 - learnedMoves.length);

    let tabs: string[] = [
        'evolution.conditions',
        'character.attributes',
        'pokemon.moveset',
        'character.socials',
        'character.skills',
        'character.summary',
    ];
    let currentTab: string = $state(tabs[0]);

    $effect(() => {
        const totalSkillPoints = skills.reduce((acc, skill) => acc + skill.values[2], 0);
        if (totalSkillPoints === currentSkillSetting[0] && skillSettingIndex < skillSettings.length - 1) {
            skillSettingIndex += 1;
        }
    });

    const startEvolution = (newSpecie: WithId<DbPokemon>) => {
        currentSpecie = newSpecie;

        const currentSpecieLearnableMoves = getLearnableMovesData(
            allLearnableMoves,
            specie.Moves,
            rankUpSettingList.at(-1)?.to,
            pkmn.moves,
        );

        const evolutionLearnableMoves = getLearnableMovesData(
            allLearnableMoves,
            currentSpecie.Moves,
            rankUpSettingList.at(-1)?.to,
        );

        const uniqueMovesNames = new Set([
            ...currentSpecieLearnableMoves.map((m) => m.Name),
            ...evolutionLearnableMoves.map((m) => m.Name),
        ]);

        const uniqueMoves = new Set(
            [...currentSpecieLearnableMoves, ...evolutionLearnableMoves].filter((move) =>
                uniqueMovesNames.has(move.Name),
            ),
        );

        learnableMoves = [...uniqueMoves];
        attributes = Object.entries(pkmn.attributes).map(([stat, _]) => ({
            stat: stat as DbPokemonAttribute,
            values: [currentSpecie[stat], currentSpecie[`Max${stat}`], 0],
        }));
        currentTab = 'character.attributes';
    };

    let submit = () => {
        const updatedPokemon = { ...pkmn };

        updatedPokemon.specie = [currentSpecie._id, currentSpecie['Number']];
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

    onMount(async () => {
        const currentRankSettingIndex = rankUpSettings.findIndex((conf) => conf.from === pkmn.rank);
        const evolvable = specie['Evolutions'].filter((e) => e['To']).map((e) => getIdFromName(e['To']));
        if (evolvable.length === 0) return;

        const evolvableData = await fetch(`/api/pokemons?species=${evolvable.join(',')}&moves=${pkmn.moves.join(',')}`);
        const { species, moves: specieLearnableMoves }: SpeciesAndMoves = await evolvableData.json();

        evolutionSpecies = species;
        rankUpSettingList = rankUpSettings.slice(0, currentRankSettingIndex);
        allLearnableMoves = specieLearnableMoves;
    });
</script>

<Dialog bind:isOpen title="{t('evolution.condition.to')} ... ?">
    <h1>{t('evolution.condition.to')} ... ?</h1>
    <form>
        <ul class="tabs">
            {#each tabs as tab}
                <li class:selected={currentTab === tab}>{t(`form.${tab}`)}</li>
            {/each}
        </ul>
        {#if currentTab === 'evolution.conditions'}
            <EvolutionConditions species={evolutionSpecies} onNextTab={startEvolution}></EvolutionConditions>
        {:else if currentTab === 'character.attributes'}
            <RankUpAttributes
                {stat}
                bind:attributes
                onNextTab={() => (currentTab = 'pokemon.moveset')}
                {attributePoints}
            ></RankUpAttributes>
        {:else if currentTab === 'pokemon.moveset'}
            <RankUpMoves
                specie={currentSpecie}
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
                {learnedMoves}
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
            display: grid;
            grid-template: auto 1fr / 1fr;
            gap: var(--medium-gap);
            margin-inline: var(--large-gap);

            & > legend {
                font-size: larger;
                font-weight: bold;
                text-align: center;
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
                background-color: var(--background-color);

                &.selected {
                    background-color: var(--background-fourth-color);
                }
            }
        }
    }
</style>
