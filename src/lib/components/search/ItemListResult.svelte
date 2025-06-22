<script lang="ts">
    import type { WithId } from 'mongodb';
    import { drawBookBackground } from '$lib/functions/getPkmnTypeColor';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';
    import type { DbItem, ItemPocket } from '$lib/types/mongo/item';

    type Props = {
        showSearch?: boolean;
        keys: (keyof DbItem)[];
        value: WithId<DbItem>;
    };

    let { showSearch = $bindable(), keys, value }: Props = $props();

    let lang: Lang = $derived(getLang());

    const closeSearch = () => (showSearch = false);

    const mapPocketToColor: Record<ItemPocket, string> = {
        "Pokeballs": "tough",
        "Medicine": "clever",
        "TrainerItems": "cute",
        "HeldItems": "cool",
        "EvolutionItems": "beauty",
    };
</script>

<tr style:--bg-color="var(--{mapPocketToColor[value["Pocket"]]}">
    {#each keys as key}
        <td>
            {#if key === 'Name'}
                {value[key]}
            {:else}
                {value[key]}
            {/if}
        </td>
    {/each}
    <td>
        <a href="/items/{value['_id']}" data-sveltekit-reload onclick={closeSearch}>.</a>
    </td>
</tr>

<style>
    tr {
        position: relative;
        background: var(--bg-color);

        & > td {
            text-align: center;
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
</style>
