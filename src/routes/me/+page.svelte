<script lang="ts">
    import { onMount } from 'svelte';
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import { type Trainer } from '$lib/types/mongo/trainer';
    import TrnrIdentitySocials from '$lib/components/TrnrIdentity&Socials.svelte';
    import TrnrAttributesSkills from '$lib/components/TrnrAttributes&Skills.svelte';
    import AddNewTrainerForm from '$lib/components/forms/AddNewTrainerForm.svelte';
    import RankUpTrainerForm from '$lib/components/forms/RankUpTrainerForm.svelte';

    type Props = {
        data: {
            species: WithId<{ Name: string }>[];
        };
    };

    let { data }: Props = $props();
    let { species } = data;

    let isSaving: boolean = $state(false);
    let debounceTimeout: NodeJS.Timeout | null = null;

    let trainer: Trainer | null = $state(null);
    let showCreateTrainerForm: boolean = $state(false);
    let showRankUpTrainerForm: boolean = $state(false);

    const saveTrainer = () => {
        if (trainer === null) return;

        isSaving = true;
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            localStorage.setItem('trainer', JSON.stringify(trainer));
            isSaving = false;
        }, 1000);
    };

    const changeHp = (value: number) => {
        if (!trainer) return;

        trainer.hp = Math.max(0, Math.min(trainer.hp + value, 4 + trainer.attributes['Vitality']));
        saveTrainer();
    };

    const changeWp = (value: number) => {
        if (!trainer) return;

        trainer.will = Math.max(0, Math.min(trainer.will + value, trainer.attributes['Insight'] + 2));
        saveTrainer();
    };

    const changePokedex = (value: any) => {
        if (!trainer) return;

        trainer.pokedex = value;
        saveTrainer();
    };

    const changeMoney = (value: any) => {
        if (!trainer) return;

        trainer.money = Math.max(0, trainer.money + value);
        saveTrainer();
    };

    const changeNotes = (notes: string) => {
        if (!trainer) return;

        trainer.notes = notes;
        saveTrainer();
    };

    const changeBadges = (value: any) => {
        if (!trainer) return;

        trainer.badges = value;
        saveTrainer();
    };
    const changeBattlePocket = (value: any) => {
        if (!trainer) return;

        trainer.battlePocket = value;
        saveTrainer();
    };
    const changeHealingBag = (value: any) => {
        if (!trainer) return;

        trainer.healingBag = value;
        saveTrainer();
    };
    const changeMainPocket = (value: any) => {
        if (!trainer) return;

        trainer.mainPocket = value;
        saveTrainer();
    };

    const updateTrainer = (trnr: Trainer) => {
        if (!trnr) return;

        trainer = trnr;
        saveTrainer();
    };

    onMount(() => {
        const trainerJson = localStorage.getItem('trainer');
        trainer = trainerJson ? JSON.parse(trainerJson) : null;
    });
</script>

<trainer-sheet>
    <actions-list class="wrapper" data-title="Actions">
        <button onclick={() => (showCreateTrainerForm = true)}>{t('home.trainer.action-create')}</button>
        <button onclick={() => (showRankUpTrainerForm = true)}>{t('home.trainer.action-rank-up')}</button>
    </actions-list>
    <trainer-infos class="wrapper">
        {#if trainer}
            <TrnrAttributesSkills {trainer}></TrnrAttributesSkills>
            <TrnrIdentitySocials
                {species}
                {trainer}
                {changeHp}
                {changeWp}
                {changeNotes}
                {changePokedex}
                {changeMoney}
                {changeBadges}
                {changeBattlePocket}
                {changeHealingBag}
                {changeMainPocket}
            ></TrnrIdentitySocials>
        {/if}
    </trainer-infos>
</trainer-sheet>

{#if showCreateTrainerForm}
    <AddNewTrainerForm bind:isOpen={showCreateTrainerForm}></AddNewTrainerForm>
{/if}

{#if trainer && showRankUpTrainerForm}
    <RankUpTrainerForm bind:isOpen={showRankUpTrainerForm} {trainer} {updateTrainer}></RankUpTrainerForm>
{/if}

<style>
    trainer-sheet {
        grid-column: 1 / -1;

        display: grid;
        grid-template: auto 1fr / 1fr;
        gap: var(--large-gap);

        & > actions-list {
            grid-area: 1 / 1 / 1 / -1;

            display: flex;
            gap: var(--large-gap);
        }

        & > trainer-infos {
            grid-column: 1;

            display: grid;
            grid-template: 1fr / 1fr 2.5fr;
        }

        & > pkmn-actions,
        & > pkmn-actions > * {
            display: flex;
            flex-direction: column;
            gap: var(--large-gap);
        }

        & > pkmn-actions > pkmn-infos {
            background-image: var(--url);
            background-position: center center;
            background-size: cover;
            background-blend-mode: hard-light;
        }
    }
</style>
