<script lang="ts">
    import type { WithId } from 'mongodb';
    import { onMount } from 'svelte';

    import TrnrAttributesSkills from '$lib/components/TrnrAttributes&Skills.svelte';
    import TrnrIdentitySocials from '$lib/components/TrnrIdentity&Socials.svelte';
    import AddNewTrainerForm from '$lib/components/forms/AddNewTrainerForm.svelte';
    import ImportTrainerForm from '$lib/components/forms/ImportTrainerForm.svelte';
    import RankUpTrainerForm from '$lib/components/forms/RankUpTrainerForm.svelte';
    import t from '$lib/i18n/i18n.svelte';
    import { getTrainer, setTrainer } from '$lib/state/trainer.svelte';
    import type { DbPokemonShort } from '$lib/types/mongo/pokemon';
    import { type Trainer } from '$lib/types/mongo/trainer';

    type Props = {
        data: {
            species: WithId<DbPokemonShort>[];
        };
    };

    let { data }: Props = $props();
    let { species } = data;

    let isSaving: boolean = $state(false);
    let debounceTimeout: NodeJS.Timeout | null = null;

    let trainer = $derived(getTrainer());
    let showImportDialog: boolean = $state(false);
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

    const updateTrainer = (trnr: Trainer) => {
        if (!trnr) return;

        trainer = trnr;
        saveTrainer();
    };

    const importTrainer = (trnr: any) => {
        if (!trnr) return;

        setTrainer(trnr);
    };

    const exportTrainer = () => {
        if (!trainer) return;

        const data = JSON.stringify(trainer);
        navigator.clipboard.writeText(data).then(() => {
            alert(trainer?.name + ' copié dans le presse-papiers.');
        });
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
        <button onclick={() => (showImportDialog = true)}>{t('home.trainer.action-import')}</button>
        <button onclick={() => exportTrainer()}>{t('home.trainer.action-export')}</button>
    </actions-list>
    <trainer-infos class="wrapper">
        {#if trainer}
            <TrnrAttributesSkills {trainer}></TrnrAttributesSkills>
            <TrnrIdentitySocials {species}></TrnrIdentitySocials>
        {:else}
            <p>{t('home.trainer.err-no-trainer')}</p>
        {/if}
    </trainer-infos>
</trainer-sheet>

{#if showCreateTrainerForm}
    <AddNewTrainerForm bind:isOpen={showCreateTrainerForm}></AddNewTrainerForm>
{/if}

{#if showImportDialog}
    <ImportTrainerForm bind:isOpen={showImportDialog} {importTrainer}></ImportTrainerForm>
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

            display: grid;
            grid-template: 'create rank-up . import export' 1fr / auto auto 1fr auto auto;
            gap: var(--large-gap);

            & > :nth-child(3) {
                grid-column: 4;
            }
        }

        & > trainer-infos {
            grid-column: 1;

            display: grid;
            grid-template: 1fr / 1fr 2.5fr;
        }
    }
</style>
