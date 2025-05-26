<script lang="ts">
    import type { ObjectId, WithId } from 'mongodb';

    import t from "$lib/i18n/i18n.svelte";
    import type { DbMove } from '$lib/types/mongo/move';
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import MovesList from '$lib/components/lodestones/pokemon/MovesList.svelte';

    type Props = {
        specie: DbPokemon;
        learnedMoves: ObjectId[];
        learnableMoves: WithId<DbMove>[];
        learnableAmount: number;
        insightIncrease: number;
        onNextTab: () => void;
        onPrevTab: () => void;
    };

    let {
        specie,
        learnedMoves = $bindable(),
        learnableMoves,
        learnableAmount,
        insightIncrease,
        onNextTab,
        onPrevTab,
    }: Props = $props();

    let canLearnNewMoves =
        insightIncrease !== 0 ||
        (insightIncrease === 0 && learnableAmount !== 0) ||
        (learnableMoves.length !== 0 && learnableAmount !== 0);

    const onMoveSelection = (move: WithId<DbMove>) => {
        const moveIndex = learnedMoves.findIndex((m) => m === move['_id']);
        if (moveIndex === -1 && learnableAmount === 0) return false;

        if (moveIndex !== -1) {
            learnedMoves = learnedMoves.toSpliced(moveIndex, 1);
        } else if (learnableAmount > 0) {
            learnedMoves = [...learnedMoves, move['_id']];
        }
        return true;
    };
</script>

<rank-up-moveset>
    <h2>{t('form.training.new-moveset')} {learnableAmount}</h2>
    {#if canLearnNewMoves}
        <MovesList pokemon={specie} moves={learnableMoves} {onMoveSelection}></MovesList>
    {:else}
        <p>{t('form.training.error-new-moveset')}</p>
    {/if}
    <div style="display: grid; grid-auto-flow: column; gap: var(--medium-gap);">
        <button onclick={() => onPrevTab()}>{t('previous')}</button>
        <button
            onclick={() => onNextTab()}
            disabled={learnableAmount !== 0 && learnableMoves.length !== learnedMoves.length}>{t('next')}</button
        >
    </div>
</rank-up-moveset>

<style>
    rank-up-moveset {
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: var(--small-gap);
    }
</style>
