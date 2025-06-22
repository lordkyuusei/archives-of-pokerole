<script lang="ts">
    type Props = {
        name?: string;
        labels?: string[]
        toggled?: number;
        onToggle?: (value: number) => void;
    };

    let { toggled = $bindable(2), labels = ['Non', 'N/A', 'Oui'], name = 'default', onToggle = () => {} }: Props = $props();

    const mapDirectionToOrder: { [key: number]: string } = {
        1: 'left',
        2: 'middle',
        3: 'right',
    };
</script>

<div style:display="flex" style:gap="var(--medium-gap)">
    <toggle>
        {#each [1, 2, 3] as choice, i}
            <input
                style:grid-area={mapDirectionToOrder[choice]}
                id="{name}-{i}"
                name="{name}"
                class="threeggle"
                type="radio"
                value={choice}
                bind:group={toggled} />
        {/each}
    </toggle>
    <output>
        {labels[toggled - 1]}
    </output>
</div>

<style>
    toggle {
        position: relative;

        display: grid;
        grid-template: 'left middle right' 1fr / 1fr 1fr 1fr;

        height: var(--larger-gap);
        aspect-ratio: 3 / 1;
        overflow: hidden;
        padding: var(--smaller-gap);
        border-radius: var(--medium-gap);
        background-color: var(--background-third-color);

        &::before {
            grid-area: 1 / 1 / 1 / -1;
        }

        & > input {
            opacity: 0;
            height: 100%;
            z-index: 2;
            cursor: pointer;
        }

        &::before {
            content: '';
            z-index: 1;
            aspect-ratio: 1;
            height: calc(var(--larger-gap) - var(--smaller-gap) * 2);
            cursor: pointer;
            background-color: var(--text-color);
            border-radius: calc(var(--medium-gap) - var(--smaller-gap));
            transition: margin-left var(--transition-duration) var(--transition-function);
        }

        &:has(> input:checked) {
            background: linear-gradient(to right, var(--accent-color) 0%, var(--text-color) 100%);

            &::before {
                margin-left: calc(50% - (calc(var(--larger-gap) - var(--smaller-gap) * 2) / 2));
                border: var(--smaller-gap) solid var(--background-color);
                background-color: var(--text-color);
            }
        }

        &:has(> input:first-child:checked) {
            background: var(--text-color);

            &::before {
                margin-left: calc(0% - 0.5px);
                border: var(--smaller-gap) solid var(--background-color);
                background-color: var(--text-color);
            }
        }

        &:has(> input:last-child:checked) {
            background: var(--accent-color);

            &::before {
                margin-left: calc(67% - 0.5px);
                border: var(--smaller-gap) solid var(--background-color);
                background-color: var(--text-color);
            }
        }
    }
</style>
