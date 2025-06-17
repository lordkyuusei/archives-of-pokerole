<script lang="ts">
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import Dialog from '$lib/components/fragments/Dialog.svelte';
    import type { DbPartnerPokemon } from '$lib/types/mongo/pokemon';

    type Props = {
        isOpen: boolean;
        pokemon: DbPartnerPokemon;
        updatePokemon: (pokemon: DbPartnerPokemon) => void;
    };

    let { isOpen = $bindable(), pokemon, updatePokemon }: Props = $props();
</script>

<Dialog title={t('form.learnmove.title')} bind:isOpen>
    <h1>Not yet.</h1>
</Dialog>

<style></style>
