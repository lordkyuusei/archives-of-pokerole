<script lang="ts">
    import type { DbAbility } from "$lib/types/mongo/ability";
    import type { WithId } from "mongodb";

    type Props = {
        showSearch?: boolean;
        keys: (keyof DbAbility)[];
        value: WithId<DbAbility>;
    };
    let { showSearch = $bindable(), keys, value }: Props = $props();

    const closeSearch = () => showSearch = false;
</script>

<tr>
    {#each keys as key}
        <td class:animate={value[key].length > 12} title={value[key]}>
            <span>
                {value[key]}
            </span>
        </td>
    {/each}
    <td>
        <a href="/abilities/{value['_id']}" data-sveltekit-reload onclick={closeSearch}>.</a>
    </td>
</tr>

<style>
    tr {
        position: relative;
        background: var(--bg-color);

        & > td {
            text-align: center;
            text-wrap: nowrap;
            overflow: hidden;
            
            &.animate {
                margin-inline: var(--large-gap);
                > span {
                    display: inline-block;
                    animation: animateText 20s linear infinite;
                    text-overflow: ellipsis;
                }
            }

            & > a {
                position: absolute;
                width: 100%;
                height: 100%;
                opacity: 0;
                left: 0;
                top: 0;
            }
        }
    }

    @keyframes animateText {
        10% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-100%);
        }
    }
</style>
