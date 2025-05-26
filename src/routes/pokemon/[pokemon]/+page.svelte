<script lang="ts">
    import type { PageProps } from './$types';

    import t from '$lib/i18n/i18n.svelte';
    import DexEntry from '$lib/components/lodestones/pokemon/DexEntry.svelte';
    import MovesList from '$lib/components/lodestones/pokemon/MovesList.svelte';
    import Evolution from '$lib/components/lodestones/pokemon/Evolution.svelte';
    import AddNewPokemonForm from '$lib/components/forms/AddNewPokemonForm.svelte';
    import BattleStats from '$lib/components/lodestones/pokemon/BattleStats.svelte';

    let { data }: PageProps = $props();
    let { pokemon, moves } = data;

    let isAddPokemonFormOpen: boolean = $state(false);
</script>

<div class="infos">
    <DexEntry {pokemon}></DexEntry>
    <BattleStats {pokemon}></BattleStats>
</div>

<MovesList {pokemon} {moves}></MovesList>

<div class="evolutions-actions">
    <Evolution {pokemon}></Evolution>
    <div class="actions wrapper" data-title="Actions">
        <button onclick={() => (isAddPokemonFormOpen = true)}>🔴 {t('pokedex.pokemon.action-add-party')}</button>
    </div>
</div>

{#if isAddPokemonFormOpen}
    <AddNewPokemonForm {pokemon} bind:isOpen={isAddPokemonFormOpen}></AddNewPokemonForm>
{/if}

<style>
    div.infos {
        grid-column: 1;

        display: grid;
        grid-template-rows: auto 1fr;
        gap: var(--large-gap);
    }

    div.evolutions-actions {
        grid-column: 3;

        display: grid;
        grid-template-rows: 1fr auto;
        gap: var(--large-gap);
    }
</style>
