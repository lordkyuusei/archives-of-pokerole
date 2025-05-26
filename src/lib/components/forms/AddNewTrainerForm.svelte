<script lang="ts">
    import { getContext } from 'svelte';
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';    
    import { goto } from '$app/navigation';
    import { TrainerSkills } from '$lib/constants/skills';
    import type { DbNature } from '$lib/types/mongo/nature';
    import { pokemonRankOrder } from '$lib/constants/pokemonRank';
    import type { DbPokemonAttribute, DbPokemonRank } from '$lib/types/mongo/pokemon';
    import { convertCharacterToTrainer } from '$lib/functions/convertCharacterToTrainer';

    import Dialog from '../fragments/Dialog.svelte';
    import { ageConfigs } from '$lib/constants/ageConfigs';
    import { getAgeConfigFromAge } from '$lib/functions/getAgeConfigFromAge';
    import { rankUpSettings } from '$lib/constants/rankUpConfigs';
    import type { RankUpConfig } from '$lib/types/rank';

    type Props = { isOpen: boolean };
    let { isOpen = $bindable() }: Props = $props();

    let natures: () => WithId<DbNature>[] = getContext('natures');

    let attributes: { stat: DbPokemonAttribute; values: number[] }[] = $state([
        { stat: 'Strength', values: [1, 5] },
        { stat: 'Dexterity', values: [1, 5] },
        { stat: 'Vitality', values: [1, 5] },
        { stat: 'Insight', values: [1, 5] },
    ]);

    let socials: { stat: string; value: number }[] = $state([
        { stat: 'Tough', value: 1 },
        { stat: 'Cool', value: 1 },
        { stat: 'Beauty', value: 1 },
        { stat: 'Cute', value: 1 },
        { stat: 'Clever', value: 1 },
    ]);

    let skills: { stat: string; value: number }[] = $state(
        TrainerSkills.map((skill) => ({
            stat: skill,
            value: 0,
        })),
    );

    let age: number = $state(18);
    let ageScoreModifiers = $derived(getAgeConfigFromAge(age));

    let selectedRank: DbPokemonRank = $state('Starter');
    let rankScoreModifiers = $derived(rankUpSettings.slice(0, pokemonRankOrder[selectedRank]).reduce((acc, setting) => ({
            attributePoints: acc.attributePoints + setting.config.attributePoints,
            socialPoints: acc.socialPoints + setting.config.socialPoints,
            skillPoints: acc.skillPoints + setting.config.skillPoints,
        }
        ), { attributePoints: 0, socialPoints: 0, skillPoints: 0 })
    );

    const submit = (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => {
        event.preventDefault();
        event.stopPropagation();

        const trainerData: { [x: string]: string} = [...event.currentTarget.elements]
            .filter((x) => ['SELECT', 'INPUT'].includes(x.tagName))
            .reduce((newTrainer, { name, value }) => ({ ...newTrainer, [name]: value }), {});

        const trainer = convertCharacterToTrainer(trainerData);
        localStorage.setItem('trainer', JSON.stringify(trainer));

        goto('/');
    };
</script>

<Dialog bind:isOpen={isOpen} title={t('form.trainer.title-add')}>
    <h1>{t('form.trainer.title-add')}</h1>
    <form method="post" onsubmit={submit}>
        <h2>{t('form.character.matricule')}</h2>
        <fieldset class="matricule">
            <label for="Name">{t('form.trainer.name')}</label>
            <input type="text" name="Name" placeholder="Name" />
            <label for="Rank">{t('form.character.rank')}</label>
            <select name="Rank" bind:value={selectedRank}>
                {#each Object.keys(pokemonRankOrder) as rank}
                    <option value={rank}>{rank}</option>
                {/each}
            </select>
            <label for="Age">{t('form.trainer.age')}</label>
            <input type="number" name="Age" min="1" placeholder="18" bind:value={age}> 
            <label for="Nature">{t('form.character.nature')}</label>
            <select name="Nature">
                {#each natures() as nature}
                    <option value={nature['Name']}>{nature['Name']} (conf: {nature['Confidence']})</option>
                {/each}
            </select>
            <label for="Concept">{t('form.trainer.concept')}</label>
            <input type="text" name="Concept" placeholder="Concept">
            <label for="Money">{t('form.trainer.starting-money')}</label>
            <input type="number" name="Money" placeholder="1500">
        </fieldset>
        <h2>{t('form.character.attributes')} ({selectedRank} {ageScoreModifiers.label}: +{ageScoreModifiers.points[0] + rankScoreModifiers.attributePoints})</h2>
        <fieldset>
            <ul class="attributes">
                {#each attributes as attr}
                    <li>
                        <label for="ATTR_{attr.stat}">{attr.stat}</label>
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
        <h2>{t('form.character.socials')} ({selectedRank} {ageScoreModifiers.label}: +{ageScoreModifiers.points[1] + rankScoreModifiers.socialPoints})</h2>
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
        <h2>{t('form.character.socials')} ({selectedRank} {ageScoreModifiers.label}: +{rankScoreModifiers.skillPoints})</h2>
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
        <button type="submit">{t('form.actions.add')}</button>
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
            grid-template: auto 1fr auto 1fr / repeat(3, 1fr);

            gap: var(--small-gap) var(--large-gap);

            & > label {
                padding-inline-start: var(--medium-gap);

                &:nth-child(-n + 6) {
                    grid-row: 1;
                }

                &:nth-child(n + 6) {
                    grid-row: 3;
                }
            }

            & > :not(label):nth-child(-n + 7) {
                grid-row: 2;
            }

            & > :not(label):nth-child(n + 7) {
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
</style>
