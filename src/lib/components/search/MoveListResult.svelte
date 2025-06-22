<script lang="ts">
    import type { WithId } from 'mongodb';
    import { drawBookBackground } from '$lib/functions/getPkmnTypeColor';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';
    import type { DbMove } from '$lib/types/mongo/move';

    type Props = {
        showSearch?: boolean;
        keys: (keyof DbMove)[];
        value: WithId<DbMove>;
    };

    let { showSearch = $bindable(), keys, value }: Props = $props();

    let lang: Lang = $derived(getLang());

    let type: string = value['Type'].toLowerCase();

const closeSearch = () => (showSearch = false);
</script>

<tr style:--bg-color={drawBookBackground([type])}>
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
        <a href="/moves/{value['_id']}" data-sveltekit-reload onclick={closeSearch}>.</a>
    </td>
</tr>

<style>
    tr {
        position: relative;
        background: var(--bg-color);
        background-blend-mode: overlay;

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
