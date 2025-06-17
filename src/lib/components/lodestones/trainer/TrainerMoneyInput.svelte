<script lang="ts">
    import { fly } from "svelte/transition";
    import t from "$lib/i18n/i18n.svelte";

    type Props = {
        money: number;
        onMoneyUpdate: (newAmount: number) => void;
    };

    let { money, onMoneyUpdate }: Props = $props();

    let showMoneyInput: boolean = $state(false);
    let isIncrease: boolean = $state(false);
</script>

<button
    class="group"
    onclick={() => {
        showMoneyInput = !showMoneyInput;
        isIncrease = true;
    }}>+💲</button
>
<button
    class="group"
    onclick={() => {
        showMoneyInput = !showMoneyInput;
        isIncrease = false;
    }}>-💲</button
>

{#if showMoneyInput}
    <input
        transition:fly={{ y: 0, duration: 200 }}   
        type="number"
        placeholder={t(`trainer.money.${isIncrease ? 'increase' : 'decrease'}`)}
        onkeyup={({ key, currentTarget }) => {
            if (key === 'Enter') {
                const newValue = isIncrease
                    ? Math.min(money + currentTarget.valueAsNumber, 999_999)
                    : Math.max(money - currentTarget.valueAsNumber, 0);
                showMoneyInput = false;
                onMoneyUpdate(newValue);
            }
        }}
    />
{/if}

<style>
    input {
        --size: 95%;

        z-index: 2;
        position: absolute;
        bottom: -100%;
        right: calc((100% - var(--size)) / 2);
        width: var(--size);
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border: 2px solid var(--accent-color);
        border-top: none;
        box-shadow: 0px var(--small-gap) var(--large-gap) var(--background-color);
    }
</style>
