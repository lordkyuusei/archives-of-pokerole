<script lang="ts">
    import t from '$lib/i18n/i18n.svelte';
    import Dialog from '../fragments/Dialog.svelte';
    import type { Trainer } from '$lib/types/mongo/trainer';

    type Props = {
        isOpen: boolean;
        importTrainer: (trainer: Trainer) => void;
    };

    let { isOpen = $bindable(), importTrainer }: Props = $props();

    let importText: string = $state('');

    let submit = () => {
        const newTrainer = JSON.parse(importText) as Trainer;
        importTrainer(newTrainer);
        isOpen = false;
    };

    let format = () => {
        importText = JSON.stringify(JSON.parse(importText), null, 2);
    };
</script>

<Dialog title="Importer" bind:isOpen>
    <h1>{t('form.import.import-trainer')}</h1>
    <form>
        <textarea bind:value={importText} placeholder="Copier le Dresseur ici" rows="10" required></textarea>
        <button onclick={format} type="button" class="primary">{t('form.import.action-format')}</button>
        <button onclick={submit} type="submit" class="primary">{t('form.import.action-import-trainer')}</button>
    </form>
</Dialog>

<style>
    form {
        display: grid;
        grid-template-rows: 1fr auto;
        gap: var(--medium-gap);
    }
</style>
