<script lang="ts">
    import { onMount } from 'svelte';

    import type { RankUpSetting } from '$lib/types/rank';
    import type { PokemonSkill } from '$lib/constants/skills';
    import { rankAchievements, rankUpSettings } from '$lib/constants/rankUpConfigs';
    import type { DbPokemonAttribute, DbPokemonSocial } from '$lib/types/mongo/pokemon';

    import t from '$lib/i18n/i18n.svelte';
    import Dialog from '../fragments/Dialog.svelte';
    import RankUpSkills from './rank-up/RankUpSkills.svelte';
    import RankUpSummary from './rank-up/RankUpSummary.svelte';
    import RankUpSocials from './rank-up/RankUpSocials.svelte';
    import RankUpAttributes from './rank-up/RankUpAttributes.svelte';
    import type { Trainer } from '$lib/types/mongo/trainer';

    type Props = {
        trainer: Trainer;
        isOpen: boolean;
        updateTrainer: (trainer: Trainer) => void;
    };

    let { trainer, isOpen = $bindable(), updateTrainer }: Props = $props();

    let rankUpSetting: RankUpSetting = $state(rankUpSettings[0]);

    let attributes: { stat: DbPokemonAttribute; values: number[] }[] = $state(
        Object.entries(trainer.attributes).map(([stat, value]) => ({
            stat: stat as DbPokemonAttribute,
            values: [value, 5, 0],
        })),
    );

    let socials: { stat: DbPokemonSocial; values: number[] }[] = $state(
        Object.entries(trainer.socials).map(([stat, value]) => ({
            stat: stat as DbPokemonSocial,
            values: [value, 5, 0],
        })),
    );

    let skills: { stat: PokemonSkill; values: number[] }[] = $state(
        Object.entries(trainer.skills).map(([stat, value]) => ({
            stat: stat as PokemonSkill,
            values: [value, 5, 0],
        })),
    );

    let tabs: string[] = ['character.attributes', 'character.socials', 'character.skills', 'character.summary'];
    let currentTab: string = $state(tabs[0]);

    let submit = () => {
        const updatedTrainer = { ...trainer };

        updatedTrainer.attributes = attributes.reduce(
            (acc, { stat, values }) => ({ ...acc, [stat]: values[0] + values[2] }),
            {} as any,
        );

        updatedTrainer.socials = socials.reduce(
            (acc, { stat, values }) => ({ ...acc, [stat]: values[0] + values[2] }),
            {} as any,
        );

        updatedTrainer.skills = skills.reduce(
            (acc, { stat, values }) => ({ ...acc, [stat]: values[0] + values[2] }),
            {} as any,
        );

        updatedTrainer.achievements = rankAchievements[rankUpSetting.to].map((achievement) => [
            achievement,
            false,
        ]);

        updatedTrainer.rank = rankUpSetting.to;
        updateTrainer(updatedTrainer);
        isOpen = false;
    };

    onMount(() => {
        rankUpSetting = rankUpSettings.find((conf) => conf.from === trainer.rank) ?? rankUpSettings[0];
    });
</script>

<Dialog bind:isOpen title={t('home.trainer.action-rank-up')}>
    <h1>{trainer.name}: {rankUpSetting.from} → {rankUpSetting.to}</h1>
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
                onNextTab={() => (currentTab = 'character.socials')}
                attributePoints={rankUpSetting.config.attributePoints}
            ></RankUpAttributes>
        {:else if currentTab === 'character.socials'}
            <RankUpSocials
                {stat}
                bind:socials
                onNextTab={() => (currentTab = 'character.skills')}
                onPrevTab={() => (currentTab = 'character.socials')}
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
                movesUpdates={[[], []]}
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
