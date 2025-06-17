<script lang="ts">
    type Props = {
        name: string;
        value?: string | number;
        wrapper?: boolean;
        large?: boolean;
        children?: any;
    };
    let { name, value, large, wrapper, children }: Props = $props();
</script>

<character-property class:large class:actions={children} class:wrapper>
    <label for={name}>{name}</label>
    {#if value !== null && value !== undefined}
        <output id={name} {name}>
            <span>
                {value}
            </span>
            {#if children}
                {@render children()}
            {/if}
        </output>
    {:else}
        {@render children()}
    {/if}
</character-property>

<style>
    character-property {
        display: grid;
        grid-template: 1fr / 1fr 2fr;
        align-items: center;
        gap: var(--small-gap);
        height: 100%;

        padding: var(--small-gap);
        border-radius: var(--medium-gap);

        color: var(--background-color);
        background-color: var(--accent-color);
        
        &.actions:not(.wrapper) {
            & > output {
                display: grid;
                grid-template-columns: 1fr 0.5fr 0.5fr;
                padding: var(--smaller-gap) var(--smaller-gap) var(--smaller-gap) var(--medium-gap);
            }
        }

        & > label {
            font-size: medium;
            font-weight: bold;
            padding-inline: var(--small-gap);
        }
        
        & > output {
            height: 100%;
            display: flex;
            align-items: center;
            
            padding-inline: var(--medium-gap);
            border-radius: var(--small-gap);
            
            color: var(--text-color);
            background-color: var(--background-color);
            position: relative;
        }
        
        &.large {
            color: var(--text-color);
            background-color: var(--background-color);

            & > label {
                font-weight: bold;
                font-size: large;
            }

            & > output {
                color: var(--background-color);
                background-color: var(--accent-color);
            }
        }
    }
</style>
