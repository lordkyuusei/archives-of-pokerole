<script lang="ts">
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { Box } from '$lib/types/box';
    import type { DbPartnerPokemon } from '$lib/types/mongo/pokemon';

    import Dialog from '../fragments/Dialog.svelte';

    type Props = {
        isOpen: boolean;
        boxes: Box[];
        pokemons: WithId<DbPartnerPokemon>[];
        updateBoxes: (boxes: Box[]) => void;
    };

    let { isOpen = $bindable(), boxes, pokemons, updateBoxes }: Props = $props();

    let currentBoxes: Box[] = $state(boxes.filter(b => b.id !== 0));

    let addNewBox = () => {
        currentBoxes = [
            ...currentBoxes,
            {
                id: parseInt(crypto.getRandomValues(new Uint32Array(1))[0].toString()),
                name: `${t('boxes.form.new-box-name') + ' ' + (currentBoxes.length + 1)}`,
            },
        ];
    };

    let deleteBox = (boxId: number) => {
        currentBoxes = currentBoxes.filter((b) => b.id !== boxId);
    };

    const updateBoxesWrapper = (boxes: Box[]) => {
        updateBoxes(boxes);
        isOpen = false;
    };
</script>

<Dialog bind:isOpen title={t('boxes.form.title-box')}>
    <h1>{t('boxes.form.title-box')}</h1>
    <form>
        <ul class="boxes-list">
            {#if currentBoxes.length === 0}
                <li class="box empty">{t('boxes.form.no-boxes')}</li>
            {/if}
            {#each currentBoxes as box, i (box.id)}
                <li class="box">
                    <label for="box-{box.id}">{box.name} ({box.id})</label>
                    <input type="text" bind:value={currentBoxes[i].name} />
                    <button onclick={() => deleteBox(box.id)}>{t('boxes.form.action-del')}</button>
                </li>
            {/each}
        </ul>
        <p>{t('boxes.form.action-del-details')}</p>
        <button onclick={() => addNewBox()}>{t('boxes.form.action-new')}</button>
    </form>
    <button class="" onclick={() => updateBoxesWrapper([boxes[0], ...currentBoxes])}>{t('finish')}</button>
</Dialog>

<style>
    form {
        display: grid;
        grid-template: 1fr auto auto / 1fr;
        padding-block: var(--medium-gap);
        gap: var(--small-gap);
        overflow-y: auto;

        & > ul.boxes-list {
            display: flex;
            flex-direction: column;
            gap: var(--medium-gap);

            & > li.box {
                display: grid;
                grid-template: 'label label' auto 'input button' auto / 1fr auto;
                gap: var(--medium-gap);

                & > label {
                    grid-area: label;
                    font-weight: bold;
                }
            }
        }
    }
</style>
