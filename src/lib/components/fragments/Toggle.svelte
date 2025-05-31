<script lang="ts">
    type Props = {
        name?: string;
        toggled: boolean;
        onToggle?: (value: boolean) => void;
    };

    let { toggled = $bindable(false), name = 'default', onToggle = () => {} }: Props = $props();
</script>

<toggle>
    <input
        id={name}
        {name}
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
        overflow: hidden;
        padding: var(--smaller-gap);
        border-radius: var(--medium-gap);
        background-color: var(--background-third-color);

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

        &:has(> input:checked) {
            background-color: var(--accent-color);

            &::before {
                margin-left: calc(50% - 0.5px);
                border: var(--smaller-gap) solid var(--background-color);
                background-color: var(--text-color);
            }
        }
    }
</style>
