<script lang="ts">
    import t from "$lib/i18n/i18n.svelte";
    import Dialog from "../fragments/Dialog.svelte";

    type Props = {
        nickname: string;
        specie: string;
        isOpen: boolean;
        releasePokemon: () => void;
    };

    let { nickname, specie, isOpen = $bindable(), releasePokemon }: Props = $props();

    const releasePokemonConfirm = () => {
        releasePokemon();
        isOpen = false;
    };
</script>

<Dialog bind:isOpen title="Relâcher un Pokémon">
    <h1>{nickname} ({specie})</h1>
    <p>
        {t('form.release.confirm').replace('$1', nickname).replace('$2', specie)}
    </p>
    <form>
        <button class="primary" type="submit" onclick={() => releasePokemonConfirm()}>{t('yes')}</button>
        <button class="secondary" type="button" onclick={() => (isOpen = false)}>{t('no')}</button>
    </form>
</Dialog>

<style>
    form {
        display: flex;
        justify-content: end;
        gap: var(--large-gap);
    }
</style>
