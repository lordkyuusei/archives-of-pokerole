<script lang="ts">
    import type { DbItem } from '$lib/types/mongo/item';
    import type { WithId } from 'mongodb';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    let pockets = $state(Object.groupBy(data.items, (item) => item.Pocket));

    let activePocketName: string = $state(Object.keys(pockets).length > 0 ? Object.keys(pockets)[0] : '');
    let activePocket: WithId<DbItem>[] = $derived(pockets[activePocketName] ?? []);

    let pocketContent = $derived(Object.groupBy(activePocket, (item) => item.Category));

    let activePocketCategoryName: string = $derived(Object.keys(pocketContent).length > 0 ? Object.keys(pocketContent)[0] : '');

    let activePocketCategory: WithId<DbItem>[] = $derived(pocketContent[activePocketCategoryName] ?? []);
</script>

<section class="wrapper" id="admin">
    <ul class="pockets-list">
        {#each Object.keys(pockets) as pocketName}
            <li class="buttons-group">
                <button class="group" class:selected={pocketName === activePocketName} onclick={() => (activePocketName = pocketName)}>
                    {pocketName}
                </button>
            </li>
        {/each}
    </ul>

    {#if pocketContent}
        <ul class="categories-list">
            {#each Object.keys(pocketContent) as category}
                {@const categoryName = category.length === 0 ? 'Uncategorized' : category}
                <li class="buttons-group">
                    <button class="group" class:selected={category === activePocketCategoryName} onclick={() => (activePocketCategoryName = category)}
                        >{categoryName}</button>
                </li>
            {/each}
        </ul>
    {/if}

    <output class="items-list">
        <table>
            <thead>
                <tr>
                    {#each Object.keys(activePocketCategory[0] ?? {}) as key}
                        <th>{key}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each activePocketCategory as item, i}
                    <tr>
                        {#each Object.values(item) as value}
                            <td align="center">{value}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </output>
</section>

<style>
    section#admin {
        grid-column: 1 / -1;
        height: 100%;

        display: grid;
        grid-template: 'pockets-list' auto 'categories-list' auto 'items-list' 1fr / 1fr;
        gap: var(--large-gap);
        overflow: hidden;

        & > ul.pockets-list,
        & > ul.categories-list {
            display: flex;
            width: 100%;

            & > li {
                flex: 1;

                & > button {
                    width: 100%;
                }
            }
        }

        & > output.items-list {
            overflow-x: auto;

            & > table {
                height: 100%;
            }
        }
    }
</style>
