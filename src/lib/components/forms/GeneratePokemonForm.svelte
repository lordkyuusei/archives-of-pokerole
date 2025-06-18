<script lang="ts">
    import type { WithId } from 'mongodb';
    import { getContext } from 'svelte';

    import { pokemonRankOrder } from '$lib/constants/pokemonRank';
    import { rankUpSettings } from '$lib/constants/rankUpConfigs';
    import { convertPokemonToPartner } from '$lib/functions/convertPokemonToPartner';
    import { findLowestRankPossible, generatePokemon } from '$lib/functions/generatePokemon';
    import t from '$lib/i18n/i18n.svelte';
    import { getBoxes } from '$lib/state/boxes.svelte';
    import type { DbNature } from '$lib/types/mongo/nature';
    import type { DbPartnerPokemon, DbPokemon, DbPokemonRank } from '$lib/types/mongo/pokemon';
    import Dialog from '../fragments/Dialog.svelte';

    type Props = {
        pokemon: WithId<DbPokemon>;
        isOpen: boolean;
        onPokemonGenerated: (pokemon: DbPartnerPokemon) => void;
    };

    let { pokemon, isOpen = $bindable(), onPokemonGenerated }: Props = $props();
    let boxes = $derived(getBoxes());

    const natures = (getContext<DbNature[]>('natures') as unknown as () => DbNature[])();
    const minimumRank = findLowestRankPossible([pokemon]);
    const allowedRanks = Object.keys(pokemonRankOrder).slice(pokemonRankOrder[minimumRank]);

    const generatePokemonForm = (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => {
        event.preventDefault();
        const { elements } = event.currentTarget;

        const rank = (elements.namedItem('rank') as HTMLSelectElement).value as DbPokemonRank;
        const boxId = (elements.namedItem('box-id') as HTMLSelectElement).value;

        const rankSettingIndex = rankUpSettings.findIndex((r) => r.to === rank);
        if (rankSettingIndex === -1) return;

        const randomNature = natures[Math.floor(Math.random() * natures.length)].Nature.split(' ')[0];
        const { rawPokemonData } = generatePokemon(pokemon, pokemonRankOrder[rankUpSettings[rankSettingIndex].to], randomNature, boxId);
        const partnerPokemon = convertPokemonToPartner(pokemon, rawPokemonData);

        onPokemonGenerated(partnerPokemon);
        isOpen = false;
    };
</script>

<Dialog title={t('form.generator.title')} bind:isOpen>
    <h1>{t('form.generator.generate-pokemon').replace('$1', pokemon['Name'])}</h1>
    <form onsubmit={generatePokemonForm}>
        <div>
            <fieldset>
                <legend>Rang</legend>
                <label for="rank">Rang du Pokémon</label>
                <select id="rank" name="rank">
                    {#each allowedRanks as rank}
                        <option value={rank}>{rank}</option>
                    {/each}
                </select>
            </fieldset>
            <fieldset>
                <legend>Sauvegarde</legend>
                <label for="box-id">Boîte</label>
                <select id="box-id" name="box-id">
                    {#each boxes as box}
                        <option value={box.id}>{box.name}</option>
                    {/each}
                </select>
            </fieldset>
        </div>
        <button type="submit">
            {t('form.generator.generate-selected').replace('$1', `${pokemon['Name']}`)}
        </button>
    </form>
</Dialog>

<style>
    form {
        display: grid;
        grid-template-rows: 1fr auto;
        height: 100%;
        gap: var(--large-gap);

        & div {
            display: flex;
            flex-direction: column;
            gap: var(--large-gap);
            overflow-y: auto;

            > fieldset {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-auto-rows: 1fr;
                align-items: center;
                gap: var(--medium-gap);

                padding: var(--medium-gap);
                border-radius: var(--medium-gap);
                background-color: var(--background-fourth-color);

                & > legend {
                    grid-column: 1 / -1;

                    color: var(--background-color);
                    border-radius: var(--small-gap);
                    padding-inline: var(--medium-gap);
                    background-color: var(--second-color);
                }
            }
        }
    }
</style>
