<script lang="ts">
    import type { WithId } from 'mongodb';
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import { drawBookBackground } from '$lib/functions/getPkmnTypeColor';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';

    type Props = {
        showSearch?: boolean;
        keys: (keyof DbPokemon)[];
        value: WithId<DbPokemon>;
    };

    let { showSearch = $bindable(), keys, value }: Props = $props();

    let lang: Lang = $derived(getLang());

    let types: string[] = value['Type2'] === '' ? [value['Type1'].toLowerCase()] : [value['Type1'].toLowerCase(), value['Type2'].toLowerCase()];

    const closeSearch = () => (showSearch = false);
</script>

<tr style:--bg-color={drawBookBackground(types)}>
    {#each keys as key}
        <td>
            {#if key === 'Name'}
                {value['I18n'][lang]}
            {:else}
                {value[key]}
            {/if}
        </td>
    {/each}
    <td>
        <a href="/pokemon/{value['_id']}" data-sveltekit-reload onclick={closeSearch}>.</a>
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
