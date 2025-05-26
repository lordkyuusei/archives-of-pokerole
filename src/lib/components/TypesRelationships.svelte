<script lang="ts">
    import t from "$lib/i18n/i18n.svelte";
    import { getPkmnTypeColor } from '$lib/functions/getPkmnTypeColor';

    type Props = {
        relationships: { name: string; value: any[] }[]
    }

    let { relationships }: Props = $props();
</script>

{#each Object.values(relationships) as { name, value: values }}
    {#if values.length > 0}
        <label for={name}>{name}</label>
        <ul id={name}>
            {#each values as value}
                <li style:--bg-color={getPkmnTypeColor(value.name)}>{t(`pokemon.type.${value.name}`)}</li>
            {/each}
        </ul>
    {/if}
{/each}

<style>
    label, li {
        text-transform: capitalize;
    }

    label {
        font-weight: bold;
    }

    ul {
        display: flex;
        flex-wrap: wrap;
        gap: var(--small-gap);
        margin-block: var(--medium-gap);


        & > li {
            margin-inline-start: var(--medium-gap);
            padding: var(--small-gap) var(--large-gap);
            border-radius: var(--medium-gap);
            background-color: var(--bg-color);
        }
    }
</style>
