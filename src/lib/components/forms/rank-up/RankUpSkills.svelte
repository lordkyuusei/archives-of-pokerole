<script lang="ts">
    import type { Snippet } from 'svelte';
 
    import t from "$lib/i18n/i18n.svelte";
    import type { PokemonSkill } from '$lib/constants/skills';

    type Props = {
        skills: { stat: PokemonSkill; values: number[] }[];
        skillPoints: number;
        skillLimit: number;
        onNextTab: () => void;
        onPrevTab: () => void;
        stat: Snippet<[string, number, number, number]>;
    };

    let { skills = $bindable(), skillPoints, skillLimit, stat, onNextTab, onPrevTab }: Props = $props();

    let skillsIncreaseVal: number = $derived(skills.reduce((acc, attr) => acc + attr.values[2], 0));
    let skillsIncreasable: boolean = $derived(skillsIncreaseVal < skillPoints);
    let skillsDecreasable: boolean = $derived(0 < skillsIncreaseVal && skillsIncreaseVal <= skillPoints);
</script>

<rank-up-skills>
    <h2>{t('form.training.remaining-points')} {skillPoints - skillsIncreaseVal}</h2>
    <ul>
        {#each skills as skill}
            {@const value = skill.values[0] + skill.values[2]}
            {@const decrDisabled = !(skillsDecreasable && skill.values[2] > 0)}
            {@const incrDisabled = !(skillsIncreasable && value < skill.values[1] && value < skillLimit)}
            <li>
                <button class="round" disabled={decrDisabled} onclick={() => (skill.values[2] -= 1)}> ➖ </button>
                {@render stat(skill.stat, skill.values[0], value, skill.values[1])}
                <button class="round" disabled={incrDisabled} onclick={() => (skill.values[2] += 1)}> ➕ </button>
            </li>
        {/each}
    </ul>
    <div style="display: grid; grid-auto-flow: column; gap: var(--large-gap);">
        <button onclick={() => onPrevTab()}>{t('previous')}</button>
        <button onclick={() => onNextTab()} disabled={skillPoints - skillsIncreaseVal !== 0}>{t('next')}</button>
    </div>
</rank-up-skills>

<style>
    rank-up-skills {
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: var(--large-gap);
        min-height: 0;

        & > ul {
            display: grid;
            grid-template: repeat(4, 1fr) / repeat(3, 1fr);
            gap: var(--medium-gap) var(--larger-gap);
            margin-inline: var(--larger-gap);
            margin-bottom: var(--larger-gap);

            & > li {
                display: grid;
                grid-template: 1fr / auto 1fr auto;
                gap: var(--large-gap);
                align-items: end;
            }
        }
    }
</style>
