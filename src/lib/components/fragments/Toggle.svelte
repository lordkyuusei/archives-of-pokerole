<script lang="ts">
    type Props = {
        toggled: boolean;
        onToggle?: (value: boolean) => void;
    };

    let { toggled = $bindable(false), onToggle = () => {} }: Props = $props();
</script>

<toggle>
    <input
        class="switch"
        type="checkbox"
        bind:checked={toggled}
        oninput={({ currentTarget }) => onToggle(currentTarget.checked)}
    />
</toggle>

<style>
    toggle {
        position: relative;

        display: grid;
        grid-template: 1fr / 1fr;

        width: 3rem;
        aspect-ratio: 2 / 1;
        padding: var(--smaller-gap);
        background-color: var(--background-third-color);
        border-radius: var(--medium-gap);
        overflow: hidden;

        &::before,
        & > input {
            grid-area: 1 / 1;
        }

        & > input {
            appearance: none;
            height: 100%;
            width: 100%;
            z-index: 1;
            cursor: pointer;
        }

        &::before {
            content: '';
            z-index: 1;
            width: 50%;
            height: 100%;
            cursor: pointer;
            background-color: var(--text-color);
            border-radius: calc(var(--medium-gap) - var(--smaller-gap));
            transition: margin-left var(--transition-duration) var(--transition-function);
        }

        &:has(> input:checked)::before {
            margin-left: calc(50% - 0.5px);
        }
    }
</style>
