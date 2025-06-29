<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageProps } from './$types';

    import t from '$lib/i18n/i18n.svelte';
    import DexEntry from '$lib/components/lodestones/pokemon/DexEntry.svelte';
    import MovesList from '$lib/components/lodestones/pokemon/MovesList.svelte';
    import Evolution from '$lib/components/lodestones/pokemon/Evolution.svelte';
    import AddNewPokemonForm from '$lib/components/forms/AddNewPokemonForm.svelte';
    import BattleStats from '$lib/components/lodestones/pokemon/BattleStats.svelte';
    import GeneratePokemonForm from '$lib/components/forms/GeneratePokemonForm.svelte';
    import type { DbPartnerPokemon } from '$lib/types/mongo/pokemon';
    import { addPokemonToParty } from '$lib/state/pokemon.svelte';

    let { data }: PageProps = $props();
    let { pokemon, moves } = data;

    let isAddPokemonFormOpen: boolean = $state(false);
    let showGeneratePokemonForm: boolean = $state(false);

    const onPokemonCreate = (pokemon: DbPartnerPokemon) => {
        addPokemonToParty(pokemon);
        goto('/', { invalidateAll: true });
    };

    const onPokemonGenerated = (pokemon: DbPartnerPokemon) => {
        addPokemonToParty(pokemon);
        goto('/', { invalidateAll: true });
    };
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
        <button onclick={() => (showGeneratePokemonForm = true)}>🔴 {t('pokedex.pokemon.action-generate')}</button>
    </div>
</div>

{#if showGeneratePokemonForm}
    <GeneratePokemonForm {pokemon} {moves} bind:isOpen={showGeneratePokemonForm} {onPokemonGenerated}></GeneratePokemonForm>
{/if}
{#if isAddPokemonFormOpen}
    <AddNewPokemonForm {pokemon} bind:isOpen={isAddPokemonFormOpen} {onPokemonCreate}></AddNewPokemonForm>
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

        & .actions {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: var(--large-gap);
        }
    }
</style>
