<script lang="ts">
    type Props = {
        name: string;
        value: number;
        maxValue: number;
        minValue?: number;
        onUpdate?: null | ((value: number) => void);
    };

    let { name, value = $bindable(), maxValue, onUpdate = null, minValue = 0 }: Props = $props();
</script>

<partner-attribute class:actions={onUpdate} class="data-output {name.toLocaleLowerCase()}">
    <label for={name}>{name}</label>
    <ul id={name}>
        {#each new Array(maxValue) as _, i}
            <li class:base-stat={i < minValue} class:crossed={i < value}></li>
        {/each}
    </ul>
    {#if onUpdate}
        <button class="small group" onclick={() => onUpdate(Math.max(minValue, value - 1))}>-1</button>
        <button class="small group" onclick={() => onUpdate(Math.min(maxValue, value + 1))}>+1</button>
    {/if}
</partner-attribute>

<style>
    partner-attribute {
        --color: var(--text-color);
        --bg-color: var(--background-fourth-color);

        height: 100%;

        display: grid;
        align-items: center;
        justify-items: center;
        grid-template:
            'label' auto
            'values' 1fr / 1fr;

        padding: var(--medium-gap);
        color: var(--color);
        background-color: var(--bg-color);

        &.tough, &.costaud {
            --color: hsl(from var(--tough) h s calc(l + 5));
            --bg-color: hsl(from var(--color) h s calc(l - 50));
        }

        &.cool {
            --color: hsl(from var(--cool) h s calc(l + 5));
            --bg-color: hsl(from var(--color) h s calc(l - 50));
        }

        &.beauty, &.beauté {
            --color: hsl(from var(--beauty) h s calc(l + 5));
            --bg-color: hsl(from var(--color) h s calc(l - 50));
        }

        &.cute, &.mignon {
            --color: hsl(from var(--cute) h s calc(l + 5));
            --bg-color: hsl(from var(--color) h s calc(l - 50));
        }

        &.clever, &.intelligence {
            --color: hsl(from var(--clever) h s calc(l + 5));
            --bg-color: hsl(from var(--color) h s calc(l - 50));
        }

        & > label {
            text-shadow: 0px 0px var(--medium-gap) var(--background-color);
            grid-area: label;
            font-weight: bold;
            text-transform: uppercase;
        }

        &.actions {
            grid-template:
            '.       label  .      ' 1fr
            'btn-dec values btn-inc' 1fr / 0.25fr 1fr 0.25fr;
            align-items: inherit;

            & > ul {
                border-radius: 0;
            }

            & > button {
                padding: var(--small-gap);
                border: none;
                height: auto;
            }

            & > button:first-of-type {
                grid-area: btn-dec;
            }

            & > button:last-of-type {
                grid-area: btn-inc;
            }
        }

        & > ul {
            grid-area: values;

            display: flex;
            align-items: center;
            gap: var(--small-gap);
            justify-content: center;
            overflow-x: auto;

            padding: var(--small-gap);
            border-radius: var(--small-gap);
            background-color: var(--background-color);

            & > li {
                aspect-ratio: 1;
                width: var(--large-gap);
                border-radius: var(--smaller-gap);
                background-color: var(--background-fourth-color);

                &.crossed {
                    background-color: var(--text-color);
                }

                &.base-stat {
                    background-color: var(--accent-color);
                }
            }
        }
    }
</style>
