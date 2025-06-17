<script lang="ts">
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { DbPartnerPokemon } from '$lib/types/mongo/pokemon';
    import Dialog from '../fragments/Dialog.svelte';

    type Props = {
        isOpen: boolean;
        importPokemon: (pokemon: DbPartnerPokemon) => void;
    };

    let { isOpen = $bindable(), importPokemon }: Props = $props();

    let importText: string = $state('');

    let submit = () => {
        const newPokemon = JSON.parse(importText) as DbPartnerPokemon;
        newPokemon.id = crypto.randomUUID();
        newPokemon.box = 0;
        importPokemon(newPokemon);
        isOpen = false;
    };

    let format = () => {
        importText = JSON.stringify(JSON.parse(importText), null, 2);
    }
</script>

<Dialog title="Importer" bind:isOpen>
    <h1>{t('form.import.import')}</h1>
    <form>
        <textarea bind:value={importText} placeholder="Copier le Pokémon ici" rows="10" required></textarea>
        <button onclick={format} type="button" class="primary">{t('form.import.action-format')}</button>
        <button onclick={submit} type="submit" class="primary">{t('form.import.action-import')}</button>
    </form>
</Dialog>

<style>
    form {
        display: grid;
        grid-template-rows: 1fr auto;
        gap: var(--medium-gap);
    }
</style>
